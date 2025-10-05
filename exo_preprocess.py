"""
Exoplanet data normalization script

This module defines an ExoPreprocessor class for cleaning and normalising
the KOI and K2 exoplanet datasets.  It can be used to remove redundant
columns, convert textual columns to numeric, drop highly empty or constant
columns, impute missing values, and split the cleaned dataset into training,
validation and candidate subsets.

Usage:
    from exo_preprocess import ExoPreprocessor
    import pandas as pd

    # Load raw KOI or K2 CSV using comment='#' to skip header comments
    koi_raw = pd.read_csv('KOIFULL.csv', comment='#')

    pre = ExoPreprocessor(null_pct_cut=0.80)
    X_tr, y_tr, X_va, y_va, candidates = pre.fit_and_split(koi_raw)

    # `X_tr` and `y_tr` can be used to train a model.
    # `X_va` and `y_va` can be used to validate.
    # `candidates` holds records labelled as 'Candidate' for later scoring.

See README in repository for more details.
"""

from __future__ import annotations

import pandas as pd
import numpy as np
from typing import List, Optional, Tuple
from sklearn.model_selection import train_test_split


class ExoPreprocessor:
    """
    Unified pre‑processor for KOI and K2 exoplanet data.

    The processor performs the following steps:
        - Identifies the mission (KOI or K2) based on known disposition columns.
        - Removes duplicate time columns (e.g., 'koi_time0bk' if 'koi_time0' exists).
        - Normalises koi_fpflag_* columns to binary or NaN.
        - Maps dispositions to labels: False Positive → 0, Confirmed → 1, Candidate/PC → 2.
        - Drops identifiers and comment-like columns.
        - Converts object columns to numeric where possible.
        - Drops columns with too many NaN values or zero variance.
        - Imputes missing values (median for integer-like columns, mean for others).
        - Splits the cleaned dataset into train/validation on the binary classes, and
          keeps Candidate examples for later prediction.

    Parameters
    ----------
    null_pct_cut : float, default=0.80
        The maximum fraction of NaNs allowed for a column to be retained.
    low_var_eps : float, default=1e-12
        Threshold below which a column's variance is considered zero.
    test_size : float, default=0.20
        Fraction of the binary class data to reserve for validation.
    random_state : int, default=42
        Random seed for the train/validation split.
    """

    # patterns for dropping identifier and comment columns
    ID_LIKE: List[str] = [
        "kepid", "epic", "tic", "rowid", "id", "idx", "index",
        "archiveid", "ra", "dec", "ra_str", "dec_str", "ra_hours", "dec_degs",
        # TOI/TESS specific identifiers
        "toi", "toipfx", "ctoi_alias", "pl_pnum", "tid", "toi_created", "rowupdate"
    ]
    COMMENT_LIKE: List[str] = [
        "comment", "comments", "note", "notes", "remarks",
        "koi_comment", "koi_notes"
    ]
    # duplicate columns to drop; keep the second entry if both exist
    DUPLIKES: List[Tuple[str, str]] = [("koi_time0bk", "koi_time0")]
    # potential disposition columns for each mission
    DISP_KOI: List[str] = [
        "koi_disposition", "koi_pdisposition", "koi_disposition_upd"
    ]
    DISP_K2: List[str] = [
        "k2_disposition", "disposition using data from k2",
        "disposition", "koi_disposition"
    ]
    # disposition column for TESS TOI catalogue.  See `_map_labels` for label mapping.
    DISP_TOI: List[str] = [
        "tfopwg_disp"
    ]
    # human identifiers to propagate to candidate output
    HUMAN_ID_CANDS: List[str] = [
        "koi_name", "epic", "tic_id", "epic_id", "kepoi_name",
        # TESS/TOI identifiers to propagate to candidate output when available
        "toi", "tid"
    ]

    def __init__(
        self,
        null_pct_cut: float = 0.80,
        low_var_eps: float = 1e-12,
        test_size: float = 0.20,
        random_state: int = 42,
    ) -> None:
        self.null_pct_cut = null_pct_cut
        self.low_var_eps = low_var_eps
        self.test_size = test_size
        self.random_state = random_state

        # Learned attributes after fitting
        self.kept_columns_: Optional[List[str]] = None
        self.means_: Optional[dict] = None
        self.medians_int_: Optional[dict] = None
        self.mission_: Optional[str] = None
        self.id_col_for_candidates_: Optional[str] = None

    @staticmethod
    def _as_num(s: pd.Series) -> pd.Series:
        """
        Convert a pandas Series of objects/strings to numeric floats.

        Handles commas and scientific notation gracefully; non-numeric values
        are coerced to NaN.
        """
        s = s.astype("object").astype(str).str.replace(",", ".", regex=False)
        out = pd.to_numeric(
            s.str.extract(r"([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)")[0],
            errors="coerce"
        )
        return out

    def _map_labels(self, disp: pd.Series) -> pd.Series:
        """
        Map textual disposition labels to numeric values.

        The mapping supports multiple missions:

        - **Kepler/KOI & K2**: labels may contain 'CONFIRM', 'KP',
          'FALSE', 'FP', 'CANDID', 'PC'.  These are mapped as in the
          original TCC: Confirmed→1, False Positive→0, Candidate→2.

        - **TESS/TOI**: TFOPWG dispositions use two‑letter codes:
            * ``CP`` or ``KP`` – confirmed or known planet → 1
            * ``FP`` or ``FA`` – false positive or false alarm → 0
            * ``PC`` or ``APC`` – planet candidate or ambiguous planet candidate → 2

        Any unrecognised label remains NaN.
        """
        d = disp.astype(str).str.upper().str.strip()
        y = pd.Series(np.nan, index=d.index, dtype=float)
        # confirmed/known planets: includes CONFIRM, KP, CP
        conf_mask = d.str.contains(r"\bCONFIRM|\bKP\b|\bCP\b", regex=True)
        y[conf_mask] = 1
        # false positives/alarms: includes FALSE, FP, FA
        fp_mask = d.str.contains(r"FALSE|\bFP\b|\bFA\b", regex=True)
        y[fp_mask] = 0
        # planet candidates/ambiguous: includes CANDID, PC, APC
        cand_mask = d.str.contains(r"CANDID|\bPC\b|\bAPC\b", regex=True)
        y[cand_mask] = 2
        return y

    def _pick_disposition_col(self, df: pd.DataFrame) -> Tuple[str, str]:
        """
        Identify mission and disposition column in a DataFrame.
        Returns a tuple (mission, disp_col).
        """
        # KOI mission
        for c in self.DISP_KOI:
            if c in df.columns:
                return "KOI", c
        # K2 mission
        for c in self.DISP_K2:
            if c in df.columns:
                return "K2", c
        # TESS mission (TOI catalogue)
        for c in getattr(self, "DISP_TOI", []):
            if c in df.columns:
                return "TOI", c
        raise ValueError(
            "No disposition column found. Expected one of "
            f"{self.DISP_KOI + self.DISP_K2 + getattr(self, 'DISP_TOI', [])}."
        )

    def fit(self, df_raw: pd.DataFrame) -> "ExoPreprocessor":
        """
        Fit the preprocessor to a raw DataFrame.

        This step infers which columns to keep, computes means/medians
        for imputation, and determines which mission the data belongs to.
        """
        df = df_raw.copy()
        # strip whitespace from column names
        df.columns = [c.strip() for c in df.columns]

        # identify mission and disposition column
        mission, disp_col = self._pick_disposition_col(df)
        self.mission_ = mission

        # drop duplicate columns (e.g., koi_time0bk)
        for bkup, base in self.DUPLIKES:
            if bkup in df.columns and base in df.columns:
                df.drop(columns=[bkup], inplace=True)

        # normalise koi_fpflag_* columns to binary (0/1) or NaN
        for c in df.columns:
            if c.lower().startswith("koi_fpflag_"):
                num = self._as_num(df[c])
                ok = num.isin([0, 1]) | num.isna()
                num.loc[~ok] = np.nan
                df[c] = num

        # map disposition labels to numeric
        y_all = self._map_labels(df[disp_col])

        # determine a human-friendly identifier column for candidates
        id_col = None
        for cand in self.HUMAN_ID_CANDS:
            if cand in df.columns:
                id_col = cand
                break
        self.id_col_for_candidates_ = id_col

        # drop identifier and comment-like columns
        drop_cols: set[str] = set()
        for c in df.columns:
            cl = c.lower()
            if any(k in cl for k in [*self.ID_LIKE, *self.COMMENT_LIKE]):
                drop_cols.add(c)

        # ensure the disposition and id columns are not dropped
        for keep in [disp_col, id_col]:
            if keep in drop_cols:
                drop_cols.remove(keep)

        df_use = df.drop(columns=list(drop_cols), errors="ignore")

        # convert object columns to numeric
        for c in df_use.columns:
            if df_use[c].dtype == "object":
                df_use[c] = self._as_num(df_use[c])

        # drop columns with too many NaNs
        na_frac = df_use.isna().mean()
        keep_mask = na_frac <= self.null_pct_cut
        df_use = df_use.loc[:, keep_mask]

        # drop columns with almost zero variance
        var = df_use.var(numeric_only=True)
        const = var.fillna(0.0).abs() <= self.low_var_eps
        df_use = df_use.loc[:, ~const.reindex(df_use.columns).fillna(False)]

        # record columns to retain
        self.kept_columns_ = list(df_use.columns)

        # compute medians for integer-like columns (currently only koi_tce_plnt_num)
        medians_int: dict[str, float] = {}
        if "koi_tce_plnt_num" in df_use.columns:
            col = self._as_num(df_use["koi_tce_plnt_num"])
            med = np.nanmedian(col)
            medians_int["koi_tce_plnt_num"] = med
        self.medians_int_ = medians_int

        # compute means for all numeric columns
        means = df_use.mean(numeric_only=True).to_dict()
        self.means_ = means

        return self

    def _apply_imputation(self, df_num: pd.DataFrame) -> pd.DataFrame:
        """
        Apply the learned imputation strategy to a numeric DataFrame.
        """
        X = df_num.copy()
        # impute integer-like columns with median and round
        for c, med in (self.medians_int_ or {}).items():
            if c in X.columns:
                tmp = self._as_num(X[c])
                tmp = tmp.fillna(med)
                X[c] = np.floor(tmp + 0.5)

        # impute remaining numeric columns with mean
        for c in X.columns:
            if pd.api.types.is_numeric_dtype(X[c]):
                mean = self.means_.get(c, np.nan)
                X[c] = X[c].fillna(mean)

        return X

    def transform(
        self, df_raw: pd.DataFrame
    ) -> Tuple[pd.DataFrame, pd.Series, Optional[pd.Series]]:
        """
        Transform a new DataFrame using the fitted preprocessor.

        Returns the cleaned numeric features, the mapped labels (0/1/2),
        and the identifier column if available.
        """
        if self.kept_columns_ is None or self.means_ is None:
            raise RuntimeError(
                "fit() must be called before transform()."
            )

        df = df_raw.copy()
        df.columns = [c.strip() for c in df.columns]

        # map disposition if present
        try:
            _, disp_col = self._pick_disposition_col(df)
            y_all = self._map_labels(df[disp_col])
        except Exception:
            y_all = pd.Series([np.nan] * len(df), index=df.index)

        # convert object columns to numeric
        for c in df.columns:
            if df[c].dtype == "object":
                df[c] = self._as_num(df[c])

        # retain only the fitted columns
        X_all = df.reindex(columns=self.kept_columns_).copy()
        X_all = self._apply_imputation(X_all)

        # propagate identifier column if available
        ids = None
        if (
            self.id_col_for_candidates_
            and self.id_col_for_candidates_ in df.columns
        ):
            ids = df[self.id_col_for_candidates_].reset_index(drop=True)

        return X_all, y_all, ids

    def fit_and_split(
        self, df_raw: pd.DataFrame
    ) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series, pd.DataFrame]:
        """
        Fit the preprocessor to a DataFrame and split the data.

        Returns:
            X_train, y_train: binary-labelled training data (0/1)
            X_valid, y_valid: holdout validation data (0/1)
            candidates: DataFrame of candidate (label=2) objects
        """
        self.fit(df_raw)
        X_all, y_all, ids = self.transform(df_raw)

        # separate binary training data from candidate examples
        train_mask = y_all.isin([0, 1])
        cand_mask = (y_all == 2)

        X_train = X_all.loc[train_mask].copy()
        y_train = y_all.loc[train_mask].astype(int)
        X_cand = X_all.loc[cand_mask].copy()

        # split binary data into train and validation
        X_tr, X_va, y_tr, y_va = train_test_split(
            X_train,
            y_train,
            test_size=self.test_size,
            stratify=y_train,
            random_state=self.random_state,
        )

        # assemble candidates DataFrame with identifier if available
        if ids is not None:
            candidates_df = pd.DataFrame(
                {
                    "object_id": ids.loc[cand_mask].reset_index(drop=True)
                }
            )
            for c in X_cand.columns:
                candidates_df[c] = X_cand[c].values
        else:
            candidates_df = X_cand.copy()

        return X_tr, y_tr, X_va, y_va, candidates_df


if __name__ == "__main__":
    # Example usage: preprocess KOIFULL and K2FULL CSVs and report shapes.
    import argparse
    parser = argparse.ArgumentParser(
        description="Normalize KOI or K2 exoplanet datasets."
    )
    parser.add_argument(
        "csv_path",
        help="Path to the raw CSV file (KOI or K2) downloaded "
        "from the NASA Exoplanet Archive.",
    )
    parser.add_argument(
        "--null_cut",
        type=float,
        default=0.80,
        help="Maximum fraction of NaNs allowed before dropping a column.",
    )
    parser.add_argument(
        "--test_size",
        type=float,
        default=0.20,
        help="Validation split size for binary labelled data.",
    )
    args = parser.parse_args()

    raw = pd.read_csv(args.csv_path, comment="#")
    pre = ExoPreprocessor(null_pct_cut=args.null_cut, test_size=args.test_size)
    X_tr, y_tr, X_va, y_va, cands = pre.fit_and_split(raw)
    print(f"Processed '{args.csv_path}':")
    print(f"  Features retained: {len(pre.kept_columns_)}")
    print(f"  Training size (0/1): {X_tr.shape[0]} records")
    print(f"  Validation size: {X_va.shape[0]} records")
    print(f"  Candidate size: {len(cands)} records")

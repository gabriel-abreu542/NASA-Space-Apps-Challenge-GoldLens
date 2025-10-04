# crosstrain20_fixed2.py
# Treina RF no combinado KOI(80%) + K2(80%) e avalia nos 20% de cada banco.
# Usa um único DataFrame (features + y) para evitar desalinhamento X/y.

import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, roc_auc_score,
    f1_score, matthews_corrcoef, confusion_matrix
)

DATA_DIR = Path("../datasets")
FEATURES = [
    "period_d","duration_h","depth_ppm","snr",
    "planet_radius_re","stellar_teff_k","stellar_logg","stellar_radius_rs"
]
MODEL_PATH = "model.pkl"

# ---------- utils ----------
def _to_num(s):
    s = pd.Series(s, dtype="object").astype(str).str.replace(",", ".", regex=False)
    return pd.to_numeric(s.str.extract(r"([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)")[0], errors="coerce")

def _get_any(df, names, numeric=True, default=np.nan):
    cols = {c.lower().strip(): c for c in df.columns}
    for n in names:
        nlow = n.lower().strip()
        if nlow in cols:
            col = df[cols[nlow]]
            return _to_num(col) if numeric else col
        for key, orig in cols.items():
            if key == nlow or key.startswith(nlow) or nlow in key:
                col = df[orig]
                return _to_num(col) if numeric else col
    return pd.Series([default]*len(df))

def metrics_block(y_true, y_pred, y_score):
    acc = accuracy_score(y_true, y_pred)
    bal = balanced_accuracy_score(y_true, y_pred)
    try: auc = roc_auc_score(y_true, y_score)
    except Exception: auc = float("nan")
    f1p = f1_score(y_true, y_pred, pos_label=1)
    f1n = f1_score(y_true, y_pred, pos_label=0)
    mcc = matthews_corrcoef(y_true, y_pred)
    cm  = confusion_matrix(y_true, y_pred)
    return acc, bal, auc, f1p, f1n, mcc, cm

def print_report(header, y_true, y_score, thr=0.5):
    y_pred = (y_score >= thr).astype(int)
    acc, bal, auc, f1p, f1n, mcc, cm = metrics_block(y_true, y_pred, y_score)
    print(f"{header} acc={acc:.4f} bal_acc={bal:.4f} auc={auc:.4f} f1(1)={f1p:.4f} f1(0)={f1n:.4f} mcc={mcc:.4f}")
    print(cm)

# ---------- loaders ----------
def load_std_koi():
    p = DATA_DIR/"KOI.xlsx"; q = DATA_DIR/"clean_KOI.csv"
    df = pd.read_excel(p) if p.exists() else pd.read_csv(q, comment="#")
    out = pd.DataFrame({
        "period_d":_get_any(df,["koi_period"]),
        "duration_h":_get_any(df,["koi_duration"]),
        "depth_ppm":_get_any(df,["koi_depth"]),
        "snr":_get_any(df,["koi_model_snr"]),
        "planet_radius_re":_get_any(df,["koi_prad"]),
        "stellar_teff_k":_get_any(df,["koi_steff","st_teff"]),
        "stellar_logg":_get_any(df,["koi_slogg","st_logg"]),
        "stellar_radius_rs":_get_any(df,["koi_srad","st_rad"]),
    })
    disp = _get_any(df,["koi_disposition"], numeric=False).astype(str).str.upper().str.strip()
    y = pd.Series(np.nan, index=out.index); y[disp.str.contains("CONFIRM")] = 1; y[disp.str.contains("FALSE")] = 0
    out["label"] = y
    out["bank"]  = "KOI"
    return out[out.label.isin([0,1])]

def load_std_k2():
    p = DATA_DIR/"K2.xlsx"; q = DATA_DIR/"clean_K2.csv"
    df = pd.read_excel(p) if p.exists() else pd.read_csv(q, comment="#")
    out = pd.DataFrame({
        "period_d":_get_any(df,["period","k2_period","koi_period","pl_orbper","orbital_period"]),
        "duration_h":_get_any(df,["duration","k2_duration","transit_duration","koi_duration"]),
        "depth_ppm":_get_any(df,["depth_ppm","depth","transit_depth","delta"]),
        "snr":_get_any(df,["snr","model_snr","signal_to_noise"]),
        "planet_radius_re":_get_any(df,["planet_radius","pl_rade","koi_prad"]),
        "stellar_teff_k":_get_any(df,["st_teff","teff","koi_steff"]),
        "stellar_logg":_get_any(df,["st_logg","logg","koi_slogg"]),
        "stellar_radius_rs":_get_any(df,["st_rad","stellar_radius","koi_srad"]),
    })
    disp = _get_any(df,["k2_disposition","disposition","koi_disposition",
                        "disposition using data from kepler","disposition using data from k2"], numeric=False
           ).astype(str).str.upper().str.strip()
    y = pd.Series(np.nan, index=out.index); y[disp.str.contains("CONFIRM")] = 1; y[disp.str.contains("FALSE|FP")] = 0
    out["label"] = y
    out["bank"]  = "K2"
    return out[out.label.isin([0,1])]

# ---------- main ----------
def main(n_estimators=500, max_depth=20, threshold=0.5):
    koi = load_std_koi(); k2 = load_std_k2()

    # split 80/20 por banco (mantendo índices separados por banco)
    koi_tr, koi_te = train_test_split(koi, test_size=0.2, stratify=koi["label"].astype(int), random_state=42)
    k2_tr,  k2_te  = train_test_split(k2,  test_size=0.2, stratify=k2["label"].astype(int),  random_state=42)

    # ---------- TREINO COMBINADO (em um DF só) ----------
    train_df = pd.concat([koi_tr, k2_tr], axis=0).copy()
    # filtro de completude
    comp = train_df[FEATURES].replace([np.inf,-np.inf], np.nan)
    keep_mask = comp.notna().sum(axis=1) >= max(3, int(0.5*len(FEATURES)))
    train_df = train_df.loc[keep_mask].copy()

    # medianas do treino
    med = train_df[FEATURES].median(numeric_only=True)
    # imputação no treino
    for c in FEATURES:
        train_df[c] = train_df[c].replace([np.inf,-np.inf], np.nan).fillna(med[c])

    X_train = train_df[FEATURES]
    y_train = train_df["label"].astype(int)

    # ---------- TESTES (combinado e por banco), aplicando MESMAS medianas ----------
    def prepare_test(df_raw):
        df = df_raw.copy()
        comp = df[FEATURES].replace([np.inf,-np.inf], np.nan)
        keep = comp.notna().sum(axis=1) >= max(3, int(0.5*len(FEATURES)))
        df = df.loc[keep].copy()
        for c in FEATURES:
            df[c] = df[c].replace([np.inf,-np.inf], np.nan).fillna(med[c])
        return df

    koi_te_prep = prepare_test(koi_te)
    k2_te_prep  = prepare_test(k2_te)
    test_df     = pd.concat([koi_te_prep, k2_te_prep], axis=0)

    X_test  = test_df[FEATURES]
    y_test  = test_df["label"].astype(int)
    X_testK = koi_te_prep[FEATURES]; y_testK = koi_te_prep["label"].astype(int)
    X_test2 = k2_te_prep[FEATURES];  y_test2 = k2_te_prep["label"].astype(int)

    # sanity checks
    assert len(X_train)==len(y_train)
    assert len(X_test)==len(y_test)

    # ---------- Treina RF ----------
    rf = RandomForestClassifier(
        n_estimators=n_estimators, max_depth=max_depth,
        max_features="sqrt", class_weight="balanced_subsample",
        n_jobs=-1, random_state=42
    ).fit(X_train, y_train)

    # ---------- Avaliação ----------
    score_comb = rf.predict_proba(X_test)[:,1]
    print_report(f"[COMBINADO] n={n_estimators} depth={max_depth}", y_test, score_comb, threshold)

    score_koi = rf.predict_proba(X_testK)[:,1]
    print_report(f"[KOI]       n={n_estimators} depth={max_depth}", y_testK, score_koi, threshold)

    score_k2  = rf.predict_proba(X_test2)[:,1]
    print_report(f"[K2]        n={n_estimators} depth={max_depth}", y_test2, score_k2, threshold)

    return rf

print("Teste")
# experimento 1: 300 árvores
modelo = main(n_estimators=300, max_depth=20, threshold=0.5)
joblib.dump(modelo, MODEL_PATH)
print("Modelo salvo em ", MODEL_PATH)
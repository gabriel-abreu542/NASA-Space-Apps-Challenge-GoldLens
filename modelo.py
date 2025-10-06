# crosstrain20_fixed2.py
# Treina RF no combinado KOI(80%) + K2(80%) e avalia nos 20% de cada banco.
# Agora também mostra importâncias de features (Gini e Permutation Importance).

import numpy as np
import pandas as pd
import json
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, roc_auc_score,
    f1_score, matthews_corrcoef, confusion_matrix, classification_report
)
from sklearn.inspection import permutation_importance
from sklearn.metrics import make_scorer
import warnings

from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

import joblib
import os

# ========= config =========
MODEL_DIR = "models"
MODEL_NAME = "rf_model.pkl"
DATA_DIR = Path("datasets")
FEATURES = [
    "period_d","duration_h","depth_ppm","snr",
    "planet_radius_re","stellar_teff_k","stellar_logg","stellar_radius_rs"
]

MODEL_PATH = os.path.join(MODEL_DIR, MODEL_NAME)

os.makedirs(MODEL_DIR, exist_ok=True)

# ========= utils =========
def _to_num(s):
    s = pd.Series(s, dtype="object").astype(str).str.replace(",", ".", regex=False)
    return pd.to_numeric(
        s.str.extract(r"([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)")[0],
        errors="coerce"
    )

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
    return pd.Series([default] * len(df))

def metrics_block(y_true, y_pred, y_score):
    acc = accuracy_score(y_true, y_pred)
    bal = balanced_accuracy_score(y_true, y_pred)
    try:
        auc = roc_auc_score(y_true, y_score)
    except Exception:
        auc = float("nan")
    f1p = f1_score(y_true, y_pred, pos_label=1)
    f1n = f1_score(y_true, y_pred, pos_label=0)
    mcc = matthews_corrcoef(y_true, y_pred)
    cm  = confusion_matrix(y_true, y_pred)
    return acc, bal, auc, f1p, f1n, mcc, cm

def print_report(header, y_true, y_score, thr=0.5):
    y_pred = (y_score >= thr).astype(int)
    acc, bal, auc, f1p, f1n, mcc, cm = metrics_block(y_true, y_pred, y_score)
    print(f"{header} acc={acc:.4f} bal_acc={bal:.4f} auc={auc:.4f} "
          f"f1(1)={f1p:.4f} f1(0)={f1n:.4f} mcc={mcc:.4f}")
    print(cm)

# ========= loaders =========
def load_std_koi():
    p = DATA_DIR/"KOI.xlsx"; q = DATA_DIR/"clean_KOI.csv"
    df = pd.read_excel(p) if p.exists() else pd.read_csv(q, comment="#")
    out = pd.DataFrame({
        "period_d":        _get_any(df,["koi_period"]),
        "duration_h":      _get_any(df,["koi_duration"]),
        "depth_ppm":       _get_any(df,["koi_depth"]),
        "snr":             _get_any(df,["koi_model_snr"]),
        "planet_radius_re":_get_any(df,["koi_prad"]),
        "stellar_teff_k":  _get_any(df,["koi_steff","st_teff"]),
        "stellar_logg":    _get_any(df,["koi_slogg","st_logg"]),
        "stellar_radius_rs":_get_any(df,["koi_srad","st_rad"]),
    })
    disp = _get_any(df,["koi_disposition"], numeric=False).astype(str).str.upper().str.strip()
    y = pd.Series(np.nan, index=out.index)
    y[disp.str.contains("CONFIRM")] = 1
    y[disp.str.contains("FALSE")]   = 0
    out["label"] = y
    out["bank"]  = "KOI"
    return out[out.label.isin([0,1])]

def load_std_k2():
    p = DATA_DIR/"K2.xlsx"; q = DATA_DIR/"clean_K2.csv"
    df = pd.read_excel(p) if p.exists() else pd.read_csv(q, comment="#")
    out = pd.DataFrame({
        "period_d":        _get_any(df,["period","k2_period","koi_period","pl_orbper","orbital_period"]),
        "duration_h":      _get_any(df,["duration","k2_duration","transit_duration","koi_duration"]),
        "depth_ppm":       _get_any(df,["depth_ppm","depth","transit_depth","delta"]),
        "snr":             _get_any(df,["snr","model_snr","signal_to_noise"]),
        "planet_radius_re":_get_any(df,["planet_radius","pl_rade","koi_prad"]),
        "stellar_teff_k":  _get_any(df,["st_teff","teff","koi_steff"]),
        "stellar_logg":    _get_any(df,["st_logg","logg","koi_slogg"]),
        "stellar_radius_rs":_get_any(df,["st_rad","stellar_radius","koi_srad"]),
    })
    disp = _get_any(
        df,
        ["k2_disposition","disposition","koi_disposition",
         "disposition using data from kepler","disposition using data from k2"],
        numeric=False
    ).astype(str).str.upper().str.strip()
    y = pd.Series(np.nan, index=out.index)
    y[disp.str.contains("CONFIRM")]   = 1
    y[disp.str.contains("FALSE|FP")]  = 0
    out["label"] = y
    out["bank"]  = "K2"
    return out[out.label.isin([0,1])]

def remove_empty_columns(train_df, test_df, dataset_name=""):
    # Encontra colunas que estão 100% NaN no conjunto de treino
    empty_cols = train_df.columns[train_df.isna().all()].tolist()
    
    if empty_cols:
        print(f"[{dataset_name}] Removendo {len(empty_cols)} colunas 100% NaN: {empty_cols}")
    else:
        print(f"[{dataset_name}] Nenhuma coluna 100% NaN encontrada.")
    
    # Remove essas colunas tanto do treino quanto do teste
    train_df = train_df.drop(columns=empty_cols)
    test_df  = test_df.drop(columns=empty_cols, errors="ignore")
    
    return train_df, test_df

# --- Função para preparar treino e teste ---
def encode_categorical(train_df, test_df, dataset_name=""):
    # 1. Detectar colunas categóricas (texto ou categoria)
    cat_cols = train_df.select_dtypes(include=["object", "category"]).columns.tolist()
    
    if cat_cols:
        print(f"[{dataset_name}] Colunas categóricas detectadas ({len(cat_cols)}): {cat_cols}")
    else:
        print(f"[{dataset_name}] Nenhuma coluna categórica detectada.")
        return train_df, test_df
    
    # 2. Preencher NaN com string 'missing' (necessário para o OneHotEncoder)
    train_df[cat_cols] = train_df[cat_cols].fillna("missing")
    test_df[cat_cols]  = test_df[cat_cols].fillna("missing")
    
    # 3. Criar e ajustar o encoder apenas no treino
    encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    encoder.fit(train_df[cat_cols])
    
    # 4. Transformar treino e teste
    X_train_cat = pd.DataFrame(
        encoder.transform(train_df[cat_cols]),
        columns=encoder.get_feature_names_out(cat_cols),
        index=train_df.index
    )
    X_test_cat = pd.DataFrame(
        encoder.transform(test_df[cat_cols]),
        columns=encoder.get_feature_names_out(cat_cols),
        index=test_df.index
    )
    
    # 5. Concatenar com as colunas numéricas originais
    num_cols = train_df.drop(columns=cat_cols).columns
    train_encoded = pd.concat([train_df[num_cols].reset_index(drop=True), X_train_cat.reset_index(drop=True)], axis=1)
    test_encoded  = pd.concat([test_df[num_cols].reset_index(drop=True),  X_test_cat.reset_index(drop=True)], axis=1)
    
    print(f"[{dataset_name}] Dataset final: {train_encoded.shape[1]} colunas após codificação.\n")
    return train_encoded, test_encoded

# --- Função de preparo do teste (mesmas medianas) ---
def prepare_test(df_raw, med):
    df = df_raw.copy()

    comp = df[FEATURES].replace([np.inf, -np.inf], np.nan)
    keep = comp.notna().sum(axis=1) >= max(3, int(0.5 * len(FEATURES)))
    df = df.loc[keep].copy()
    for c in FEATURES:
        df[c] = df[c].replace([np.inf, -np.inf], np.nan).fillna(med[c])
    return df

def save_metrics_summary_json(file_path, y_true, y_score, threshold=0.5, header="COMBINED"):
    """
    Gera um resumo das métricas do modelo em formato JSON para uso no frontend.
    """
    # Predições binárias com base no limiar
    y_pred = (y_score >= threshold).astype(int)

    # Calcula métricas principais
    acc, bal, auc, f1p, f1n, mcc, cm = metrics_block(y_true, y_pred, y_score)

    # Relatório detalhado por classe (como dicionário)
    class_report = classification_report(y_true, y_pred, output_dict=True)

    # Monta o dicionário final
    metrics_data = {
        "header": header,
        "threshold": threshold,
        "metrics": {
            "accuracy": round(acc, 4),
            "balanced_accuracy": round(bal, 4),
            "roc_auc": round(auc, 4),
            "f1_class_1": round(f1p, 4),
            "f1_class_0": round(f1n, 4),
            "mcc": round(mcc, 4),
        },
        "confusion_matrix": np.array(cm).tolist(),
        "classification_report": class_report
    }

    # Salva em JSON
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=4, ensure_ascii=False)

    print(f"[INFO] Resumo de métricas (JSON) salvo em {file_path}")
# ========= core =========
def main(
    n_estimators=500,
    max_depth=20,
    threshold=0.5,
    plot=True,
    do_permutation=True,
    perm_repeats=10,
):
    print("AAAAAAA")
    warnings.filterwarnings("ignore", category=UserWarning)

    # --- Load ---
    koi = load_std_koi()
    k2  = load_std_k2()

    koi, koi = encode_categorical(koi, koi, dataset_name="KOI")
    k2,  k2  = encode_categorical(k2,  k2,  dataset_name="K2")
    
    koi, koi = remove_empty_columns(koi, koi, dataset_name="KOI")
    k2,  k2  = remove_empty_columns(k2,  k2,  dataset_name="K2")

    common_features = [f for f in FEATURES if f in koi.columns and f in k2.columns]
    if set(common_features) != set(FEATURES):
        print(f"Atenção: ajustando FEATURES para colunas comuns disponíveis: {common_features}")
    FEATURES[:] = common_features

    

    # --- Split 80/20 por banco ---
    koi_tr, koi_te = train_test_split(
        koi, test_size=0.2, stratify=koi["label"].astype(int), random_state=42
    )
    k2_tr, k2_te = train_test_split(
        k2,  test_size=0.2, stratify=k2["label"].astype(int),  random_state=42
    )


    # --- Treino combinado ---
    train_df = pd.concat([koi_tr, k2_tr], axis=0).copy()

    # filtro de completude (≥50% não nulos, mínimo 3)
    comp = train_df[FEATURES].replace([np.inf, -np.inf], np.nan)
    keep_mask = comp.notna().sum(axis=1) >= max(3, int(0.5 * len(FEATURES)))
    train_df = train_df.loc[keep_mask].copy()

    # medianas do treino (para imputação CONSISTENTE)
    med = train_df[FEATURES].median(numeric_only=True)
    for c in FEATURES:
        train_df[c] = train_df[c].replace([np.inf, -np.inf], np.nan).fillna(med[c])

    X_train = train_df[FEATURES]
    y_train = train_df["label"].astype(int)

    koi_te_prep = prepare_test(koi_te, med)
    k2_te_prep  = prepare_test(k2_te, med)
    test_df     = pd.concat([koi_te_prep, k2_te_prep], axis=0)

    X_test  = test_df[FEATURES]
    y_test  = test_df["label"].astype(int)
    X_testK = koi_te_prep[FEATURES]; y_testK = koi_te_prep["label"].astype(int)
    X_test2 = k2_te_prep[FEATURES];  y_test2 = k2_te_prep["label"].astype(int)

    # sanity checks
    assert len(X_train) == len(y_train)
    assert len(X_test)  == len(y_test)

    # --- Treino RF ---
    rf = RandomForestClassifier(
        n_estimators=n_estimators, max_depth=max_depth,
        max_features="sqrt", class_weight="balanced_subsample",
        n_jobs=-1, random_state=42
    ).fit(X_train, y_train)

    print("Salvando modelo...")
            
    # --- salvar modelo ---
    joblib.dump(rf, os.path.join(MODEL_DIR, "rf_model.pkl"))

    # --- salvar lista de features usadas no treino ---
    joblib.dump(FEATURES, os.path.join(MODEL_DIR, "rf_features.pkl"))

    # --- Avaliação ---
    score_comb = rf.predict_proba(X_test)[:, 1]
    print_report(f"[COMBINADO] n={n_estimators} depth={max_depth}", y_test,  score_comb, threshold)

    score_koi = rf.predict_proba(X_testK)[:, 1]
    print_report(f"[KOI]       n={n_estimators} depth={max_depth}", y_testK, score_koi, threshold)

    score_k2  = rf.predict_proba(X_test2)[:, 1]
    print_report(f"[K2]        n={n_estimators} depth={max_depth}", y_test2,  score_k2,  threshold)

    # --- Importâncias: Gini ---
    importances = rf.feature_importances_
    gini_table = sorted(zip(FEATURES, importances), key=lambda x: -x[1])
    print("\n[Feature Importances - Gini]")
    for f, imp in gini_table:
        print(f"{f:20s} {imp:.6f}")

    if plot:
        try:
            import matplotlib.pyplot as plt
            plt.barh(FEATURES, importances)
            plt.gca().invert_yaxis()
            plt.xlabel("Importância (Gini)")
            plt.title("Importância das Features - Random Forest")
            plt.tight_layout()
            plt.show()
        except Exception as e:
            print(f"(Aviso) Falha ao plotar Gini: {e}")

   

    # --- Importâncias: Permutation Importance (ROC-AUC) ---
    if do_permutation:
        scorer_auc = make_scorer(roc_auc_score, needs_threshold=True)
        # usar o conjunto combinado (X_test, y_test) para refletir avaliação geral
        res = permutation_importance(
            rf, X_test, y_test,
            n_repeats=perm_repeats,
            random_state=42,
            n_jobs=-1,
            scoring=scorer_auc
        )
        perm_mean = res.importances_mean
        perm_std  = res.importances_std
        perm_table = sorted(zip(FEATURES, perm_mean, perm_std), key=lambda x: -x[1])

        print("\n[Permutation Importance - ΔROC-AUC]")
        for f, m, s in perm_table:
            print(f"{f:20s} mean={m:.6f} ± {s:.6f}")

        if plot:
            try:
                import matplotlib.pyplot as plt
                vals = [m for _, m, _ in perm_table]
                labs = [f for f, _, _ in perm_table]
                plt.barh(labs, vals)
                plt.gca().invert_yaxis()
                plt.xlabel("Queda média no ROC-AUC ao permutar (maior = mais importante)")
                plt.title("Permutation Importance (ROC-AUC)")
                plt.tight_layout()
                plt.show()
            except Exception as e:
                print(f"(Aviso) Falha ao plotar Permutation: {e}")

    score_comb = rf.predict_proba(X_test)[:, 1]
    print_report(f"[COMBINADO] n={n_estimators} depth={max_depth}", y_test,  score_comb, threshold)

    # salvar resumo em txt
    SUMMARY_PATH = os.path.join(MODEL_DIR, "metrics_summary.json")
    save_metrics_summary_json(SUMMARY_PATH, y_test, score_comb, threshold, header="COMBINADO")


main(n_estimators=300, max_depth=20, threshold=0.5, plot=True, do_permutation=True,  perm_repeats=10)

    
    
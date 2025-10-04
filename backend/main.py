from flask import Flask, request, jsonify, Response
import pandas as pd
import json
import numpy as np
from flask_cors import CORS
import joblib, os, io

app = Flask(__name__)
CORS(app)

MODEL_PATH = "./rf_300.pkl"   # seu modelo salvo
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Modelo não encontrado em {MODEL_PATH}")

rf = joblib.load(MODEL_PATH)

FEATURES = [
    "period_d","duration_h","depth_ppm","snr",
    "planet_radius_re","stellar_teff_k","stellar_logg","stellar_radius_rs"
]

# mapeamento de nomes comuns KOI/K2 -> nomes padronizados
CANDS = {
    "period_d":        ["period_d","koi_period","pl_orbper","orbital_period","period"],
    "duration_h":      ["duration_h","koi_duration","transit_duration","duration"],
    "depth_ppm":       ["depth_ppm","transit_depth","depth","delta"],
    "snr":             ["snr","model_snr","signal_to_noise","koi_model_snr"],
    "planet_radius_re":["planet_radius_re","pl_rade","koi_prad","planet_radius"],
    "stellar_teff_k":  ["stellar_teff_k","st_teff","koi_steff","teff"],
    "stellar_logg":    ["stellar_logg","st_logg","koi_slogg","logg"],
    "stellar_radius_rs":["stellar_radius_rs","st_rad","koi_srad","stellar_radius"],
}

def _to_num(s: pd.Series) -> pd.Series:
    s = pd.Series(s, dtype="object").astype(str).str.replace(",", ".", regex=False)
    return pd.to_numeric(
        s.str.extract(r"([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)")[0],
        errors="coerce"
    )

def _get_any(df: pd.DataFrame, names) -> pd.Series:
    cols = {c.lower().strip(): c for c in df.columns}
    for n in names:
        nlow = n.lower().strip()
        if nlow in cols:
            return _to_num(df[cols[nlow]])
        for key, orig in cols.items():
            if key == nlow or key.startswith(nlow) or nlow in key:
                return _to_num(df[orig])
    return pd.Series([np.nan] * len(df))

def build_features_only(df: pd.DataFrame) -> pd.DataFrame:
    """Retorna APENAS as 8 features padronizadas na ordem correta."""
    out = pd.DataFrame()
    lower = {c.lower().strip(): c for c in df.columns}
    # caminho rápido: nomes já batem
    if all(f in lower for f in [c.lower() for c in FEATURES]):
        for f in FEATURES:
            out[f] = _to_num(df[lower[f.lower()]])
        return out
    # senão, tenta mapear
    for f in FEATURES:
        out[f] = _get_any(df, CANDS[f])
    return out

def prepare_input_to_features(df_in: pd.DataFrame, min_raw_nonnull: int = 3) -> pd.DataFrame:
    X = build_features_only(df_in)
    # descarta linhas com info crua insuficiente antes de imputar
    keep = X.notna().sum(axis=1) >= min_raw_nonnull
    X = X.loc[keep].copy()
    if len(X) == 0:
        raise ValueError("Nenhuma linha com informação suficiente para inferência (min_raw_nonnull).")
    # saneia e imputa medianas do próprio input
    X = X.replace([np.inf, -np.inf], np.nan)
    med = X.median(numeric_only=True)
    for c in X.columns:
        X[c] = X[c].fillna(med[c])
    return X

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # 1) entrada: CSV (multipart) ou JSON
        if "file" in request.files:
            file = request.files["file"]
            df_in = pd.read_csv(
                file, sep=",", skipinitialspace=True,
                on_bad_lines="skip", engine="python"
            )
        elif request.is_json:
            payload = request.get_json()
            if isinstance(payload, dict) and "data" in payload:
                df_in = pd.DataFrame(payload["data"])
            else:
                df_in = pd.DataFrame(payload)
        else:
            return jsonify({"error": "Envie um CSV em 'file' ou JSON válido."}), 400

        # 2) construir apenas features e preparar
        X = prepare_input_to_features(df_in, min_raw_nonnull=3)

        # 3) prob de classe positiva
        p1 = rf.predict_proba(X[FEATURES])[:, 1]
        out = X.copy()
        out["p_planet"] = p1

        # 4) formato de saída
        fmt = (request.args.get("format") or "").lower()
        if fmt == "csv":
            buf = io.StringIO()
            out.to_csv(buf, index=False)
            buf.seek(0)
            return Response(
                buf.getvalue(),
                mimetype="text/csv",
                headers={"Content-Disposition": "attachment; filename=predicoes.csv"}
            )
        # padrão: JSON
        return jsonify(out.to_dict(orient="records"))

    except Exception as e:
        return jsonify({"error": f"Erro ao processar: {str(e)}"}), 400

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "Backend Flask ativo"})

if __name__ == "__main__":
    # debug=True só em dev
    app.run(debug=True, port=5000)

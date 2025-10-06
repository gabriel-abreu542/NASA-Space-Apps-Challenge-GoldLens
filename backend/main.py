from flask import Flask, request, jsonify, Response
import pandas as pd
import json
import numpy as np
from flask_cors import CORS
import joblib, os, io

app = Flask(__name__)
CORS(app)

# MODEL_PATH = "./rf_300.pkl"   # seu modelo salvo
MODEL_PATH = "../models/rf_model.pkl"   # modelo treinado após remoçao de NaN e one hot encoding 
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Modelo não encontrado em {MODEL_PATH}")

FEATURES_PATH = os.getenv("FEATURES_PATH", "../models/rf_features.pkl")

rf = joblib.load(MODEL_PATH)
FEATURES = joblib.load(FEATURES_PATH)

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

# ======== load model ========
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Modelo não encontrado em {MODEL_PATH}")
rf = joblib.load(MODEL_PATH)
if not hasattr(rf, "predict_proba"):
    raise ValueError("O modelo carregado não possui predict_proba().")

# ======== helpers ========
def _to_num(s: pd.Series) -> pd.Series:
    s = pd.Series(s, dtype="object").astype(str).str.replace(",", ".", regex=False)
    return pd.to_numeric(
        s.str.extract(r"([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)")[0],
        errors="coerce",
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
    out = pd.DataFrame()
    lower = {c.lower().strip(): c for c in df.columns}
    if all(f in lower for f in [c.lower() for c in FEATURES]):
        for f in FEATURES:
            out[f] = _to_num(df[lower[f.lower()]])
        return out
    for f in FEATURES:
        out[f] = _get_any(df, CANDS[f])
    return out

def prepare_input_to_features(df_in: pd.DataFrame, min_raw_nonnull: int = 3) -> pd.DataFrame:
    X = build_features_only(df_in)
    keep = X.notna().sum(axis=1) >= min_raw_nonnull
    X = X.loc[keep].copy()
    if len(X) == 0:
        raise ValueError(
            f"Nenhuma linha com informação suficiente (min_raw_nonnull={min_raw_nonnull})."
        )
    X = X.replace([np.inf, -np.inf], np.nan)
    med = X.median(numeric_only=True)
    for c in X.columns:
        X[c] = X[c].fillna(med[c])
    return X

def read_payload_to_df(req) -> pd.DataFrame:
    if "file" in req.files:
        file = req.files["file"]
        name = (file.filename or "").lower()
        if name.endswith(".xlsx") or name.endswith(".xls"):
            return pd.read_excel(file)
        return pd.read_csv(file, sep=",", skipinitialspace=True, on_bad_lines="skip", engine="python")
    if req.is_json:
        payload = req.get_json()
        if isinstance(payload, dict) and "data" in payload:
            return pd.DataFrame(payload["data"])
        return pd.DataFrame(payload)
    raise ValueError("Envie um arquivo CSV/XLSX em 'file' ou JSON válido.")

def format_prob_column(out: pd.DataFrame, prob_format: str, prob_decimals: int, keep_float: bool):
    # já vem como p_planet_float de 0..1
    if prob_format == "percent":
        pct = (out["p_planet_float"] * 100).round(prob_decimals)
        # formata com símbolo %
        out["p_planet"] = pct.map(lambda x: f"{int(x)}%" if prob_decimals == 0 else f"{x:.{prob_decimals}f}%")
    else:
        # mantém decimal 0..1 com casas definidas
        out["p_planet"] = out["p_planet_float"].round(prob_decimals)
    if not keep_float:
        out.drop(columns=["p_planet_float"], inplace=True)
    return out

@app.route("/predict-individual", methods=["POST"])
def predict_individual():
    try:
        # 1) Ler o JSON do corpo da requisição
        data = request.get_json()

        if not data:
            return jsonify({"error": "Nenhum dado enviado no corpo da requisição."}), 400

        # 2) Converter em DataFrame (mesmo formato usado no treino)
        df_in = pd.DataFrame([data])

        # 3) Pré-processamento e alinhamento de features
        X = prepare_input_to_features(df_in)
        X_aligned = X.reindex(columns=FEATURES, fill_value=0)

        # 4) Obter probabilidade da classe positiva (exoplaneta)
        p_planet = rf.predict_proba(X_aligned)[:, 1][0]

        # 5) Retornar resultado como JSON simples
        return jsonify({
            "probability": float(p_planet),
            "probability_percent": round(float(p_planet) * 100, 4)
        })

    except Exception as e:
        print("[ERROR] /predict-individual:", str(e))
        return jsonify({"error": f"Erro ao processar: {str(e)}"}), 400

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # params
        fmt = (request.args.get("format") or "json").lower()            # json|csv
        top = request.args.get("top")
        include_index = request.args.get("include_index", "0").lower() in ("1", "true")
        min_raw_nonnull = int(request.args.get("min_raw_nonnull", 3))
        prob_format = (request.args.get("prob_format") or "percent").lower()  # percent|float
        prob_decimals = int(request.args.get("prob_decimals", 8))
        keep_float = request.args.get("keep_float", "0").lower() in ("1", "true")

        # 1) ler input
        df_in = read_payload_to_df(request)

        # 2) features only + preparo
        X = prepare_input_to_features(df_in, min_raw_nonnull=min_raw_nonnull)

        # 3) prob de classe positiva
        # --- Garante alinhamento com features do treino ---
        X_aligned = X.reindex(columns=FEATURES, fill_value=0)

        missing = [f for f in FEATURES if f not in X.columns]
        extra = [f for f in X.columns if f not in FEATURES]
        if missing or extra:
            print(f"[WARN] Features ausentes: {missing}, extras: {extra}")

        p1 = rf.predict_proba(X_aligned)[:, 1]
        out = X.copy()
        out["p_planet_float"] = pd.Series(p1, index=out.index)

        # 4) ranking (maior -> menor) por probabilidade numérica
        if include_index:
            out = out.reset_index(names="orig_idx")
        out = out.sort_values("p_planet_float", ascending=False)

        # 5) top N opcional
        if top is not None:
            try:
                n = int(top)
                if n > 0:
                    out = out.head(n)
            except ValueError:
                pass

        # 6) formatar coluna final de probabilidade
        out = format_prob_column(out, prob_format, prob_decimals, keep_float)

        # 7) manter apenas features + prob(s)
        keep_cols = FEATURES + (["orig_idx"] if include_index else []) + (["p_planet"] + (["p_planet_float"] if keep_float else []))
        out = out[keep_cols]

        # 8) resposta
        if fmt == "csv":
            buf = io.StringIO()
            out.to_csv(buf, index=False)
            buf.seek(0)
            return Response(
                buf.getvalue(),
                mimetype="text/csv",
                headers={"Content-Disposition": "attachment; filename=predicoes.csv"},
            )
        return jsonify(out.to_dict(orient="records"))

    except Exception as e:
        return jsonify({"error": f"Erro ao processar: {str(e)}"}), 400

@app.route("/metrics_summary", methods=["GET"])
def get_metrics_summary():
    file_path = os.path.join(MODEL_PATH, "metrics_summary.txt")
    if not os.path.exists(file_path):
        return jsonify({"error": "Resumo de métricas não encontrado."}), 404
    with open(file_path, "r") as f:
        content = f.read()
    return Response(content, mimetype="text/plain")

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "Backend Flask ativo"})

if __name__ == "__main__":
    # debug=True só em dev
    app.run(debug=True, port=5000)

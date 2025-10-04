from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)
CORS(app)

# Caminho do modelo treinado
MODEL_PATH = "model.pkl"

# Carregar modelo treinado
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Modelo não encontrado em {MODEL_PATH}. Treine e salve-o primeiro."
    )

model = joblib.load(MODEL_PATH)


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "file" in request.files:
            file = request.files["file"]
            # Lê CSV de forma robusta
            df = pd.read_csv(
                file,
                sep=",",
                skipinitialspace=True,
                on_bad_lines='skip',  # ignora linhas mal formatadas
                engine='python'
            )

        elif request.is_json:
            data = request.get_json()
            df = pd.DataFrame(data)
        else:
            return jsonify({"error": "Envie um arquivo CSV ou JSON válido"}), 400

        # Opcional: verificar se o CSV tem todas as features necessárias
        required_features = [
            "period_d","duration_h","depth_ppm","snr",
            "planet_radius_re","stellar_teff_k","stellar_logg","stellar_radius_rs"
        ]
        missing = [f for f in required_features if f not in df.columns]
        if missing:
            return jsonify({"error": f"Colunas faltando no CSV: {missing}"}), 400

        # Preencher NaN com 0 ou mediana, se quiser
        df.fillna(0, inplace=True)

        # Predição
        preds = model.predict(df[required_features].values)
        df["prediction"] = preds

        return jsonify(df.to_dict(orient="records"))

    except Exception as e:
        return jsonify({"error": f"Erro ao processar: {str(e)}"}), 400


@app.route("/", methods=["GET"])
def health_check():
    # Endpoint simples para verificar se o backend está rodando
    return jsonify({"status": "ok", "message": "Backend Flask ativo"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)

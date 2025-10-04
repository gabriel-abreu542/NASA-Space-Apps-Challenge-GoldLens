from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
import joblib
import os

app = Flask(__name__)
CORS(app)

MODEL_PATH = "model.pkl"

# Se não existir modelo, treinamos um fake para exemplificar
def train_model():
    X, y = make_classification(
        n_samples=500, n_features=4, n_informative=3, 
        n_redundant=0, random_state=42
    )
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)
    return model

# Carrega modelo
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    model = train_model()

@app.route("/upload", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    
    file = request.files["file"]
    df = pd.read_csv(file)

    try:
        preds = model.predict(df.values)
        df["prediction"] = preds
    except Exception as e:
        return jsonify({"error": f"Erro ao processar: {str(e)}"}), 400
    
    results = df.to_dict(orient="records")
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
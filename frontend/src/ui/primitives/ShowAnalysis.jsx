import { Card } from "../Card";
import { useState, useEffect } from "react";

const ShowAnalysis = ({ analysisData }) => {
  const [prevProbability, setPrevProbability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!analysisData) return;

    const analyseIndividualData = async () => {
      setLoading(true);
      setError(null);
      setPrevProbability(null);

      try {
        const response = await fetch("http://localhost:5000/predict-individual", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(analysisData),
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: falha ao obter predição`);
        }

        const result = await response.json();
        setPrevProbability(result.probability ?? 0);
      } catch (err) {
        console.error("Erro na requisição:", err);
        setError("Não foi possível obter a predição. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    analyseIndividualData();
  }, [analysisData]);

  // Define o gradiente conforme a probabilidade
  const getGradientClass = (prob) => {
    if (prob < 0.25) return "from-red-500 to-red-700";
    if (prob < 0.5) return "from-orange-400 to-orange-600";
    if (prob < 0.75) return "from-yellow-300 to-yellow-500";
    return "from-green-400 to-green-600";
  };

  return (
    <Card className="min-h-[360px] p-6 flex flex-col items-center justify-center">
      {!analysisData ? (
        <div className="text-center text-zinc-300">
          <div className="text-6xl mb-4">🪐</div>
          <p>
            Insira os dados e clique em{" "}
            <span className="font-semibold text-violet-300">
              “Analisar Candidato”
            </span>.
          </p>
        </div>
      ) : loading ? (
        <div className="animate-pulse text-zinc-400 text-lg">
          Analisando candidato...
        </div>
      ) : error ? (
        <div className="text-red-400 text-center font-medium">{error}</div>
      ) : (
        <div className="text-center text-zinc-200">
          <h2 className="text-2xl font-semibold mb-2 text-violet-400">
            Resultado da Análise
          </h2>
          <p className="text-lg text-zinc-400 mb-3">
            Probabilidade de ser um{" "}
            <span className="font-semibold text-violet-300">Exoplaneta</span>:
          </p>

          {prevProbability !== null ? (
            <div className="flex flex-col items-center">
              <span
                className={`text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${getGradientClass(
                  prevProbability
                )} drop-shadow-lg`}
              >
                {(prevProbability * 100).toFixed(2)}%
              </span>
              <span className="mt-2 text-sm text-zinc-500 tracking-wide">
                confiança do modelo
              </span>
            </div>
          ) : (
            <p className="text-zinc-400 mt-2">Nenhum resultado disponível.</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default ShowAnalysis;
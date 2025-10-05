import { Card } from "../Card";

const ShowAnalysis = ({ analysisData }) => {
  return (
    <Card className="min-h-[360px]">
      <div className="h-full w-full flex items-center justify-center text-center text-zinc-300">
        {!analysisData ? (
          <div>
            <div className="text-6xl mb-4">🪐</div>
            <p>
              Insira os dados e clique em{" "}
              <span className="font-semibold">“Analisar Candidato”</span>.
            </p>
          </div>
        ) : (
          <div className="text-left">
            <h2 className="text-2xl font-semibold mb-3 text-violet-400">
              Resultado da Análise
            </h2>
            <p><strong>Alvo:</strong> {analysisData.targetName}</p>
            <p><strong>Missão:</strong> {analysisData.mission}</p>
            <p><strong>Período:</strong> {analysisData.periodDays} dias</p>
            <p><strong>Profundidade:</strong> {analysisData.depthPpm} ppm</p>
            <p className="mt-2">
              <strong>Curva de Luz:</strong> {analysisData.lightCurve}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ShowAnalysis;
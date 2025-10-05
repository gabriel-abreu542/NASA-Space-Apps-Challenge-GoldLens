import { MetricBig } from "../MetricBig";
import { Card } from "../Card";
import { Meter } from "../Meter";

/**
 * Painel com métricas resumidas do modelo
 */
const MetricsOverview = () => (
  <div className="space-y-6">
    {/* Números principais */}
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <MetricBig label="Acurácia" value="0,91" />
      <MetricBig label="F1 Score" value="0,90" />
      <MetricBig label="ROC AUC" value="0,95" />
    </div>

    {/* Métricas detalhadas */}
    <Card title="Desempenho por Classe">
      <div className="space-y-4">
        <Meter label="Confirmado" value={0.78} />
        <Meter label="Candidato" value={0.42} />
        <Meter label="Falso Positivo" value={0.22} />
      </div>
    </Card>
  </div>
);

export default MetricsOverview;
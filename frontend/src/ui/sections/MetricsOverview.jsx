import { MetricBig } from "../MetricBig";
import { Card } from "../Card";
import { Meter } from "../Meter";

/**
 * Painel com métricas resumidas do modelo
 */
const MetricsOverview = ({ data }) => {
  if (!data) return null;

  const { accuracy, f1, roc_auc, report } = data;
  const class0 = report["0.0"];
  const class1 = report["1.0"];

  return (
    <div className="space-y-6">
      {/* Números principais */}
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricBig label="Acurácia" value={accuracy.toFixed(2)} />
        <MetricBig label="F1 Score" value={f1.toFixed(2)} />
        <MetricBig label="ROC AUC" value={roc_auc.toFixed(2)} />
      </div>

      {/* Métricas detalhadas */}
      <Card title="Desempenho por Classe">
        <div className="space-y-4">
          <Meter label="Classe 0" value={class0["f1-score"]} />
          <Meter label="Classe 1" value={class1["f1-score"]} />
        </div>
      </Card>
    </div>
  );
};

export default MetricsOverview;

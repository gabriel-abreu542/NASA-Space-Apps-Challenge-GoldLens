import { useDemoTraining } from "../../hooks/useDemoTraining";
import TrainingControls  from "./TrainingControls";
import MetricsOverview from "./MetricsOverview";
import ModelResults from "./ModelResults";

export default function Dashboard() {
    return (
    <main className="mx-auto max-w-7xl px-6 pb-24">
        {/* Painel de controles para iniciar o treino */}
        <TrainingControls onTrain={useDemoTraining} />

        {/* Layout em duas colunas: métricas à esquerda e resultados à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 ">
          <div className="lg:col-span-1">
            <MetricsOverview />
          </div>
          <div className="lg:col-span-2">
            <ModelResults />
          </div>
        </div>
      </main>
      );
};
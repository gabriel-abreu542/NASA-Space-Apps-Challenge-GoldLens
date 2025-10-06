import {  useState } from "react";
import TrainingControls from "./TrainingControls";
import MetricsOverview from "./MetricsOverview";
import ModelResults from "./ModelResults";

// Dados estáticos (poderiam vir de API futuramente)
const METRICS_DATA = {
  KOI: {
    accuracy: 0.8767,
    balanced_accuracy: 0.8347,
    roc_auc: 0.9189,
    f1: 0.8342,
    mcc: 0.6684,
    report: {
      "0.0": { precision: 0.9991586032814472, recall: 0.9816077702004546, "f1-score": 0.8746 },
      "1.0": { precision: 0.9685623454609679, recall: 0.9985433357611071, "f1-score": 0.8753 }
    },
    confusion_matrix: [[800, 116],[112, 437]],
    n_samples: 7585
  },
  K2: {
    accuracy: 0.9719,
    balanced_accuracy: 0.9095,
    roc_auc: 0.9854,
    f1: 0.998052369616966,
    mcc: 0.9830701118398494,
    report: {
      "0.0": { precision: 0.9701986754966887, recall: 1.0, "f1-score": 0.8627 },
      "1.0": { precision: 1.0, recall: 0.9961123110151188, "f1-score": 0.9843 }
    },
    confusion_matrix: [[ 44, 9], [5, 440]],
    n_samples: 2608
  },
  IMPORTANT_FEATURES:
    [["planet_radius_re", 0.339077],
    ["period_d", 0.214951],
    ["stellar_radius_rs", 0.198331],
    ["stellar_teff_k", 0.154312],
    ["stellar_logg", 0.093330]]
  
};

export default function Dashboard() {
  const [selectedDataset, setSelectedDataset] = useState("KOI");
  const importantFeatures = METRICS_DATA["IMPORTANT_FEATURES"].map(([name, value]) => ({
    name,
    value
  }));

  const handleDatasetChange = (datasetName) => {
    setSelectedDataset(datasetName);
    console.log(importantFeatures)
  };

  const currentData = METRICS_DATA[selectedDataset];


  return (
    <main className="mx-auto max-w-7xl px-6 pb-24">
      <TrainingControls onDatasetChange={handleDatasetChange} />

      {/* Layout em duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1">
          <MetricsOverview data={currentData} />
        </div>
        <div className="lg:col-span-2">
          <ModelResults data={currentData} importantFeatures={importantFeatures} />
        </div>
      </div>
    </main>
  );
}

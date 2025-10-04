import { Card } from "../Card";
import { ConfusionMatrix } from "../../viz/ConfusionMatrix";
import { ImportanceBar } from "../../viz/ImportanceBar";
import React from "react";
/**
 * Resultados do modelo:
 * - Matriz de confusão
 * - Importância das variáveis
 */
const ModelResults = () => {
  const labels = ["CONFIRMED", "CANDIDATE", "FALSE POSITIVE"];
  const confusionMatrix = [
    [578, 34, 15],
    [412, 49, 12],
    [27, 64, 111],
  ];
  const featureImportance = [
    { name: "Profundidade do Trânsito", value: 0.30 },
    { name: "Relação Sinal/Ruído", value: 0.24 },
    { name: "Duração do Trânsito", value: 0.18 },
    { name: "Temperatura da Estrela", value: 0.12 },
    { name: "Raio do Planeta", value: 0.10 },
  ];
  const maxValue = Math.max(...featureImportance.map((f) => f.value));

  return (
    <div className="space-y-6">
      <Card title="Matriz de Confusão">
        <ConfusionMatrix labels={labels} data={confusionMatrix} />
      </Card>

      <Card title="Importância das Variáveis">
        <div className="space-y-4">
          {featureImportance.map((f) => (
            <ImportanceBar
              key={f.name}
              name={f.name}
              value={f.value}
              max={maxValue}
            />
          ))}
          <div className="text-xs text-zinc-500 mt-2">0.00 — 0.30</div>
        </div>
      </Card>
    </div>
  );
};

export default ModelResults;
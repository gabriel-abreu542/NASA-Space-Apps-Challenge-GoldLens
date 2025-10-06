import { Card } from "../Card";
import { ConfusionMatrix } from "../../viz/ConfusionMatrix";
import { ImportanceBar } from "../../viz/ImportanceBar";
import React from "react";

/**
 * Resultados do modelo:
 * - Matriz de confusão (dados dinâmicos)
 * - Importância das variáveis (exemplo estático)
 */
const ModelResults = ({ data, importantFeatures }) => {
  
  if (!data) return null;
  
  // 🔹 Extrai matriz de confusão do JSON
  const confusionMatrix = data.confusion_matrix;

  // 🔹 Define rótulos das classes (duas classes no seu JSON)
  const labels = ["Negativo", "Exoplaneta"];

  const maxValue = Math.max(...importantFeatures.map((f) => f.value));

  return (
    <div className="space-y-6">
      {/* 🔹 Matriz de Confusão Dinâmica */}
      <Card title="Matriz de Confusão">
        <ConfusionMatrix labels={labels} data={confusionMatrix} />
      </Card>

      {/* 🔹 Importância das Variáveis (placeholder) */}
      <Card title="Importância das Variáveis">
        <div className="space-y-4">
          {importantFeatures.map((f) => (
            <ImportanceBar
              key={f.name}
              name={f.name}
              value={f.value}
              max={maxValue}
            />
          ))}
          <div className="text-xs text-zinc-500 mt-2">
            0.00 — {maxValue.toFixed(2)}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModelResults;

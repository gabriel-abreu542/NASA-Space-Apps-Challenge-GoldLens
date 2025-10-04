import React from "react";

/**
 * Matriz de confusão simples (3x3 por padrão).
 * As cores são interpoladas entre cinza e roxo de acordo com o valor.
 */
export const ConfusionMatrix = ({ labels, data }) => {
  const flat = data.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  const color = (v) => {
    const t = (v - min) / (max - min || 1);
    const start = [39, 39, 42];     // zinc-800
    const end = [124, 58, 237];     // violet-600
    const mix = start.map((s, i) => Math.round(s + (end[i] - s) * t));
    return `rgb(${mix.join(",")})`;
  };

  return (
    <div className="w-full">
      <div className="text-sm text-zinc-400 mb-3">Predicted Label</div>

      <div className="grid grid-cols-[140px_repeat(3,minmax(0,1fr))] text-sm">
        {/* Cabeçalho colunas */}
        <div />
        {labels.map((l) => (
          <div key={l} className="px-3 py-2 text-center text-zinc-300">
            {l}
          </div>
        ))}

        {/* Linhas da matriz */}
        {data.map((row, i) => (
          <React.Fragment key={i}>
            <div className="px-3 py-2 text-zinc-300">{labels[i]}</div>
            {row.map((v, j) => (
              <div
                key={`${i}-${j}`}
                className="px-3 py-3 rounded-lg m-1 text-center font-semibold text-white"
                style={{ background: color(v) }}
              >
                {v}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-2 text-sm text-zinc-500">True Label</div>
    </div>
  );
};
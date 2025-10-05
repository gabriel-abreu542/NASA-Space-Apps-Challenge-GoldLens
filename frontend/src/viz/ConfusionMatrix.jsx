import React from "react";


export const ConfusionMatrix = ({ labels, data }) => {
  const flat = data.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  const color = (v) => {
    const t = (v - min) / (max - min || 1);
    const start = [39, 39, 42]; // zinc-800
    const end = [124, 58, 237]; // violet-600
    const mix = start.map((s, i) => Math.round(s + (end[i] - s) * t));
    return `rgb(${mix.join(",")})`;
  };

  // divide label em 2 linhas (usado em ≤425px)
  const splitTwoLines = (s) => {
    const parts = s.trim().split(/\s+/);
    if (parts.length > 1) {
      const mid = Math.ceil(parts.length / 2);
      return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
    }
    const n = Math.ceil(s.length / 2);
    return [s.slice(0, n), s.slice(n)];
  };

  const HeaderCell = ({ text }) => {
    const [l1, l2] = splitTwoLines(text);
    return (
      <th className="px-2 py-1 text-center text-zinc-300 align-bottom">
        {/* ≥426px: label completo */}
        <span className="min-[426px]:inline max-[425px]:hidden">{text}</span>
        {/* ≤425px: duas linhas com respiro */}
        <span className="hidden max-[425px]:flex flex-col items-center leading-snug space-y-0.5">
          <span>{l1}</span>
          <span>{l2}</span>
        </span>
      </th>
    );
  };

  const RowHeader = ({ text }) => {
    const [l1, l2] = splitTwoLines(text);
    return (
      <th className="px-2 py-1 text-left text-zinc-300 align-middle text-xs max-[425px]:text-[11px]">
        <span className="min-[426px]:inline max-[425px]:hidden">{text}</span>
        <span className="hidden max-[425px]:flex flex-col leading-snug space-y-0.5">
          <span>{l1}</span>
          <span>{l2}</span>
        </span>
      </th>
    );
  };

  const Box = ({ v, strong }) => (
    <div
      className={[
        "rounded-lg text-center font-semibold text-white",
        "px-3 py-2 text-sm",
        "max-[425px]:px-2 max-[425px]:py-2 max-[425px]:text-xs",
      ].join(" ")}
      style={{ background: strong ? "rgb(124,58,237)" : color(v) }}
    >
      {v}
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-3 text-[11px] text-zinc-400">Predicted Label</div>

      {/* wrapper permite scroll se faltar espaço */}
      <div className="w-full overflow-x-auto">
        <table
          className={[
            "w-full text-left text-sm text-zinc-200",
            "border-separate",                 // usa spacing (não colapsa)
            "[border-spacing:12px_8px]",       // espaçamento col/linha (>=426px)
            "max-[425px]:[border-spacing:10px_8px]",
            "min-w-[560px]",                    // largura mínima confortável
            "max-[425px]:min-w-[420px]",       // garante que não sobreponha em telas estreitas
          ].join(" ")}
        >
          <thead className="text-zinc-300">
            <tr className="align-bottom">
              {/* canto vazio */}
              <th className="w-[140px] max-[425px]:w-[110px]"></th>
              {labels.map((l) => (
                <HeaderCell key={`h-${l}`} text={l} />
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={`r-${i}`} className="align-middle">
                <RowHeader text={labels[i]} />
                {row.map((v, j) => (
                  <td key={`c-${i}-${j}`} className="p-0">
                    <Box v={v} strong={i === j} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-[11px] text-zinc-500">True Label</div>
    </div>
  );
};

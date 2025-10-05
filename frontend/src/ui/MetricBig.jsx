import { Card } from "./Card";

// Mostra um número grande com rótulo (ex.: Acurácia 0,91)
export const MetricBig = ({ label, value }) => (
<div className="relative min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow">
      <div className="text-xs text-zinc-400">{label}</div>

      <div
        className="
          mt-2 block font-semibold text-white leading-none
          text-[clamp(1.1rem,6vw,2.25rem)]
          whitespace-nowrap overflow-hidden text-ellipsis
          lg:whitespace-normal lg:overflow-visible
        "
      >
        {value}
      </div>
    </div>
);
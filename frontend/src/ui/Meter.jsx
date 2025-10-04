// Barrinha horizontal (%). value/max -> largura
export const Meter = ({ label, value, max = 1 }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="w-40 text-xs uppercase tracking-wide text-zinc-400">{label}</div>
      <div className="flex-1 h-8 bg-zinc-800 rounded-lg overflow-hidden">
        <div className="h-full bg-violet-600/80" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-12 text-right text-sm tabular-nums">{Math.round(pct)}%</div>
    </div>
  );
};
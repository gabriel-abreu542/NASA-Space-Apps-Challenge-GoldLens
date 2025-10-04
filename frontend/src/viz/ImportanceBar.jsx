/**
 * Barra horizontal proporcional à importância (value/max)
 */
export const ImportanceBar = ({ name, value, max }) => (
  <div className="flex items-center gap-4">
    <div className="w-40 text-sm text-zinc-300">{name}</div>
    <div className="flex-1 h-6 bg-zinc-800 rounded-lg overflow-hidden">
      <div
        className="h-full bg-violet-500/80"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
    <div className="w-14 text-right text-xs text-zinc-400 tabular-nums">
      {value.toFixed(2)}
    </div>
  </div>
);
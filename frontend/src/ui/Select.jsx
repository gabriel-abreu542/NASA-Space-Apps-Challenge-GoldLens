// Select simples com rótulo e opções
export const Select = ({ label, options = [], defaultValue, onChange }) => (
  <div className="flex flex-col gap-2">
    {label && <span className="text-sm text-zinc-400">{label}</span>}
    <div className="relative">
      <select
        defaultValue={defaultValue}
        onChange={onChange}
        className="w-full appearance-none rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-3 pr-10 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-zinc-900">
            {o}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">▾</div>
    </div>
  </div>
);
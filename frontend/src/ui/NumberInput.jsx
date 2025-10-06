// Input numérico com rótulo (ex.: taxa de teste)
export const NumberInput = ({ label, value, step = 0.01, onChange }) => (
  <div className="flex flex-col gap-2">
    {label && <span className="text-sm text-zinc-400">{label}</span>}
    <input
      type="number"
      step={step}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
    />
  </div>
);
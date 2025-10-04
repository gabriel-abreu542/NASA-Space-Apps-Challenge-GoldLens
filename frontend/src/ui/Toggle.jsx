// Checkbox estilizado com rótulo
export const Toggle = ({ label, checked = true, onChange }) => (
  <label className="flex items-center gap-3 text-sm">
    <input
      type="checkbox"
      defaultChecked={checked}
      onChange={onChange}
      className="size-4 accent-violet-500 rounded"
    />
    <span className="text-zinc-300">{label}</span>
  </label>
);
const Table = ({ columns, rows }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="min-w-full table-auto text-sm text-left text-zinc-300">
        <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs tracking-wider border-b border-zinc-800">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3">
                {col === "p_planet" ? "Probabilidade" : col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-zinc-800/50 transition-colors">
              {columns.map((col, colIndex) => (
                <td
  key={colIndex}
  className={`px-4 py-3 text-center
    ${
      col === "p_planet"
        ? Number(row[col].split('.')[0]) > 90 && Number(row[col].split('.')[0]) <= 100
          ? "bg-green-600 text-white"
          : Number(row[col].split('.')[0]) >75 && Number(row[col].split('.')[0]) <= 90
          ? "bg-yellow-500 text-black"
          : Number(row[col].split('.')[0]) > 0 && Number(row[col].split('.')) <= 75
          ? "bg-red-500 text-white"
          : "bg-red-800 text-white"
        : ""
    }`}
>
  {row[col] ?? "-"}
</td>

              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
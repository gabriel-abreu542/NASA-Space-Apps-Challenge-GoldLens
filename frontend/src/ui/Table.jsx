const Table = ({ columns, rows }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="min-w-full table-auto text-sm text-left text-zinc-300">
        <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs tracking-wider border-b border-zinc-800">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3">
                {col}
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
        ? row[col] >= 100
          ? "bg-green-600 text-white"
          : row[col] >= 50
          ? "bg-yellow-500 text-black"
          : row[col] > 0
          ? "bg-red-500 text-white"
          : "bg-zinc-800 text-gray-300"
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
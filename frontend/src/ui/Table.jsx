const Table = () => {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="min-w-full table-auto text-sm text-left text-zinc-300">
        <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs tracking-wider border-b border-zinc-800">
          <tr>
            <th className="px-4 py-3">Song</th>
            <th className="px-4 py-3">Artist</th>
            <th className="px-4 py-3">Year</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-zinc-800/50 transition-colors">
            <td className="px-4 py-3">
              The Sliding Mr. Bones (Next Stop, Pottersville)
            </td>
            <td className="px-4 py-3">Malcolm Lockyer</td>
            <td className="px-4 py-3">1961</td>
          </tr>
          <tr className="hover:bg-zinc-800/50 transition-colors">
            <td className="px-4 py-3">Witchy Woman</td>
            <td className="px-4 py-3">The Eagles</td>
            <td className="px-4 py-3">1972</td>
          </tr>
          <tr className="hover:bg-zinc-800/50 transition-colors">
            <td className="px-4 py-3">Shining Star</td>
            <td className="px-4 py-3">Earth, Wind, and Fire</td>
            <td className="px-4 py-3">1975</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table;

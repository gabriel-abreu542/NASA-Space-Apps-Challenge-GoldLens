import Table from "../Table";
import { useState } from "react";

const BatchResults = ({ data, rowsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!data || !Array.isArray(data) || data.length === 0) return null;

  let columns = Object.keys(data[0]);
  
  columns = columns.filter(col => col !== "p_planet").concat("p_planet");

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleFirst = () => {setCurrentPage(1);}

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleLast = () => setCurrentPage(totalPages);
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = data.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-4">Resultados do Batch</h2>
      <Table columns={columns} rows={paginatedRows} />
      <div className="flex justify-end items-center mt-2 space-x-2 text-sm text-zinc-300">
        
        <button
          onClick={handleFirst}
          disabled={currentPage === 1}
          className="px-2 py-1 bg-zinc-800 rounded disabled:opacity-50 hover:bg-zinc-700 transition"
        >
          &lt;&lt;
        </button>
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-2 py-1 bg-zinc-800 rounded disabled:opacity-50 hover:bg-zinc-700 transition"
        >
          &lt;
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-2 py-1 bg-zinc-800 rounded disabled:opacity-50 hover:bg-zinc-700 transition"
        >
          &gt;
        </button>

        <button
          onClick={handleLast}
          disabled={currentPage === totalPages}
          className="px-2 py-1 bg-zinc-800 rounded disabled:opacity-50 hover:bg-zinc-700 transition"
        >
          &gt;&gt;
        </button>
      </div>
    </div>
  );
};

export default BatchResults;
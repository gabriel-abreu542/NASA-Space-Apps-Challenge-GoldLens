import Table from "../Table";

const BatchResults = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  // Usa as chaves do primeiro objeto como colunas
  const columns = Object.keys(data[0]);

  // Cada objeto já é uma linha
  const rows = data;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-4">Resultados do Batch</h2>
      <Table columns={columns} rows={rows} />
    </div>
  );
};

export default BatchResults;
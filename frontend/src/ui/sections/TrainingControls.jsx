import { Card } from "../Card";
import { Select } from "../Select";

const TrainingControls = ({ onDatasetChange }) => {
  const handleSelectChange = (e) => {
    // Se o seu Select for um <select> HTML nativo:
    const value = e.target?.value ?? e; // compatível com ambas as abordagens
    onDatasetChange(value);
  };

  return (
    <Card className="mt-6">
      <div
        className="
          grid grid-cols-1 gap-4 sm:gap-6
          md:grid-cols-[1fr_1fr_auto_auto] md:gap-x-6 md:gap-y-4 md:items-end
        "
      >
        {/* Modelo */}
        <div className="min-w-0">
          <Select
            label="Base de Dados"
            options={["KOI", "K2"]}
            defaultValue="KOI"
            onChange={handleSelectChange}  // ✅ garante envio correto
          />
        </div>
      </div>
    </Card>
  );
};

export default TrainingControls;
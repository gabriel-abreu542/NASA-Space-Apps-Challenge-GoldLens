import { Card } from "../Card";
import { Select } from "../Select";
import { NumberInput } from "../NumberInput";
import { Toggle } from "../Toggle";
import { PurpleButton } from "../PurpleButton";

/**
 * Painel de configuração do treino
 * Permite escolher o modelo, hiperparâmetros e ativar SMOTE
 */
const TrainingControls = ({ onTrain }) => (
  <Card className="mt-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Escolha do modelo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Select
          label="Modelo"
          options={["RandomForest", "LogisticRegression"]}
          defaultValue="LightGBM"
        />
      </div>

      {/* Configurações adicionais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <NumberInput label="Taxa de Teste" defaultValue={0.2} />
        <div className="flex items-end">
          <Toggle label="Usar SMOTE (balanceamento)" checked />
        </div>
        <div className="flex items-end justify-start sm:justify-end">
          <PurpleButton onClick={onTrain}>Treinar Modelo</PurpleButton>
        </div>
      </div>
    </div>
  </Card>
);

export default TrainingControls;
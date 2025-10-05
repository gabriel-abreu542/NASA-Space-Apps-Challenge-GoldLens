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
    <div
      className="
        grid grid-cols-1 gap-4 sm:gap-6
        md:grid-cols-[1fr_1fr_auto_auto] md:gap-x-6 md:gap-y-4 md:items-end
      "
    >
      {/* Modelo */}
      <div className="min-w-0">
        <Select
          label="Modelo"
          options={["RandomForest", "LogisticRegression", "LightGBM"]}
          defaultValue="RandomForest"  /* use um valor que exista nas options */
        />
      </div>

      {/* Taxa de Teste */}
      <div className="min-w-0">
        <NumberInput label="Taxa de Teste" defaultValue={0.2} />
      </div>

      {/* SMOTE */}
      <div className="min-w-0 md:whitespace-nowrap">
        <Toggle label="Usar SMOTE (balanceamento)" checked />
      </div>

      {/* Botão */}
      <div className="justify-self-stretch sm:col-span-2 md:col-span-1 md:justify-self-end">
        {/* se PurpleButton não aceitar className, o wrapper acima já garante largura */}
        <PurpleButton onClick={onTrain} className="w-full md:w-auto">
          Treinar Modelo
        </PurpleButton>
      </div>
    </div>
  </Card>
);

export default TrainingControls;
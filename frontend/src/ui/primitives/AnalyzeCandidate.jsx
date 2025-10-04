import { useState } from "react";
import { NumberInput } from "../NumberInput";
import { PurpleButton } from "../PurpleButton";
import { Card } from "../Card";
import { Select } from "../Select";

const AnalyzeCandidate = () => {

    const [lightCurve, setLightCurve] = useState();
    const [periodDays, setPeriodDays] = useState();
    const [depthPpm, setDepthPpm] = useState();
    const [mission, setMission] = useState("");
    const [targetName, setTargetName] = useState("");
    
    const loadExample = (teste) => {
        console.log(teste);
    }

    return (
        <Card >
            <form>           

            <div className="flex flex-col gap-2">

                <div className="flex flex-col gap-2">
                    <label className="text-sm text-zinc-400">Nome do Alvo</label>
                    <input 
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder="Ex: Kepler-452b"
                    className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>

                <Select
                    label="Missão Espacial"
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    options={["Kepler", "K2", "TESS"]}
                />

                <label className="text-sm text-zinc-400">
                    Dados da Curva de Luz
                    </label>
                <textarea
                rows={6}
                value={lightCurve}
                onChange={(e) => setLightCurve(e.target.value)}
                placeholder="1.0002, 0.9998, 0.9995, ..."
                className="w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <div className="flex flex-wrap gap-3 pt-2">
                    <button
                    type="button"
                    onClick={() => loadExample("confirmed")}
                    className="rounded-xl border border-zinc-800 px-4 py-2 text-sm hover:bg-zinc-900"
                    >
                    Carregar Exemplo – Planeta Confirmado
                    </button>
                    <button
                    type="button"
                    onClick={() => loadExample("fp")}
                    className="rounded-xl border border-zinc-800 px-4 py-2 text-sm hover:bg-zinc-900"
                    >
                    Carregar Exemplo – Falso Positivo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput
                label="Período (dias)"
                value={periodDays}
                onChange={(e) => setPeriodDays(e.target.value === "" ? "" : Number(e.target.value))}
                step={0.01}
                />
                <NumberInput
                label="Profundidade (ppm)"
                value={depthPpm}
                onChange={(e) => setDepthPpm(e.target.value === "" ? "" : Number(e.target.value))}
                step={1}
                />
            </div>


            <div className="pt-2">
                <PurpleButton type="submit">🔍 Analisar Candidato</PurpleButton>
            </div>
            </form>
        </Card>
    )
}

export default AnalyzeCandidate;
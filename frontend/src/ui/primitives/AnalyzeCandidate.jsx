import { useState } from "react";
import { NumberInput } from "../NumberInput";
import { PurpleButton } from "../PurpleButton";
import { Card } from "../Card";
import { Select } from "../Select";

const AnalyzeCandidate = () => {
    const [lightCurve, setLightCurve] = useState("");
    const [periodDays, setPeriodDays] = useState("");
    const [depthPpm, setDepthPpm] = useState("");
    const [mission, setMission] = useState("");
    const [targetName, setTargetName] = useState("");
    const [loading, setLoading] = useState(false);
    const [classifiedData, setClassifiedData] = useState(null);

    const loadExample = (type) => {
        console.log("Carregar exemplo:", type);
        // você pode preencher os campos aqui se quiser
    };

    const handleClassify = async () => {
        // validação simples
        if (!lightCurve || !periodDays || !depthPpm || !mission || !targetName) {
            alert("Preencha todos os campos antes de enviar.");
            return;
        }

        setLoading(true);

        try {
            // monta o objeto JSON
            const payload = {
                target_name: targetName,
                mission,
                period_days: Number(periodDays),
                depth_ppm: Number(depthPpm),
                light_curve: lightCurve
                    .split(",")
                    .map((v) => parseFloat(v.trim()))
                    .filter((v) => !isNaN(v)), // transforma a string em array numérico
            };

            const response = await fetch("http://localhost:5000/predict-individual", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Erro na requisição ao backend");
            }

            const results = await response.json();
            setClassifiedData(results);
            console.log("Resultado da classificação:", results);
        } catch (error) {
            console.error("Erro ao classificar:", error);
            alert("Erro ao classificar os dados. Veja o console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleClassify();
                }}
            >
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

                    <label className="text-sm text-zinc-400">Dados da Curva de Luz</label>
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
                        onChange={(e) => setPeriodDays(e.target.value)}
                        step={0.01}
                    />
                    <NumberInput
                        label="Profundidade (ppm)"
                        value={depthPpm}
                        onChange={(e) => setDepthPpm(e.target.value)}
                        step={1}
                    />
                </div>

                <div className="pt-2">
                    <PurpleButton type="submit" disabled={loading}>
                        {loading ? "⏳ Analisando..." : "🔍 Analisar Candidato"}
                    </PurpleButton>
                </div>
            </form>

            {classifiedData && (
                <div className="mt-4 text-sm text-zinc-300">
                    <pre>{JSON.stringify(classifiedData, null, 2)}</pre>
                </div>
            )}
        </Card>
    );
};

export default AnalyzeCandidate;

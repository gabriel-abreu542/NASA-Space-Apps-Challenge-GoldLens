import { useState } from "react";
import { NumberInput } from "../NumberInput";
import { PurpleButton } from "../PurpleButton";
import { Card } from "../Card";
import { Select } from "../Select";

const AnalyzeCandidate = ({ onAnalyze }) => {
    const [source, setSource] = useState("teste");
    const [periodDays, setPeriodDays] = useState("");
    const [durationH, setDurationH] = useState("");
    const [depthPpm, setDepthPpm] = useState("");
    const [snr, setSnr] = useState("");
    const [planetRadiusRe, setPlanetRadiusRe] = useState("");
    const [stellarTeffK, setStellarTeffK] = useState("");
    const [stellarLogg, setStellarLogg] = useState("");
    const [stellarRadiusRs, setStellarRadiusRs] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onAnalyze({
            source,
            period_d: periodDays,
            duration_h: durationH,
            depth_ppm: depthPpm,
            snr,
            planet_radius_re: planetRadiusRe,
            stellar_teff_k: stellarTeffK,
            stellar_logg: stellarLogg,
            stellar_radius_rs: stellarRadiusRs
        });
    };

    const loadExample = () => {
        // Exemplo baseado no input fornecido
        
        setPeriodDays(124326997);
        setDurationH(781);
        setDepthPpm(2403.0);
        setSnr(115.0);
        setPlanetRadiusRe(188.0);
        setStellarTeffK(54800.0);
        setStellarLogg(422.0);
        setStellarRadiusRs(1229.0);
        console.log("ADSAS")
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3">
                    <label className="text-sm text-zinc-400">Origem dos Dados (source)</label>
                    <Select
                        label=""
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        options={["Kepler", "TESS"]}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <NumberInput
                            label="Período (dias)"
                            value={periodDays}
                            onChange={(e) => setPeriodDays(e.target.value === "" ? "" : Number(e.target.value))}
                            step={0.01}
                        />
                        <NumberInput
                            label="Duração (horas)"
                            value={durationH}
                            onChange={(e) => setDurationH(e.target.value === "" ? "" : Number(e.target.value))}
                            step={0.01}
                        />
                        <NumberInput
                            label="Profundidade (ppm)"
                            value={depthPpm}
                            onChange={(e) => setDepthPpm(e.target.value === "" ? "" : Number(e.target.value))}
                            step={1}
                        />
                        <NumberInput
                            label="SNR"
                            value={snr}
                            onChange={(e) => setSnr(e.target.value === "" ? "" : Number(e.target.value))}
                            step={0.1}
                        />
                        <NumberInput
                            label="Raio do Planeta (R⊕)"
                            value={planetRadiusRe}
                            onChange={(e) => setPlanetRadiusRe(e.target.value === "" ? "" : Number(e.target.value))}
                            step={0.1}
                        />
                        <NumberInput
                            label="Temperatura da Estrela (K)"
                            value={stellarTeffK}
                            onChange={(e) => setStellarTeffK(e.target.value === "" ? "" : Number(e.target.value))}
                            step={1}
                        />
                        <NumberInput
                            label="Log(g) da Estrela"
                            value={stellarLogg}
                            onChange={(e) => setStellarLogg(e.target.value === "" ? "" : Number(e.target.value))}
                            step={0.1}
                        />
                        <NumberInput
                            label="Raio da Estrela (R☉)"
                            value={stellarRadiusRs}
                            onChange={(e) => setStellarRadiusRs(e.target.value === "" ? "" : Number(e.target.value))}
                            step={0.1}
                        />
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={loadExample}
                            className="rounded-xl border border-zinc-800 px-4 py-2 text-sm hover:bg-zinc-900"
                        >
                            Carregar Exemplo
                        </button>
                        <PurpleButton type="submit">🔍 Analisar Candidato</PurpleButton>
                    </div>
                </div>
            </form>
        </Card>
    );
};

export default AnalyzeCandidate;

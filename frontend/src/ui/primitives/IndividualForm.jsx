import AnalyzeCandidate from "./AnalyzeCandidate";
import ShowAnalysis from "./ShowAnalysis";
import { useState } from "react";

const IndividualForm = () => {

    const [analysisData, setAnalysisData] = useState(null);

    // Função que será chamada quando o usuário clicar em "Analisar Candidato"
    const handleAnalyze = (formData) => {
        // Aqui você pode futuramente chamar o backend (API) e salvar o resultado
        console.log("Dados recebidos:", formData);
        setAnalysisData(formData);
    };

    return (
        <div className="flex gap-6">
            <div className="flex-1">
                <AnalyzeCandidate onAnalyze={handleAnalyze} />
            </div>
            <div className="flex-1">
                <ShowAnalysis analysisData={analysisData} />
            </div>
        </div>
    )
};

export default IndividualForm;
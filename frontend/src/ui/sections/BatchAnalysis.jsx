import { useState } from "react";
import BatchResults from "./BatchResults";

const BatchAnalysis = () => {
    const [loading, setLoading] = useState(false);
    const [trainingComplete, setTrainingComplete] = useState(false);
    const [csvData, setCsvData] = useState(null);
    const [classifiedData, setClassifiedData] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setCsvData(file); // guarda o arquivo para enviar depois
        setTrainingComplete(false);
        setClassifiedData(null);
    };

    const handleClassify = async () => {
        if (!csvData) return;

        setLoading(true);

        try {
        const formData = new FormData();
        formData.append("file", csvData);

        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Erro na requisição ao backend");
        }

        const results = await response.json();
        setClassifiedData(results); // salva os resultados classificados
        setTrainingComplete(true);
        } catch (error) {
        console.error("Erro ao classificar:", error);
        alert("Erro ao classificar os dados. Veja o console.");
        } finally {
        setLoading(false);
        }
    };
    
    return (
        <>
            <div className="flex justify-center">
                <label
                htmlFor="csv-upload"
                className="w-full max-w-lg border-2 border-dashed border-gray-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer text-sm text-gray-500 mt-1 hover:text-white hover:border-white-500 hover:bg-violet-400 transition"
                >
                <div className="text-5xl mb-3">📁</div>
                <p className="text-gray-700 font-medium">
                    Arraste um arquivo CSV aqui ou clique para selecionar
                </p>
                <p className="">
                    Formato esperado: <code>nome, curva_de_luz, missao</code>
                </p>
                <input
                    type="file"
                    id="csv-upload"
                    accept=".csv"
                    hidden
                    onChange={handleFileUpload}
                />
                </label>
            </div>
            

            <div
                id="batch-results"
                className="mt-8 w-full max-w-4xl mx-auto bg-violet shadow-md rounded-xl p-6 border border-gray-200"
            >
                {csvData && !trainingComplete ? (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-green-600 font-semibold">✅ Dados carregados: {csvData.name}</p>
                    <button
                    onClick={handleClassify}
                    className="px-6 py-2 bg-violet-500 text-white rounded-lg shadow hover:bg-violet-600 transition"
                    >
                    Classificar Dados
                    </button>
                </div>
                ) : (
                <p className="text-gray-500 italic">Nenhum resultado ainda...</p>
                )}
            </div>            

            {
                loading ? (
                    <p>Classificando dados...</p>
                ) : (
                csvData && trainingComplete && <BatchResults data={classifiedData} />                
                )
            }

                     
                    
        </>
    )
};

export default BatchAnalysis;
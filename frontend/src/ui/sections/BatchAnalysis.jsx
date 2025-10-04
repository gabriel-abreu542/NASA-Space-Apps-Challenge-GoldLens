import Table from "../Table";

const BatchAnalysis = () => {
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
                    <input type="file" id="csv-upload" accept=".csv" hidden />
                    </label>
                </div>

                <div
                    id="batch-results"
                    className="mt-8 w-full max-w-4xl mx-auto bg-violet shadow-md rounded-xl p-6 border border-gray-200"
                >
                    <p className="text-gray-500 italic">Nenhum resultado ainda...</p>
                </div>

                <Table></Table>
                        
            </>
        )
};

export default BatchAnalysis;
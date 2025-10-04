import { Card } from "../Card";

const ShowAnalysis = () => {
    return (
        <Card className="min-h-[360px]">
            <div className="h-full w-full flex items-center justify-center text-center text-zinc-300">
                <div>
                    <div className="text-6xl mb-4">🪐</div>
                        <p>
                        Insira os dados e clique em <span className="font-semibold">“Analisar Candidato”</span>.
                        Esta versão está no mesmo estilo violeta da interface de Treino.
                        </p>
                    </div>
            </div>
        </Card>
    );
};


export default ShowAnalysis;
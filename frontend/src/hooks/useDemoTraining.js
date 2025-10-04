// ...existing code...
import { useCallback } from "react";

export function useDemoTraining() {
    const trainModel = useCallback(() => {
        // simula o início do treino — ajuste conforme necessário
        console.log("Demo: treino iniciado");
        // você pode retornar estados de progresso, timers, etc.
    }, []);

    return { trainModel };
}

export default useDemoTraining;
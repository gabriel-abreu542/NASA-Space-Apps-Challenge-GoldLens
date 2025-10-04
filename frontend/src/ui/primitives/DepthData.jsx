import { useState } from "react";

const DepthData = () => {
    const [periodDays, setPeriodDays] = useState();
    const [depthPpm, setDepthPpm] = useState();

    return(
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
    );

};

export default DepthData;
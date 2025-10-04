import AnalyzeCandidate from "./AnalyzeCandidate";
import ShowAnalysis from "./ShowAnalysis";

const IndividualForm = () => {
        return (
        <div className="flex gap-6">
            <div className="flex-1">
                <AnalyzeCandidate />
            </div>
            <div className="flex-1">
                <ShowAnalysis />
            </div>
        </div>
        )
};

export default IndividualForm;
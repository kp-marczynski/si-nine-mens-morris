import {AlgorithmType} from "./enum/algorithm-type.enum";
import {HeuristicsType} from "./enum/heuristics-type.enum";

export class TestDefinition {
    greenAiAlgorithm: AlgorithmType;
    redAiAlgorithm: AlgorithmType;

    greenHeuristics: HeuristicsType;
    redHeuristics: HeuristicsType;


    constructor(greenAiAlgorithm: AlgorithmType, redAiAlgorithm: AlgorithmType, greenHeuristics: HeuristicsType, redHeuristics: HeuristicsType) {
        this.greenAiAlgorithm = greenAiAlgorithm;
        this.redAiAlgorithm = redAiAlgorithm;
        this.greenHeuristics = greenHeuristics;
        this.redHeuristics = redHeuristics;
    }

    public static generateTestDefinitions(): TestDefinition[] {
        const result: TestDefinition[] = [];
        for (const greenAiAlgorithm of Object.keys(AlgorithmType)) {
            for (const redAiAlgorithm of Object.keys(AlgorithmType)) {
                for (const greenHeuristics of Object.keys(HeuristicsType)) {
                    for (const redHeuristics of Object.keys(HeuristicsType)) {
                        result.push(new TestDefinition(
                            AlgorithmType[greenAiAlgorithm],
                            AlgorithmType[redAiAlgorithm],
                            HeuristicsType[greenHeuristics],
                            HeuristicsType[redHeuristics]
                        ));
                    }
                }
            }
        }
        return result;
    }
}

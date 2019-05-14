import {Color} from "./enum/color.enum";
import {PlayerType} from "./enum/player-type.enum";
import {AlgorithmType} from "./enum/algorithm-type.enum";
import {HeuristicsType} from "./enum/heuristics-type.enum";


export class EndgameData {
    public timeInMinutes: string;
    public greenAlgorithm: AlgorithmType;
    public redAlgorithm: AlgorithmType;
    public greenHeuristics: HeuristicsType;
    public redheuristics: HeuristicsType;
    public greenAiPathCounter: number;
    public redAiPathCounter: number;

    constructor(public winingPlayer: Color, public moveCount: number, timeStart: number, public greenPlayerType: PlayerType, public redPlayerType: PlayerType, public redPoints: number, public greenPoints: number) {
        this.timeInMinutes = ((Date.now() - timeStart) / 60000).toFixed(2);
    }

}

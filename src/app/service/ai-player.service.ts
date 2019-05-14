import {Injectable} from '@angular/core';
import {GameService} from "./game.service";
import {IGameState} from "../model/game-state.model";
import {Color} from "../model/enum/color.enum";
import {GameStateNode, IGameStateNode} from "../model/game-state-node.model";
import {MoveType} from "../model/enum/move-type.enum";
import {AlgorithmType} from "../model/enum/algorithm-type.enum";
import {HeuristicsType} from "../model/enum/heuristics-type.enum";
import {PathCounter} from "../model/path-counter.model";

@Injectable({
    providedIn: 'root'
})
export class AiPlayerService {

    constructor(private gameService: GameService) {
    }

    public performComputerMove(gameState: IGameState, algorithmType: AlgorithmType, heuristics: HeuristicsType, pathCounter: PathCounter): IGameState {
        if (gameState.moveType == MoveType.END_GAME) {
            return gameState;
        }
        // let result: IGameState = null;
        // const children = this.gameService.getAllPossibleNextMoveResults(gameState);
        let isMaximizing: boolean = gameState.turn == Color.GREEN;

        // const root = this.broadFirstTreeGenerate(gameState, isMaximizing, Date.now(), 5 * 10e4, heuristics);
        let root = new GameStateNode(this.gameService, gameState, isMaximizing, 0, heuristics, algorithmType, pathCounter);
        console.log(algorithmType);
        console.log(heuristics);
        root = this.broadFirstTreeGenerate(root, Date.now(), 3 * 10e4, heuristics);
        root.calcValue();
        return root.getBestChild().root;
    }

    // private minimaxRecursive(gameState: IGameState, isMaximizing: boolean, level: number): number {
    //     let children = this.gameService.getAllPossibleNextMoveResults(gameState);
    //     if (!children || children.length == 0) {
    //         return this.gameService.getValue(gameState);
    //     }
    //     let childrenValues: number[] = [];
    //     if (level == 10 || level * children.length > 20) {
    //         childrenValues = children.map(child => this.gameService.getValue(child));
    //     } else {
    //         childrenValues = children.map(child => this.minimaxRecursive(child, !isMaximizing, level + 1));
    //     }
    //     console.log(childrenValues);
    //     return isMaximizing ? Math.max(...childrenValues) : Math.min(...childrenValues);
    // }

    private broadFirstTreeGenerate(root: IGameStateNode, timeStart: number, timeout: number, heuristics: HeuristicsType): IGameStateNode {
        // const root = new GameStateNode(this.gameService, gameState, isMaximizing, this.gameService.getValue(gameState, heuristics), 0, heuristics);
        let firstQueue: IGameStateNode[] = [root];
        let secondQueue: IGameStateNode[] = [];
        let level = 0;
        let iterationTime = Date.now() - timeStart;
        let iterationFinishedTimestamp = Date.now();
        while ((Date.now() - timeStart) + (iterationTime ** 2) < timeout && level < 10) {
            level++;
            console.log('level: ' + level);
            for (const firstQueueElem of firstQueue) {
                const children = this.gameService.getAllPossibleNextMoveResults(firstQueueElem.root)
                    .map(state => GameStateNode.createFromParent(firstQueueElem, state));
                firstQueueElem.children = children;
                secondQueue = [...secondQueue, ...children];
            }
            console.log(secondQueue.length);
            firstQueue = secondQueue;
            secondQueue = [];
            const newIterationTimestamp = Date.now();
            iterationTime = newIterationTimestamp - iterationFinishedTimestamp;
            iterationFinishedTimestamp = newIterationTimestamp;
        }
        return root;
    }

}

import {Injectable} from '@angular/core';
import {GameService} from "./game.service";
import {IGameState} from "../model/game-state.model";
import {Color} from "../model/enum/color.enum";
import {GameStateNode, IGameStateNode} from "../model/game-state-node.model";
import {MoveType} from "../model/enum/move-type.enum";
import {AlgorithmType} from "../model/enum/algorithm-type.enum";
import {HeuristicsType} from "../model/enum/heuristics-type.enum";

@Injectable({
    providedIn: 'root'
})
export class AiPlayerService {

    constructor(private gameService: GameService) {
    }

    public performComputerMove(gameState: IGameState, algorithmType: AlgorithmType, heuristics: HeuristicsType): IGameState {
        if (gameState.moveType == MoveType.END_GAME) {
            return gameState;
        }
        // let result: IGameState = null;
        // const children = this.gameService.getAllPossibleNextMoveResults(gameState);
        let isMaximizing: boolean = gameState.turn == Color.GREEN;

        const root = this.broadFirstTreeGenerate(gameState, isMaximizing, Date.now(), 5 * 10e4, heuristics);
        switch (algorithmType) {
            case AlgorithmType.MINI_MAX:
                return this.minimax(root);
            case AlgorithmType.ALPHA_BETA:
                return this.alphabeta(root);
        }
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

    private broadFirstTreeGenerate(gameState: IGameState, isMaximizing: boolean, timeStart: number, timeout: number, heuristics: HeuristicsType): IGameStateNode {
        const root = new GameStateNode(gameState, isMaximizing, this.gameService.getValue(gameState, heuristics));
        let firstQueue: IGameStateNode[] = [root];
        let secondQueue: IGameStateNode[] = [];
        let level = 0;
        let iterationTime = Date.now() - timeStart;
        let iterationFinishedTimestamp = Date.now();
        while ((Date.now() - timeStart) + (iterationTime ** 2) < timeout) {
            level++;
            console.log('level: ' + level);
            for (const firstQueueElem of firstQueue) {
                const children = this.gameService.getAllPossibleNextMoveResults(firstQueueElem.root).map(state => new GameStateNode(state, !firstQueueElem.isMaximizing, this.gameService.getValue(state, heuristics)));
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

    private minimax(root: IGameStateNode): IGameState {
        console.log('minimax');
        root.calcValue();
        return root.getBestChild().root;
    }

    private alphabeta(root: IGameStateNode): IGameState {
        console.log('alpha-beta');
        root.isAlphaBeta = true;
        root.calcValue();
        return root.getBestChild().root;
    }

}

import {Injectable} from '@angular/core';
import {GameService} from "./game.service";
import {IGameState} from "../model/game-state.model";

@Injectable({
    providedIn: 'root'
})
export class AiPlayerService {

    constructor(private gameService: GameService) {
    }

    public minimax(gameState: IGameState): IGameState {
        let result: IGameState = null;
        let resultValue: number = null;
        const children = this.gameService.getAllPossibleNextMoveResults(gameState);
        for (const child of children) {
            let childValue = this.minimaxRecursive(child, false, 0);
            if((resultValue != null && childValue == resultValue && Math.random() > 0.5) || (resultValue == null || childValue > resultValue)){
                resultValue = childValue;
                result = child;
            }
        }
        return result;
    }

    private minimaxRecursive(gameState: IGameState, isMaximizing: boolean, level: number): number {
        let children = this.gameService.getAllPossibleNextMoveResults(gameState);
        if (!children || children.length == 0) {
            return this.gameService.getValue(gameState);
        }
        let childrenValues: number[] = [];
        if (level == 1) {
            childrenValues = children.map(child => this.gameService.getValue(child));
        } else {
            childrenValues = children.map(child => this.minimaxRecursive(child, !isMaximizing, level + 1));
        }
        console.log(childrenValues);
        return isMaximizing ? Math.max(...childrenValues) : Math.min(...childrenValues);
    }

}

import {Injectable} from '@angular/core';
import {GameService} from "./game.service";
import {IGameState} from "../model/game-state.model";
import {Color} from "../model/enum/color.enum";

@Injectable({
    providedIn: 'root'
})
export class AiPlayerService {

    constructor(private gameService: GameService) {
    }

    public minimax(gameState: IGameState): IGameState {
        let result: IGameState = null;
        const children = this.gameService.getAllPossibleNextMoveResults(gameState);
        let isMaximizing: boolean = gameState.turn == Color.GREEN;
        // for (const child of children) {
        //     let childValue = this.minimaxRecursive(child, isMaximizing, 0);
        //     if ((resultValue != null && childValue == resultValue && Math.random() > 0.5) || (resultValue == null || (!isMaximizing && childValue > resultValue) || (isMaximizing && childValue < resultValue))) {
        //         resultValue = childValue;
        //         result = child;
        //     }
        // }
        const childrenValues: number[] = children.map(child => this.minimaxRecursive(child, !isMaximizing, 1));
        const value = isMaximizing ? Math.max(...childrenValues) : Math.min(...childrenValues);
        for (let i = 0; i < children.length; ++i) {
            if (childrenValues[i] == value && (result == null || Math.random() > 0.7)) {
                result = children[i];
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
        if (level == 10 || level * children.length > 20) {
            childrenValues = children.map(child => this.gameService.getValue(child));
        } else {
            childrenValues = children.map(child => this.minimaxRecursive(child, !isMaximizing, level + 1));
        }
        console.log(childrenValues);
        return isMaximizing ? Math.max(...childrenValues) : Math.min(...childrenValues);
    }

}

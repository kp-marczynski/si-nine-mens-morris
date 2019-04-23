import {Injectable} from '@angular/core';
import {Color, getOpponentColor} from "../model/enum/color.enum";
import {changeColor, ICircle} from "../model/circle.model";
import {MoveType} from "../model/enum/move-type.enum";
import {MoveResult} from "../model/enum/move-result.enum";
import {IPlayerState} from "../model/player-state.model";
import {GameState, IGameState} from "../model/game-state.model";
import {cloneDeep} from 'lodash';
import {BasicMove, ShiftMove} from "../model/move.model";

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private boardCenter: number = 3;

    constructor() {
    }

    clone(gameState: IGameState): GameState {
        return cloneDeep(gameState);
    }

    private getLastMovedPiece(gameState: IGameState): ICircle {
        switch (gameState.turn) {
            case Color.RED:
                return gameState.redPlayerState.lastMovedPiece;
            case Color.GREEN:
                return gameState.greenPlayerState.lastMovedPiece;
        }
    }

    private getPreviousPosition(gameState: IGameState): ICircle {
        switch (gameState.turn) {
            case Color.RED:
                return gameState.redPlayerState.previousPosition;
            case Color.GREEN:
                return gameState.greenPlayerState.previousPosition;
        }
    }

    private setLastMove(gameState: IGameState, previousPosition: ICircle, lastMovedPiece: ICircle) {
        switch (previousPosition.color) {
            case Color.RED:
                gameState.redPlayerState.previousPosition = previousPosition;
                gameState.redPlayerState.lastMovedPiece = lastMovedPiece;
                break;
            case Color.GREEN:
                gameState.greenPlayerState.previousPosition = previousPosition;
                gameState.greenPlayerState.lastMovedPiece = lastMovedPiece;
                break;
        }
    }

    isMoveAllowed(gameState: IGameState, selectedCircle: ICircle): boolean {
        return gameState.allowedMoves.find(circle => GameService.compareCirclesPosition(circle, selectedCircle)) != null;
    }

    private findDestinationsForNormalMove(gameState: IGameState): ICircle[] {
        let pieces: ICircle[] = gameState.circles.filter(circle => circle.color === Color.BLACK);
        // let lastMove = this.getLastMovedPiece(gameState);
        // if (lastMove) {
        //     pieces = pieces.filter(circle => !(circle.x == lastMove.x && circle.y == lastMove.y));
        // }
        return pieces;
    }

    private findDestinationsForOpponentRemove(gameState: IGameState): ICircle[] {
        return gameState.circles.filter(piece => piece.color === getOpponentColor(gameState.turn));
    }

    private findShiftSources(gameState: IGameState): ICircle[] {
        return gameState.circles.filter(piece => piece.color === gameState.turn);
    }


    isShiftToAllowed(gameState: IGameState, selectedCircle: ICircle, destinationCircle: ICircle): boolean {
        if (selectedCircle.color != gameState.turn) {
            return false;
        }
        switch (gameState.moveType) {
            case MoveType.MOVE_NEARBY:
                return this.findDestinationsForNearbyMove(gameState, selectedCircle).find(circle => GameService.compareCirclesPosition(circle, destinationCircle)) != null;
            case MoveType.MOVE_ANYWHERE:
                return gameState.circles.find(circle => circle.color === Color.BLACK && GameService.compareCirclesPosition(circle, destinationCircle)) != null;
            default:
                return false;
        }
    }

    private putPieceOnBoard(gameState: IGameState, destination: ICircle, isShifting: boolean): MoveResult {
        // if (destination == this.getLastMovedPiece(gameState)) {
        //     alert('You cant put piece on last used position');
        // } else {
        const currentPlayer = this.getCurrentPlayer(gameState);

        let operationPossible: boolean = isShifting;

        if (currentPlayer.piecesInDrawer > 0) {
            currentPlayer.piecesInDrawer--;
            operationPossible = true;
        }

        if (operationPossible) {
            changeColor(destination, gameState.turn);
            if (!isShifting) {
                // this.setLastMove(gameState, destination);
                this.getCurrentPlayer(gameState).piecesOnBoard++;
            }

            const pieces = gameState.circles.filter(c => c.color === gameState.turn);
            const mill = this.checkForMill(pieces, destination);

            switch (mill) {
                case 1:
                    gameState.moveType = MoveType.REMOVE_OPPONENT;
                    gameState.allowedMoves = this.findDestinationsForOpponentRemove(gameState);
                    return MoveResult.CHANGED_STATE_TO_REMOVE;
                case 2:
                    gameState.moveType = MoveType.REMOVE_OPPONENT_2;
                    gameState.allowedMoves = this.findDestinationsForOpponentRemove(gameState);
                    return MoveResult.CHANGED_STATE_TO_REMOVE;
            }
            return MoveResult.FINISHED_TURN;
        }
        // }
        return MoveResult.MOVE_NOT_ALLOWED;
    }

    private checkForMill(pieces: ICircle[], newPiece: ICircle): number {
        let result = 0;
        if (newPiece.x === 3) {
            if (pieces.filter(piece => piece.x === newPiece.x &&
                ((newPiece.y > 3 && piece.y > 3) || (newPiece.y < 3 && piece.y < 3))).length === 3) {
                result++;
            }
        } else {
            if (pieces.filter(piece => piece.x === newPiece.x).length === 3) {
                result++;
            }
        }

        if (newPiece.y === 3) {
            if (pieces.filter(piece => piece.y === newPiece.y &&
                ((newPiece.x > 3 && piece.x > 3) || (newPiece.x < 3 && piece.x < 3))).length === 3) {
                result++;
            }
        } else {
            if (pieces.filter(piece => piece.y === newPiece.y).length === 3) {
                result++;
            }
        }
        return result;
    }

    getCurrentPlayer(gameState: IGameState): IPlayerState {
        switch (gameState.turn) {
            case Color.RED:
                return gameState.redPlayerState;
            case Color.GREEN:
                return gameState.greenPlayerState;
        }
    }

    getOpponentPlayer(gameState: IGameState): IPlayerState {
        switch (gameState.turn) {
            case Color.RED:
                return gameState.greenPlayerState;
            case Color.GREEN:
                return gameState.redPlayerState;
        }
    }

    private findDestinationsForNearbyMove(gameState: IGameState, chosenCircle: ICircle): ICircle[] {
        const foundCircles: ICircle[] = gameState.circles.filter(circle => circle.color === Color.BLACK);
        const result: ICircle[] = [];

        for (const circle of foundCircles) {
            if (Math.abs(this.boardCenter - chosenCircle.x) == Math.abs(this.boardCenter - chosenCircle.y)) {
                if ((circle.x == chosenCircle.x && circle.y == this.boardCenter) || (circle.x == this.boardCenter && circle.y == chosenCircle.y)) {
                    result.push(circle);
                }
            } else if (chosenCircle.x == this.boardCenter) {
                if ((circle.y == chosenCircle.y
                    && (circle.x == chosenCircle.x + Math.abs(this.boardCenter - chosenCircle.y) || circle.x == chosenCircle.x - Math.abs(this.boardCenter - chosenCircle.y))
                ) || (circle.x == this.boardCenter && (circle.y == chosenCircle.y + 1 || circle.y == chosenCircle.y - 1))) {
                    result.push(circle);
                }

            } else if (chosenCircle.y == this.boardCenter) {
                if ((circle.x == chosenCircle.x
                    && (circle.y == chosenCircle.y + Math.abs(this.boardCenter - chosenCircle.x) || circle.y == chosenCircle.y - Math.abs(this.boardCenter - chosenCircle.x))
                ) || (circle.y == this.boardCenter && (circle.x == chosenCircle.x + 1 || circle.x == chosenCircle.x - 1))) {
                    result.push(circle);
                }
            }
        }
        let lastMove = this.getLastMovedPiece(gameState);
        let previousPosition = this.getPreviousPosition(gameState);

        if (lastMove && GameService.compareCirclesPosition(lastMove, chosenCircle) && previousPosition) {
            return result.filter(circle => !GameService.compareCirclesPosition(circle, previousPosition));
        } else {
            return result;
        }
    }


    private findDestinationsForAnywhereMove(gameState: IGameState, chosenCircle: ICircle): ICircle[] {
        const result: ICircle[] = gameState.circles.filter(circle => circle.color === Color.BLACK);
        let lastMove = this.getLastMovedPiece(gameState);
        let previousPosition = this.getPreviousPosition(gameState);
        if (lastMove && GameService.compareCirclesPosition(lastMove, chosenCircle) && previousPosition) {
            return result.filter(circle => !GameService.compareCirclesPosition(circle, previousPosition));
        } else {
            return result;
        }
    }

    private static compareCirclesPosition(circle1: ICircle, circle2: ICircle): boolean {
        return circle1.x == circle2.x && circle1.y == circle2.y;
    }

    private performNormalMove(gameState: IGameState, selectedCircle: ICircle): MoveResult {
        if (this.isMoveAllowed(gameState, selectedCircle)) {
            gameState.moveCount++;
            gameState.moves.push(new BasicMove(gameState.moveCount, gameState.turn, gameState.moveType, selectedCircle));
            return this.putPieceOnBoard(gameState, selectedCircle, false);
        }
        return MoveResult.MOVE_NOT_ALLOWED;
    }

    private performRemoveMove(gameState: IGameState, selectedCircle: ICircle): MoveResult {
        const removeAllowed = this.isMoveAllowed(gameState, selectedCircle);
        if (removeAllowed && selectedCircle.x != null && selectedCircle.y != null) {
            // this.setLastMove(gameState, selectedCircle);
            changeColor(selectedCircle, Color.BLACK);
            this.getCurrentPlayer(gameState).points++;
            this.getOpponentPlayer(gameState).piecesOnBoard--;
            if (gameState.moveType === MoveType.REMOVE_OPPONENT_2) {
                gameState.moves.push(new BasicMove(gameState.moveCount, gameState.turn, gameState.moveType, selectedCircle));
                gameState.moveType = MoveType.REMOVE_OPPONENT;
                return MoveResult.CHANGED_STATE_TO_REMOVE;
            } else {
                gameState.moves.push(new BasicMove(gameState.moveCount, gameState.turn, gameState.moveType, selectedCircle));
                return MoveResult.FINISHED_TURN;
            }
        }
        return MoveResult.MOVE_NOT_ALLOWED;
    }

    private performShift(gameState: IGameState, selectedCircle: ICircle): MoveResult {
        if (this.isMoveAllowed(gameState, selectedCircle)) {
            gameState.chosenForShift = selectedCircle;
            switch (gameState.moveType) {
                case MoveType.MOVE_NEARBY:
                    gameState.shiftDestinations = this.findDestinationsForNearbyMove(gameState, selectedCircle);
                    break;
                case MoveType.MOVE_ANYWHERE:
                    gameState.shiftDestinations = this.findDestinationsForAnywhereMove(gameState, selectedCircle);
                    break;
                default:
                    return MoveResult.MOVE_NOT_ALLOWED;
            }
            return MoveResult.SELECTED_TO_SHIFT;
        } else if (gameState.chosenForShift && this.isShiftToAllowed(gameState, gameState.chosenForShift, selectedCircle)) {
            gameState.shiftDestinations = [];
            const chosen = gameState.chosenForShift;
            gameState.chosenForShift = null;

            this.setLastMove(gameState, chosen, selectedCircle);
            changeColor(chosen, Color.BLACK);
            gameState.moveCount++;
            gameState.moves.push(new ShiftMove(gameState.moveCount, gameState.turn, gameState.moveType, chosen, selectedCircle));
            return this.putPieceOnBoard(gameState, gameState.circles.find(circle => circle.x == selectedCircle.x && circle.y == selectedCircle.y), true);
        }
        return MoveResult.MOVE_NOT_ALLOWED;
    }

    performMove(gameState: IGameState, selectedCircle: ICircle): MoveResult {
        let moveResult = MoveResult.MOVE_NOT_ALLOWED;
        switch (gameState.moveType) {
            case MoveType.NORMAL:
                moveResult = this.performNormalMove(gameState, selectedCircle);
                break;
            case MoveType.REMOVE_OPPONENT:
            case MoveType.REMOVE_OPPONENT_2:
                moveResult = this.performRemoveMove(gameState, selectedCircle);
                break;
            case MoveType.MOVE_NEARBY:
            case MoveType.MOVE_ANYWHERE:
                moveResult = this.performShift(gameState, selectedCircle);
                break;
            case MoveType.END_GAME:
                moveResult = MoveResult.END_GAME;
                break;
            default:
                moveResult = MoveResult.MOVE_NOT_ALLOWED;
                break;
        }

        if (moveResult == MoveResult.FINISHED_TURN) {
            return this.initNewTurn(gameState);
        }
        return moveResult;
    }

    private initNewTurn(gameState: IGameState): MoveResult {
        gameState.turn = getOpponentColor(gameState.turn);

        const availablePieces = this.getCurrentPlayer(gameState).piecesInDrawer;
        const usedPieces = this.getCurrentPlayer(gameState).piecesOnBoard;

        const allPieces = usedPieces + availablePieces;

        if (allPieces < 3) {
            gameState.moveType = MoveType.END_GAME;
            // alert("Player " + gameState.turn + " has lost");
        } else if (availablePieces > 0) {
            gameState.moveType = MoveType.NORMAL;
        } else if (usedPieces === 3) {
            if (this.checkIfAnyCanMoveNearby(gameState)) {
                gameState.moveType = MoveType.MOVE_ANYWHERE;
            } else {
                gameState.moveType = MoveType.END_GAME;
            }
        } else if (availablePieces === 0) {
            gameState.moveType = MoveType.MOVE_NEARBY;
        }

        if (gameState.moveType == MoveType.END_GAME) {
            return MoveResult.END_GAME;
        } else {
            switch (gameState.moveType) {
                case MoveType.NORMAL:
                    gameState.allowedMoves = this.findDestinationsForNormalMove(gameState);
                    break;
                case MoveType.MOVE_NEARBY:
                case MoveType.MOVE_ANYWHERE:
                    gameState.allowedMoves = this.findShiftSources(gameState);
                    break;
            }

            return MoveResult.FINISHED_TURN;
        }
    }


    private checkIfAnyCanMoveNearby(gameState: IGameState): boolean {
        let currentPlayerPieces = gameState.circles.filter(circle => circle.color == gameState.turn);
        for (const piece of currentPlayerPieces) {
            if (this.findDestinationsForNearbyMove(gameState, piece).length > 0) {
                return true;
            }
        }
        return false;
    }

    public getAllPossibleNextMoveResults(gameState: IGameState): IGameState[] {
        let destinations: ICircle[] = [];
        switch (gameState.moveType) {
            case MoveType.NORMAL:
                destinations = gameState.allowedMoves;
                break;
            case MoveType.MOVE_NEARBY:
            case MoveType.MOVE_ANYWHERE:
                destinations = this.findShiftSources(gameState);
                break;
            default:
                break;
        }
        return this.getAllPossibleNextMoveResultsForDestinations(gameState, destinations);
    }

    private getAllPossibleNextMoveResultsForDestinations(gameState: IGameState, destinations: ICircle[]): IGameState[] {
        let result: IGameState[] = [];
        for (let possibleMove of destinations) {
            const newGameState = this.clone(gameState);
            const moveDestination = newGameState.circles.find(circle => GameService.compareCirclesPosition(circle, possibleMove));
            switch (this.performMove(newGameState, moveDestination)) {
                case MoveResult.CHANGED_STATE_TO_REMOVE:
                    result = [...result, ...this.getAllPossibleNextMoveResultsForDestinations(newGameState, newGameState.allowedMoves)];
                    break;
                case MoveResult.SELECTED_TO_SHIFT:
                    result = [...result, ...this.getAllPossibleNextMoveResultsForDestinations(newGameState, newGameState.shiftDestinations)];
                    break;
                case MoveResult.FINISHED_TURN:
                case MoveResult.END_GAME:
                    result.push(newGameState);
                    break;
                case MoveResult.MOVE_NOT_ALLOWED:
                    console.log('Move not allowed');
                    break;
                default:
                    break;
            }

        }
        return result;
    }

    getValue(gameState: IGameState): number {
        return (gameState.greenPlayerState.points - gameState.redPlayerState.points) / (gameState.greenPlayerState.points + gameState.redPlayerState.points + 1);// / gameState.moveCount;
    }
}

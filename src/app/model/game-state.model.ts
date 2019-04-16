import {Color, getOpponentColor} from "./color.enum";
import {MoveType} from "./move-type.enum";
import {ICircle} from "./circle.model";
import {IPlayerState, PlayerState} from "./player-state.model";
import {IPosition} from "./position.model";
import {PutPieceResult} from "./put-piece-result.enum";

export interface IGameState {
    turn: Color;
    moveType: MoveType;
    circles: ICircle[];

    redPlayerState: IPlayerState;
    greenPlayerState: IPlayerState;

    getLastMove(): IPosition;

    setLastMove(circle: ICircle);

    isNormalMoveAllowed(selectedCircle: ICircle): boolean;

    isOpponentRemoveAllowed(selectedCircle: ICircle): boolean;

    isShiftAllowed(selectedCircle: ICircle): boolean;

    putPieceOnBoard(circle: ICircle, isShifting: boolean): PutPieceResult;

    getCurrentPlayer(): IPlayerState;
}

export class GameState implements IGameState {
    turn: Color = Color.RED;
    moveType: MoveType = MoveType.NORMAL;
    circles: ICircle[] = [];

    redPlayerState: IPlayerState;
    greenPlayerState: IPlayerState;

    constructor() {
        this.redPlayerState = new PlayerState();
        this.greenPlayerState = new PlayerState();
    }

    getLastMove(): IPosition {
        switch (this.turn) {
            case Color.RED:
                return this.redPlayerState.lastPosition;
            case Color.GREEN:
                return this.greenPlayerState.lastPosition;
        }
    }

    setLastMove(circle: ICircle) {
        switch (circle.color) {
            case Color.RED:
                this.redPlayerState.lastPosition = circle;
                break;
            case Color.GREEN:
                this.greenPlayerState.lastPosition = circle;
                break;
        }
    }

    isNormalMoveAllowed(selectedCircle: ICircle): boolean {
        let pieces: ICircle[] = this.circles.filter(circle => circle.color === Color.BLACK);
        let lastMove = this.getLastMove();
        if (lastMove) {
            pieces = pieces.filter(circle => !(circle.x == lastMove.x && circle.y == lastMove.y));
        }
        return pieces.find(circle => circle.x == selectedCircle.x && circle.y == selectedCircle.y) != null;
    }

    isOpponentRemoveAllowed(selectedCircle: ICircle): boolean {
        let pieces: ICircle[] = this.circles.filter(piece => piece.color === getOpponentColor(this.turn));
        return pieces.find(circle => circle.x == selectedCircle.x && circle.y == selectedCircle.y) != null;
    }

    isShiftAllowed(selectedCircle: ICircle): boolean {
        let pieces: ICircle[] = this.circles.filter(piece => piece.color === this.turn);
        return pieces.find(circle => circle.x == selectedCircle.x && circle.y == selectedCircle.y) != null;
    }

    putPieceOnBoard(circle: ICircle, isShifting: boolean): PutPieceResult {
        if (circle == this.getLastMove()) {
            alert('You cant put piece on last used position');
        } else {
            const currentPlayer = this.getCurrentPlayer();

            let operationPossible: boolean = isShifting;

            if (currentPlayer.availablePieces > 0) {
                currentPlayer.decreaseNumberOfAvailablePieces();
                operationPossible = true;
            }

            if (operationPossible) {
                circle.changeColor(this.turn);
                this.setLastMove(circle);

                const pieces = this.circles.filter(c => c.color === this.turn);
                const mill = this.checkForMill(pieces, circle);

                switch (mill) {
                    case 1:
                        this.moveType = MoveType.REMOVE_OPPONENT;
                        return PutPieceResult.CHANGED_STATE_TO_REMOVE;
                    case 2:
                        this.moveType = MoveType.REMOVE_OPPONENT_2;
                        return PutPieceResult.CHANGED_STATE_TO_REMOVE;
                }
                return PutPieceResult.FINISHED_TURN;
            }
        }
        return PutPieceResult.ERROR;
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

    getCurrentPlayer(): IPlayerState {
        switch (this.turn) {
            case Color.RED:
                return this.redPlayerState;
            case Color.GREEN:
                return this.greenPlayerState;
        }
    }
}


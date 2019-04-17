import {Color, getOpponentColor} from "./color.enum";
import {MoveType} from "./move-type.enum";
import {HighlightedCircle, ICircle} from "./circle.model";
import {IPlayerState, PlayerState} from "./player-state.model";
import {IPosition} from "./position.model";
import {MoveResult} from "./move-result.enum";

export interface IGameState {
    turn: Color;
    moveType: MoveType;
    circles: ICircle[];
    highlightedCircles: ICircle[];

    redPlayerState: IPlayerState;
    greenPlayerState: IPlayerState;

    getLastMove(): IPosition;

    setLastMove(circle: ICircle);

    isNormalMoveAllowed(selectedCircle: ICircle): boolean;

    isOpponentRemoveAllowed(selectedCircle: ICircle): boolean;

    isShiftFromAllowed(selectedCircle: ICircle): boolean;

    isShiftToAllowed(selectedCircle: ICircle, destinationCircle: ICircle): boolean;

    putPieceOnBoard(circle: ICircle, isShifting: boolean): MoveResult;

    getCurrentPlayer(): IPlayerState;

    findDestinationsForNearbyMove(chosenCircle: ICircle): ICircle[];

    findDestinationsForAnywhereMove(): ICircle[];

    performNormalMove(selectedCircle: ICircle): MoveResult;

    performRemoveMove(selectedCircle: ICircle): MoveResult;

    performShift(selectedCircle: ICircle): MoveResult;
}

export class GameState implements IGameState {
    private boardCenter = 3;
    private chosenForShift: ICircle;

    turn: Color = Color.RED;
    moveType: MoveType = MoveType.NORMAL;
    circles: ICircle[] = [];
    highlightedCircles: ICircle[] = [];
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
        return pieces.find(circle => this.compareCirclesPosition(circle, selectedCircle)) != null;
    }

    isShiftFromAllowed(selectedCircle: ICircle): boolean {
        let pieces: ICircle[] = this.circles.filter(piece => piece.color === this.turn);
        return pieces.find(circle => this.compareCirclesPosition(circle, selectedCircle)) != null;
    }

    isShiftToAllowed(selectedCircle: ICircle, destinationCircle: ICircle): boolean {
        if (selectedCircle.color != this.turn) {
            return false;
        }
        switch (this.moveType) {
            case MoveType.MOVE_NEARBY:
                return this.findDestinationsForNearbyMove(selectedCircle).find(circle => this.compareCirclesPosition(circle, destinationCircle)) != null;
            case MoveType.MOVE_ANYWHERE:
                return this.circles.find(circle => circle.color === Color.BLACK && this.compareCirclesPosition(circle, destinationCircle)) != null;
            default:
                return false;
        }
    }

    putPieceOnBoard(circle: ICircle, isShifting: boolean): MoveResult {
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
                if (!isShifting) {
                    this.setLastMove(circle);
                }

                const pieces = this.circles.filter(c => c.color === this.turn);
                const mill = this.checkForMill(pieces, circle);

                switch (mill) {
                    case 1:
                        this.moveType = MoveType.REMOVE_OPPONENT;
                        return MoveResult.CHANGED_STATE_TO_REMOVE;
                    case 2:
                        this.moveType = MoveType.REMOVE_OPPONENT_2;
                        return MoveResult.CHANGED_STATE_TO_REMOVE;
                }
                return MoveResult.FINISHED_TURN;
            }
        }
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

    getCurrentPlayer(): IPlayerState {
        switch (this.turn) {
            case Color.RED:
                return this.redPlayerState;
            case Color.GREEN:
                return this.greenPlayerState;
        }
    }

    findDestinationsForNearbyMove(chosenCircle: ICircle): ICircle[] {
        const foundCircles: ICircle[] = this.circles.filter(circle => circle.color === Color.BLACK);
        const result = [];

        for (const circle of foundCircles) {
            if (Math.abs(this.boardCenter - chosenCircle.x) == Math.abs(this.boardCenter - chosenCircle.y)) {
                if ((circle.x == chosenCircle.x && circle.y == this.boardCenter) || (circle.x == this.boardCenter && circle.y == chosenCircle.y)) {
                    result.push(new HighlightedCircle(circle));
                }
            } else if (chosenCircle.x == this.boardCenter) {
                if ((circle.y == chosenCircle.y
                    && (circle.x == chosenCircle.x + Math.abs(this.boardCenter - chosenCircle.y) || circle.x == chosenCircle.x - Math.abs(this.boardCenter - chosenCircle.y))
                ) || (circle.x == this.boardCenter && (circle.y == chosenCircle.y + 1 || circle.y == chosenCircle.y - 1))) {
                    result.push(new HighlightedCircle(circle));
                }

            } else if (chosenCircle.y == this.boardCenter) {
                if ((circle.x == chosenCircle.x
                    && (circle.y == chosenCircle.y + Math.abs(this.boardCenter - chosenCircle.x) || circle.y == chosenCircle.y - Math.abs(this.boardCenter - chosenCircle.x))
                ) || (circle.y == this.boardCenter && (circle.x == chosenCircle.x + 1 || circle.x == chosenCircle.x - 1))) {
                    result.push(new HighlightedCircle(circle));
                }
            }
        }
        let lastMove = this.getLastMove();
        if (lastMove) {
            return result.filter(circle => !(circle.x == lastMove.x && circle.y == lastMove.y));
        } else {
            return result;
        }
    }


    findDestinationsForAnywhereMove(): ICircle[] {
        const foundCircles: ICircle[] = this.circles.filter(circle => circle.color === Color.BLACK);
        const result = [];
        for (const circle of foundCircles) {
            result.push(new HighlightedCircle(circle));
        }
        let lastMove = this.getLastMove();
        if (lastMove) {
            return result.filter(circle => !(circle.x == lastMove.x && circle.y == lastMove.y));
        } else {
            return result;
        }
    }

    private compareCirclesPosition(circle1: ICircle, circle2: ICircle): boolean {
        return circle1.x == circle2.x && circle1.y == circle2.y;
    }

    performNormalMove(selectedCircle: ICircle): MoveResult {
        if (this.isNormalMoveAllowed(selectedCircle)) {
            return this.putPieceOnBoard(selectedCircle, false);
        }
        return MoveResult.MOVE_NOT_ALLOWED;
    }

    performRemoveMove(selectedCircle: ICircle): MoveResult {
        const removeAllowed = this.isOpponentRemoveAllowed(selectedCircle);
        if (removeAllowed && selectedCircle.x != null && selectedCircle.y != null) {
            this.setLastMove(selectedCircle);
            selectedCircle.changeColor(Color.BLACK);
            if (this.moveType === MoveType.REMOVE_OPPONENT_2) {
                this.moveType = MoveType.REMOVE_OPPONENT;
                return MoveResult.CHANGED_STATE_TO_REMOVE;
            } else {
                return MoveResult.FINISHED_TURN;
            }
        }
        return MoveResult.MOVE_NOT_ALLOWED;
    }

    performShift(selectedCircle: ICircle): MoveResult {
        if (this.isShiftFromAllowed(selectedCircle)) {
            this.chosenForShift = selectedCircle;
            switch (this.moveType) {
                case MoveType.MOVE_NEARBY:
                    this.highlightedCircles = this.findDestinationsForNearbyMove(selectedCircle);
                    break;
                case MoveType.MOVE_ANYWHERE:
                    this.highlightedCircles = this.findDestinationsForAnywhereMove();
                    break;
                default:
                    return MoveResult.MOVE_NOT_ALLOWED;
            }
            return MoveResult.SELECTED_TO_SHIFT;
        } else if (this.isShiftToAllowed(this.chosenForShift, selectedCircle)) {
            this.highlightedCircles = [];
            const chosen = this.chosenForShift;
            this.chosenForShift = null;

            this.setLastMove(chosen);
            chosen.changeColor(Color.BLACK);
            return this.putPieceOnBoard(this.circles.find(circle => circle.x == selectedCircle.x && circle.y == selectedCircle.y), true);
        }
    }
}


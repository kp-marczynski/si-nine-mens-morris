import {Color, getOpponentColor} from "./color.enum";
import {MoveType} from "./move-type.enum";
import {Circle, ICircle} from "./circle.model";
import {IPlayerState, PlayerState} from "./player-state.model";
import {IPosition} from "./position.model";
import {MoveResult} from "./move-result.enum";

export interface IGameState {
    turn: Color;
    moveType: MoveType;
    circles: ICircle[];
    shiftDestinations: ICircle[];
    baseRadiusSize: number;
    redPlayerState: IPlayerState;
    greenPlayerState: IPlayerState;

    isNormalMoveAllowed(selectedCircle: ICircle): boolean;

    isOpponentRemoveAllowed(selectedCircle: ICircle): boolean;

    isShiftFromAllowed(selectedCircle: ICircle): boolean;

    isShiftToAllowed(selectedCircle: ICircle, destinationCircle: ICircle): boolean;

    getCurrentPlayer(): IPlayerState;

    performMove(selectedCircle: ICircle): MoveResult;

    setBaseRadiusSize(size: number);
}

export class GameState implements IGameState {
    private boardCenter = 3;
    private chosenForShift: ICircle;
    private boardSize = 7;
    baseRadiusSize: number;

    turn: Color = Color.RED;
    moveType: MoveType = MoveType.NORMAL;
    circles: ICircle[] = [];
    shiftDestinations: ICircle[] = [];
    redPlayerState: IPlayerState;
    greenPlayerState: IPlayerState;
    allowedMoves: ICircle[];

    constructor() {
        this.redPlayerState = new PlayerState();
        this.greenPlayerState = new PlayerState();

        this.allowedMoves = this.circles;
    }

    setBaseRadiusSize(size: number) {
        this.baseRadiusSize = size;
        this.initCircles();
    }

    private initCircles() {
        for (let x = 0; x < this.boardSize; ++x) {
            for (let y = 0; y < this.boardSize; ++y) {
                if ((Math.abs(x - this.boardCenter) === Math.abs(y - this.boardCenter) || x === this.boardCenter || y === this.boardCenter)
                    && !(x === this.boardCenter && y === this.boardCenter)) {
                    this.circles.push(new Circle(x, y, this.baseRadiusSize));
                }
            }
        }
    }

    private getLastMove(): IPosition {
        switch (this.turn) {
            case Color.RED:
                return this.redPlayerState.lastPosition;
            case Color.GREEN:
                return this.greenPlayerState.lastPosition;
        }
    }

    private setLastMove(circle: ICircle) {
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
        return this.findDestinationsForNormalMove().find(circle => circle.x == selectedCircle.x && circle.y == selectedCircle.y) != null;
    }

    private findDestinationsForNormalMove(): ICircle[] {
        let pieces: ICircle[] = this.circles.filter(circle => circle.color === Color.BLACK);
        let lastMove = this.getLastMove();
        if (lastMove) {
            pieces = pieces.filter(circle => !(circle.x == lastMove.x && circle.y == lastMove.y));
        }
        return pieces;
    }

    isOpponentRemoveAllowed(selectedCircle: ICircle): boolean {
        return this.findDestinationsForOpponentRemove().find(circle => this.compareCirclesPosition(circle, selectedCircle)) != null;
    }

    private findDestinationsForOpponentRemove(): ICircle[] {
        return this.circles.filter(piece => piece.color === getOpponentColor(this.turn));
    }

    private findShiftSources(): ICircle[] {
        return this.circles.filter(piece => piece.color === this.turn);
    }

    isShiftFromAllowed(selectedCircle: ICircle): boolean {
        return this.findShiftSources().find(circle => this.compareCirclesPosition(circle, selectedCircle)) != null;
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

    private putPieceOnBoard(circle: ICircle, isShifting: boolean): MoveResult {
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
                        this.allowedMoves = this.findDestinationsForOpponentRemove();
                        return MoveResult.CHANGED_STATE_TO_REMOVE;
                    case 2:
                        this.moveType = MoveType.REMOVE_OPPONENT_2;
                        this.allowedMoves = this.findDestinationsForOpponentRemove();
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

    private findDestinationsForNearbyMove(chosenCircle: ICircle): ICircle[] {
        const foundCircles: ICircle[] = this.circles.filter(circle => circle.color === Color.BLACK);
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
        let lastMove = this.getLastMove();
        if (lastMove) {
            return result.filter(circle => !(circle.x == lastMove.x && circle.y == lastMove.y));
        } else {
            return result;
        }
    }


    private findDestinationsForAnywhereMove(): ICircle[] {
        const result: ICircle[] = this.circles.filter(circle => circle.color === Color.BLACK);
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

    private performNormalMove(selectedCircle: ICircle): MoveResult {
        if (this.isNormalMoveAllowed(selectedCircle)) {
            return this.putPieceOnBoard(selectedCircle, false);
        }
        return MoveResult.MOVE_NOT_ALLOWED;
    }

    private performRemoveMove(selectedCircle: ICircle): MoveResult {
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

    private performShift(selectedCircle: ICircle): MoveResult {
        if (this.isShiftFromAllowed(selectedCircle)) {
            this.chosenForShift = selectedCircle;
            switch (this.moveType) {
                case MoveType.MOVE_NEARBY:
                    this.shiftDestinations = this.findDestinationsForNearbyMove(selectedCircle);
                    break;
                case MoveType.MOVE_ANYWHERE:
                    this.shiftDestinations = this.findDestinationsForAnywhereMove();
                    break;
                default:
                    return MoveResult.MOVE_NOT_ALLOWED;
            }
            return MoveResult.SELECTED_TO_SHIFT;
        } else if (this.isShiftToAllowed(this.chosenForShift, selectedCircle)) {
            this.shiftDestinations = [];
            const chosen = this.chosenForShift;
            this.chosenForShift = null;

            this.setLastMove(chosen);
            chosen.changeColor(Color.BLACK);
            return this.putPieceOnBoard(this.circles.find(circle => circle.x == selectedCircle.x && circle.y == selectedCircle.y), true);
        }
    }

    performMove(selectedCircle: ICircle): MoveResult {
        let moveResult = MoveResult.MOVE_NOT_ALLOWED;
        switch (this.moveType) {
            case MoveType.NORMAL:
                moveResult = this.performNormalMove(selectedCircle);
                break;
            case MoveType.REMOVE_OPPONENT:
            case MoveType.REMOVE_OPPONENT_2:
                moveResult = this.performRemoveMove(selectedCircle);
                break;
            case MoveType.MOVE_NEARBY:
            case MoveType.MOVE_ANYWHERE:
                moveResult = this.performShift(selectedCircle);
                break;
            case MoveType.END_GAME:
                moveResult = MoveResult.END_GAME;
                break;
            default:
                moveResult = MoveResult.MOVE_NOT_ALLOWED;
                break;
        }
        this.updateStats();

        if (moveResult == MoveResult.FINISHED_TURN) {
            return this.initNewTurn();
        }
    }

    private initNewTurn(): MoveResult {
        this.turn = getOpponentColor(this.turn);

        const availablePieces = this.getCurrentPlayer().availablePieces;
        const usedPieces = this.getCurrentPlayer().usedPieces;

        const allPieces = usedPieces + availablePieces;

        if (allPieces < 3) {
            this.moveType = MoveType.END_GAME;
            alert("Player " + this.turn + " has lost");
        } else if (availablePieces > 0) {
            this.moveType = MoveType.NORMAL;
        } else if (usedPieces === 3) {
            if (this.checkIfAnyCanMoveNearby()) {
                this.moveType = MoveType.MOVE_ANYWHERE;
            } else {
                this.moveType = MoveType.END_GAME;
            }
        } else if (availablePieces === 0) {
            this.moveType = MoveType.MOVE_NEARBY;
        }

        if (this.moveType == MoveType.END_GAME) {
            return MoveResult.END_GAME;
        } else {
            switch (this.moveType) {
                case MoveType.NORMAL:
                    this.allowedMoves = this.findDestinationsForNormalMove();
                    break;
                case MoveType.MOVE_NEARBY:
                case MoveType.MOVE_ANYWHERE:
                    this.allowedMoves = this.findShiftSources();
                    break;
            }

            return MoveResult.FINISHED_TURN;
        }
    }


    private checkIfAnyCanMoveNearby(): boolean {
        let currentPlayerPieces = this.circles.filter(circle => circle.color == this.turn);
        for (const piece of currentPlayerPieces) {
            if (this.findDestinationsForNearbyMove(piece).length > 0) {
                return true;
            }
        }
        return false;
    }

    private updateStats() {
        this.redPlayerState.usedPieces = this.circles.filter(piece => piece.color === Color.RED).length;
        this.greenPlayerState.usedPieces = this.circles.filter(piece => piece.color === Color.GREEN).length;
    }
}


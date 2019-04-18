import {Color} from "./enum/color.enum";
import {MoveType} from "./enum/move-type.enum";
import {Circle, ICircle} from "./circle.model";
import {IPlayerState, PlayerState} from "./player-state.model";
import {PlayerType} from "./enum/player-type.enum";

export interface IGameState {
    turn: Color;
    moveType: MoveType;
    circles: ICircle[];
    shiftDestinations: ICircle[];
    redPlayerState: IPlayerState;
    greenPlayerState: IPlayerState;
    chosenForShift: ICircle;
    allowedMoves: ICircle[];
}

const boardCenter = 3;
const boardSize = 7;

export class GameState implements IGameState {
    chosenForShift: ICircle;

    turn: Color = Color.RED;
    moveType: MoveType = MoveType.NORMAL;
    circles: ICircle[] = [];
    shiftDestinations: ICircle[] = [];
    redPlayerState: IPlayerState;
    greenPlayerState: IPlayerState;
    allowedMoves: ICircle[];

    constructor(redPlayerType: PlayerType, greenPlayerType: PlayerType) {
        this.redPlayerState = new PlayerState(Color.RED, redPlayerType);
        this.greenPlayerState = new PlayerState(Color.GREEN, greenPlayerType);

        this.allowedMoves = this.circles;

        this.redPlayerState.piecesOnBoard = 0;
        this.greenPlayerState.piecesOnBoard = 0;

        for (let x = 0; x < boardSize; ++x) {
            for (let y = 0; y < boardSize; ++y) {
                if ((Math.abs(x - boardCenter) === Math.abs(y - boardCenter) || x === boardCenter || y === boardCenter)
                    && !(x === boardCenter && y === boardCenter)) {
                    this.circles.push(new Circle(x, y, 1));
                }
            }
        }
    }

}


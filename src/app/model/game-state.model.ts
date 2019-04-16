import {Color} from "./color.enum";
import {MoveType} from "./move-type.enum";
import {ICircle} from "./circle.model";
import {IPlayerState, PlayerState} from "./player-state.model";

export interface IGameState {
    turn: Color;
    moveType: MoveType;
    circles: ICircle[];

    redPlayerState: IPlayerState;
    greenPlayerState: IPlayerState;
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

}


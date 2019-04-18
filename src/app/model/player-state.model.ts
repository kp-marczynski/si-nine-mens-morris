import {ICircle} from "./circle.model";
import {Color} from "./enum/color.enum";
import {PlayerType} from "./enum/player-type.enum";

export interface IPlayerState {
    piecesInDrawer: number;
    piecesOnBoard: number;
    points: number;
    color: Color;
    previousPosition: ICircle;
    lastMovedPiece: ICircle;
    playerType: PlayerType;
}

export class PlayerState implements IPlayerState {
    piecesInDrawer: number;
    piecesOnBoard: number;
    points: number;

    previousPosition: ICircle;
    lastMovedPiece: ICircle;

    constructor(public color: Color, public playerType) {
        this.piecesInDrawer = 9;
        this.points = 0;
        this.piecesOnBoard = 0;
    }
}

export function changePlayerType(playerState: IPlayerState): void {
    switch (playerState.playerType) {
        case PlayerType.COMPUTER:
            playerState.playerType = PlayerType.HUMAN;
            break;
        case PlayerType.HUMAN:
            playerState.playerType = PlayerType.COMPUTER;
            break;
    }
}

import {ICircle} from "./circle.model";
import {Color} from "./color.enum";
import {PlayerType} from "./player-type.enum";

export interface IPlayerState {
    piecesInDrawer: number;
    piecesOnBoard: number;
    points: number;
    color: Color;
    lastPosition: ICircle;
    playerType: PlayerType;

    decreaseNumberOfAvailablePieces(): void;
}

export class PlayerState implements IPlayerState {
    piecesInDrawer: number;
    piecesOnBoard: number;
    points: number;

    lastPosition: ICircle;

    constructor(public color: Color, public playerType) {
        this.piecesInDrawer = 9;
        this.points = 0;
        this.piecesOnBoard = 0;
    }

    decreaseNumberOfAvailablePieces(): void {
        this.piecesInDrawer--;
    }

}


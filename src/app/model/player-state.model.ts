import {ICircle} from "./circle.model";
import {Color} from "./color.enum";

export interface IPlayerState {
    piecesInDrawer: number;
    piecesOnBoard: number;
    points: number;
    color: Color;
    lastPosition: ICircle;

    decreaseNumberOfAvailablePieces(): void;
}

export class PlayerState implements IPlayerState {
    piecesInDrawer: number;
    piecesOnBoard: number;
    points: number;

    lastPosition: ICircle;

    constructor(public color: Color) {
        this.piecesInDrawer = 9;
        this.points = 0;
        this.piecesOnBoard = 0;
    }

    decreaseNumberOfAvailablePieces(): void {
        this.piecesInDrawer--;
    }

}


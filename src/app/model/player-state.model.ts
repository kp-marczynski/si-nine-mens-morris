import {ICircle} from "./circle.model";
import {Color} from "./enum/color.enum";

export interface IPlayerState {
    piecesInDrawer: number;
    piecesOnBoard: number;
    points: number;
    color: Color;
    previousPosition: ICircle;
    lastMovedPiece: ICircle;
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


import {MoveType} from "./enum/move-type.enum";
import {ICircle} from "./circle.model";
import {Color} from "./enum/color.enum";

export interface IMove {
    moveType: MoveType;
    moveDescription: string;
    color: Color;
    count: number;
}

export class BasicMove implements IMove {
    moveDescription: string;

    constructor(public count: number, public color: Color, public moveType: MoveType, destination: ICircle) {
        this.moveDescription = '[' + destination.x + ';' + destination.y + ']';
    }
}

export class ShiftMove implements IMove {
    moveDescription: string;

    constructor(public count: number, public color: Color, public moveType: MoveType, source: ICircle, destination: ICircle) {
        this.moveDescription = '[' + source.x + ';' + source.y + '] - [' + destination.x + ';' + destination.y + ']';
    }
}

import {Color} from "./color.enum";

export interface ICircle {
    x: number;
    y: number;
    radius: number;
    color: Color;
}

export class BoardCircle implements ICircle {
    color = Color.BLACK;

    constructor(
        public x: number,
        public y: number,
        public radius: number
    ) {
    }

}

export class RedPiece implements ICircle {
    color = Color.RED;

    constructor(
        public x: number,
        public y: number,
        public radius: number
    ) {
    }
}

export class GreenPiece implements ICircle {
    color = Color.GREEN;

    constructor(
        public x: number,
        public y: number,
        public radius: number
    ) {
    }
}

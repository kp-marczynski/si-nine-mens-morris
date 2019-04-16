import {Color} from "./color.enum";

export interface ICircle {
    x: number;
    y: number;
    radius: number;
    color: Color;

    changeColor(color: Color): void;
}

export class Circle implements ICircle {
    color = Color.BLACK;

    constructor(
        public x: number,
        public y: number,
        public radius: number
    ) {
    }

    changeColor(color: Color): void {
        let radiusFactor = 1;
        if (this.color == Color.BLACK && color != Color.BLACK) {
            radiusFactor = 2;
        }
        if (color == Color.BLACK && this.color != Color.BLACK) {
            radiusFactor = 0.5;
        }
        this.radius *= radiusFactor;
        this.color = color;
    }

}

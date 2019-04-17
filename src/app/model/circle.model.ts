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

export class HighlightedCircle implements ICircle {
    color = Color.NONE;
    radius: number;
    x: number;
    y: number;

    constructor(
        circle: ICircle
    ) {
        this.x = circle.x;
        this.y = circle.y;
        this.radius = circle.radius * 2;
    }

    changeColor(color: Color): void {
    }

}

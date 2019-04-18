import {Color} from "./enum/color.enum";

export interface ICircle {
    x: number;
    y: number;
    radius: number;
    color: Color;
}

export class Circle implements ICircle {
    color = Color.BLACK;

    constructor(
        public x: number,
        public y: number,
        public radius: number
    ) {
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

}

export function changeColor(circle: Circle, color: Color): void {
    let radiusFactor = 1;
    if (circle.color == Color.BLACK && color != Color.BLACK) {
        radiusFactor = 2;
    }
    if (color == Color.BLACK && circle.color != Color.BLACK) {
        radiusFactor = 0.5;
    }
    circle.radius *= radiusFactor;
    circle.color = color;
}

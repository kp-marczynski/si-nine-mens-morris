import {IPosition, Position} from '../model/position.model';
import {ICircle} from '../model/circle.model';
import {Color, getColorRgbaString} from "../model/color.enum";

export class CanvasService {

    ctx: CanvasRenderingContext2D;

    constructor(private canvas: HTMLCanvasElement, private baseSize: number, private offset: number) {
        this.ctx = canvas.getContext('2d');
    }

    public drawSquare(x: number, y: number, size: number): void {
        const finalSize = size * this.baseSize;
        const finalX = this.getRealCoordinate(x);
        const finalY = this.getRealCoordinate(y);
        this.ctx.beginPath();
        this.ctx.rect(finalX, finalY, finalSize, finalSize);
        this.ctx.stroke();
    }

    public drawLine(xStart: number, yStart: number, xEnd: number, yEnd: number): void {
        this.ctx.beginPath();
        this.ctx.moveTo(this.getRealCoordinate(xStart), this.getRealCoordinate(yStart));
        this.ctx.lineTo(this.getRealCoordinate(xEnd), this.getRealCoordinate(yEnd));
        this.ctx.stroke();
    }

    public drawCircle(circle: ICircle): void {
        this.drawCircleInCoords(circle, circle.x, circle.y);
    }

    public drawCircleInCoords(circle: ICircle, x: number, y: number) {
        this.drawBasicCircleInCoords(x, y, circle.radius, circle.color);
    }

    public drawBasicCircleInCoords(x: number, y: number, radius: number, color: Color) {
        this.ctx.beginPath();
        const finalX = this.getRealCoordinate(x);
        const finalY = this.getRealCoordinate(y);
        this.ctx.arc(finalX, finalY, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = getColorRgbaString(color);
        this.ctx.fill();
    }

    public clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public getPositionInCanvas(event: UIEvent) {
        if (event instanceof MouseEvent) {
            return this.getMousePositionInCanvas(event as MouseEvent);
        } else {
            return this.getTouchPositionInCanvas(event as TouchEvent);
        }
    }

    public getMousePositionInCanvas(evt: MouseEvent): IPosition {
        const rect = this.canvas.getBoundingClientRect();
        return new Position(
            evt.clientX - rect.left,
            evt.clientY - rect.top
        );
    }

    public getTouchPositionInCanvas(evt: TouchEvent): IPosition {
        const rect = this.canvas.getBoundingClientRect();
        return new Position(
            evt.touches[0].clientX - rect.left,
            evt.touches[0].clientY - rect.top
        );
    }

    private getRealCoordinate(val: number): number {
        return val * this.baseSize + this.offset;
    }

    public isIntersect(point: IPosition, circle: ICircle): boolean {
        if (circle.x == null || circle.y == null) {
            return false;
        }

        return Math.sqrt((point.x - this.getRealCoordinate(circle.x)) ** 2
            + (point.y - this.getRealCoordinate(circle.y)) ** 2) < circle.radius * 2;
    }
}

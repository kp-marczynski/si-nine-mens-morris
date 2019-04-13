import {IPosition, Position} from './position.model';
import {ICircle} from './circle.model';

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
        this.ctx.beginPath();
        const finalX = this.getRealCoordinate(x);
        const finalY = this.getRealCoordinate(y);
        this.ctx.arc(finalX, finalY, circle.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = circle.color;
        this.ctx.fill();
    }

    public clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public getPixel(relativePosition: IPosition): string {
        return this.ctx.getImageData(relativePosition.x, relativePosition.y, 1, 1).data.toString();
    }

    public getMousePositionInCanvas(evt: MouseEvent): IPosition {
        const rect = this.canvas.getBoundingClientRect();
        return new Position(
            evt.clientX - rect.left,
            evt.clientY - rect.top
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
            + (point.y - this.getRealCoordinate(circle.y)) ** 2) < circle.radius;
    }
}

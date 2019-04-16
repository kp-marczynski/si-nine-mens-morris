import {CanvasService} from "./canvas.service";
import {Color} from "../model/color.enum";

export class DrawerService {

    canvasService: CanvasService;

    constructor(private canvas: HTMLCanvasElement, private baseSize: number, private offset: number, private numberOfPieces, private color: Color, private radiusSize: number) {
        this.canvasService = new CanvasService(canvas, baseSize, offset);
    }

    drawDrawer() {
        this.canvasService.clearCanvas();
        this.canvas.height = this.offset + this.baseSize * Math.ceil(this.numberOfPieces / 3);
        for (let i = 0; i < this.numberOfPieces; ++i) {
            this.canvasService.drawBasicCircleInCoords(i % 3, Math.floor(i / 3), this.radiusSize, this.color);
        }
    }

    public getNumberOfAvailablePieces(): number {
        return this.numberOfPieces;
    }

    decreaseNumberOfAvailablePieces(): void {
        this.numberOfPieces--;
    }
}

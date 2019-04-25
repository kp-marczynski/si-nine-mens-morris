import {CanvasService} from "./canvas.service";
import {Color} from "../model/enum/color.enum";

export class DrawerService {

    canvasService: CanvasService;

    constructor(private canvas: HTMLCanvasElement, private baseSize: number, private offset: number, public numberOfPieces, private color: Color, private radiusSize: number, private baseRadiusSize: number) {
        this.canvasService = new CanvasService(canvas, baseSize, offset, baseRadiusSize);
        this.canvas.width = (this.baseSize) * 2;
        this.canvas.height = this.offset * 2;
    }

    drawDrawer() {
        this.canvasService.clearCanvas();

        this.canvasService.writeOnCanvas(this.offset / 2, this.offset * 1.25, this.numberOfPieces + " x");
        this.canvasService.drawBasicCircleInCoords(1, 0, this.radiusSize, this.color);
    }
}

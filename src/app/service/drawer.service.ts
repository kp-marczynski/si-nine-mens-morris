import {CanvasService} from "./canvas.service";
import {Color} from "../model/enum/color.enum";

export class DrawerService {

    canvasService: CanvasService;

    constructor(private canvas: HTMLCanvasElement, private baseSize: number, private offset: number, public numberOfPieces, private color: Color, private radiusSize: number, private baseRadiusSize: number) {
        this.canvasService = new CanvasService(canvas, baseSize, offset, baseRadiusSize);
        this.canvas.width = this.offset + this.baseSize * 3;
    }

    drawDrawer() {
        this.canvasService.clearCanvas();
        this.canvas.height = this.offset + this.baseSize * Math.ceil(this.numberOfPieces / 3);

        for (let i = 0; i < this.numberOfPieces; ++i) {
            this.canvasService.drawBasicCircleInCoords(i % 3, Math.floor(i / 3), this.radiusSize, this.color);
        }
    }
}

import {AfterViewInit, Component} from '@angular/core';
import {BoardCircle, GreenPiece, ICircle, RedPiece} from './circle.model';
import {MoveType} from './move-type.enum';
import {CanvasService} from './canvas.service';
import {IPosition} from './position.model';
import {Color, getColorRgbaString} from "./color.enum";
import {DrawerService} from "./drawer.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
    canvas: HTMLCanvasElement;
    availableReds: number;
    availableGreens: number;
    usedReds: number;
    usedGreens: number;

    baseSize: number;

    offset: number;
    baseRadiusSize: number;
    turn: Color = Color.RED;
    moveType: MoveType = MoveType.NORMAL;

    circles: ICircle[] = [];

    piecesPerPlayer = 9;

    canvasService: CanvasService;

    redDrawerService: DrawerService;
    greenDrawerService: DrawerService;

    boardSize = 7;

    initCircles() {
        for (let x = 0; x < this.boardSize; ++x) {
            for (let y = 0; y < this.boardSize; ++y) {
                if ((Math.abs(x - 3) === Math.abs(y - 3) || x === 3 || y === 3) && !(x === 3 && y === 3)) {
                    this.circles.push(new BoardCircle(x, y, this.baseRadiusSize));
                }
            }
        }
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.afterVieInitCallback());
    }

    afterVieInitCallback(): void {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.baseSize = this.canvas.width / 8;
        this.offset = this.baseSize;
        this.baseRadiusSize = this.baseSize / 6;
        this.canvasService = new CanvasService(this.canvas, this.baseSize, this.offset);

        this.redDrawerService = new DrawerService(document.getElementById('red-drawer') as HTMLCanvasElement, 50, 50, this.piecesPerPlayer, Color.RED, 2 * this.baseRadiusSize);
        this.greenDrawerService = new DrawerService(document.getElementById('green-drawer') as HTMLCanvasElement, 50, 50, this.piecesPerPlayer, Color.GREEN, 2 * this.baseRadiusSize);

        this.initCircles();
        this.drawBoard();
        this.addCanvasOnClickListener();
        this.addCanvasOnMouseMoveListener();
    }


    addCanvasOnClickListener(): void {
        this.canvas.addEventListener('click', (mouseEvent) => {
            const relativePosition = this.canvasService.getMousePositionInCanvas(mouseEvent);
            const pixel = this.canvasService.getPixel(relativePosition);

            switch (this.moveType) {
                case MoveType.NORMAL:
                    this.performNormalMove(relativePosition, pixel);
                    break;
                case MoveType.REMOVE_OPPONENT:
                case MoveType.REMOVE_OPPONENT_2:
                    this.performRemoveMove(relativePosition);
                    break;
                case MoveType.MOVE_NEARBY:
                case MoveType.MOVE_ANYWHERE:
                    alert("State not implemented yet"); // todo

            }
        });
    }

    addCanvasOnMouseMoveListener(): void {
        this.canvas.addEventListener('mousemove', (mouseEvent) => {
            const relativePosition = this.canvasService.getMousePositionInCanvas(mouseEvent);
            const pixel = this.canvasService.getPixel(relativePosition);
            if (this.moveType === MoveType.NORMAL) {
                if (this.findCircleOnBoardForNormalMove(relativePosition, pixel)) {
                    this.canvas.style.cursor = 'pointer';
                } else {
                    this.canvas.style.cursor = 'default';
                }
            } else if (this.moveType === MoveType.REMOVE_OPPONENT) {
                if (this.findIntersectingPieceForRemove(relativePosition)) {
                    this.canvas.style.cursor = 'pointer';
                } else {
                    this.canvas.style.cursor = 'default';
                }
            }
        });
    }

    performNormalMove(relativePosition: IPosition, pixel: string): void {
        const foundCircle = this.findCircleOnBoardForNormalMove(relativePosition, pixel);
        if (foundCircle) {
            if (this.turn === Color.RED) {
                this.setAvailablePiece(this.redDrawerService, foundCircle);
            } else {
                this.setAvailablePiece(this.greenDrawerService, foundCircle);
            }
        }
    }

    findCircleOnBoardForNormalMove(relativePosition: IPosition, pixel: string): ICircle {
        for (const circle of this.circles) {
            if (this.canvasService.isIntersect(relativePosition, circle)) {
                if (getColorRgbaString(Color.BLACK) === 'rgba(' + pixel + ')') {
                    return circle;
                }
            }
        }
        return null;
    }

    findIntersectingPieceForRemove(relativePosition: IPosition): ICircle {
        let pieces: ICircle[];

        if (this.turn === Color.GREEN) {
            pieces = this.circles.filter(piece => piece instanceof RedPiece);
        } else {
            pieces = this.circles.filter(piece => piece instanceof GreenPiece);
        }
        return this.findIntersectingPiece(pieces, relativePosition);
    }

    performRemoveMove(relativePosition: IPosition): void {
        const foundPiece = this.findIntersectingPieceForRemove(relativePosition);
        if (foundPiece && foundPiece.x != null && foundPiece.y != null) {
            this.circles = this.circles.filter(circle => circle.x != foundPiece.x || circle.y != foundPiece.y);
            this.circles.push(new BoardCircle(foundPiece.x, foundPiece.y, this.baseRadiusSize));
            if (this.moveType === MoveType.REMOVE_OPPONENT_2) {
                this.moveType = MoveType.REMOVE_OPPONENT;
                this.drawBoard();
            } else {
                this.moveType = MoveType.NORMAL;
                this.changeTurn();
            }
        }
    }

    drawBoard(): void {
        this.canvasService.clearCanvas();
        this.canvasService.drawSquare(2, 2, 2);
        this.canvasService.drawSquare(1, 1, 4);
        this.canvasService.drawSquare(0, 0, 6);
        this.canvasService.drawLine(0, 3, 2, 3);
        this.canvasService.drawLine(4, 3, 6, 3);
        this.canvasService.drawLine(3, 0, 3, 2);
        this.canvasService.drawLine(3, 4, 3, 6);

        this.circles.forEach(circle => {
            this.canvasService.drawCircle(circle);
        });

        this.availableReds = this.redDrawerService.getNumberOfAvailablePieces();
        this.availableGreens = this.greenDrawerService.getNumberOfAvailablePieces();

        this.usedReds = this.circles.filter(piece => piece instanceof RedPiece).length;
        this.usedGreens = this.circles.filter(piece => piece instanceof GreenPiece).length;

        this.redDrawerService.drawDrawer();
        this.greenDrawerService.drawDrawer();
    }

    getNewPieceForColor(color: Color) {
        switch (color) {
            case Color.RED:
                return new RedPiece(null, null, 2 * this.baseRadiusSize);
            case Color.GREEN:
                return new GreenPiece(null, null, 2 * this.baseRadiusSize);
        }
    }

    setAvailablePiece(drawerService: DrawerService, circle: ICircle): void {
        if (drawerService.getNumberOfAvailablePieces() > 0) {
            this.circles = this.circles.filter(c => c.x != circle.x || c.y != circle.y);
            const foundPiece = this.getNewPieceForColor(this.turn);
            foundPiece.x = circle.x;
            foundPiece.y = circle.y;
            this.circles.push(foundPiece);
            drawerService.decreaseNumberOfAvailablePieces();
            const pieces = this.circles.filter(c => c.color === foundPiece.color);
            const mill = this.checkForMill(pieces, foundPiece);
            switch (mill) {
                case 1:
                    this.moveType = MoveType.REMOVE_OPPONENT;
                    this.drawBoard();
                    break;
                case 2:
                    this.moveType = MoveType.REMOVE_OPPONENT_2;
                    this.drawBoard();
                    break;
                default:
                    this.changeTurn();
                    break;
            }
        }
    }

    changeTurn() {
        if (this.turn === Color.RED) {
            this.turn = Color.GREEN;
        } else {
            this.turn = Color.RED;
        }
        this.adjustMoveType();
        this.drawBoard();
    }

    adjustMoveType() {
        let numberOfAvailablePieces = 0;
        let numberOfAllPieces = 0;
        if (this.turn === Color.RED) {
            numberOfAllPieces = this.usedReds + this.availableReds;
            numberOfAvailablePieces = this.availableReds;
        } else {
            numberOfAllPieces = this.usedGreens + this.availableGreens;
            numberOfAvailablePieces = this.availableGreens;
        }

        if (numberOfAllPieces < 3) {
            alert("Player " + this.turn + " has lost");
        } else if (numberOfAllPieces === 3) {
            this.moveType = MoveType.MOVE_ANYWHERE;
        } else if (numberOfAvailablePieces === 0) {
            this.moveType = MoveType.MOVE_NEARBY;
        }
    }

    checkForMill(pieces: ICircle[], newPiece: ICircle): number {
        let result = 0;
        if (newPiece.x === 3) {
            if (pieces.filter(piece => piece.x === newPiece.x &&
                ((newPiece.y > 3 && piece.y > 3) || (newPiece.y < 3 && piece.y < 3))).length === 3) {
                result++;
            }
        } else {
            if (pieces.filter(piece => piece.x === newPiece.x).length === 3) {
                result++;
            }
        }

        if (newPiece.y === 3) {
            if (pieces.filter(piece => piece.y === newPiece.y &&
                ((newPiece.x > 3 && piece.x > 3) || (newPiece.x < 3 && piece.x < 3))).length === 3) {
                result++;
            }
        } else {
            if (pieces.filter(piece => piece.y === newPiece.y).length === 3) {
                result++;
            }
        }
        return result;
    }

    findIntersectingPiece(pieces: ICircle[], relativePosition: IPosition): ICircle {
        for (const piece of pieces) {
            if (this.canvasService.isIntersect(relativePosition, piece)) {
                return piece;
            }
        }
        return null;
    }
}

import {AfterViewInit, Component} from '@angular/core';
import {BoardCircle, GreenPiece, ICircle, RedPiece} from './circle.model';
import {MoveType} from './move-type.enum';
import {CanvasService} from './canvas.service';
import {IPosition} from './position.model';
import {Turn} from "./turn.enum";

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
    turn: Turn = Turn.RED;
    moveType: MoveType = MoveType.NORMAL;
    redPieces: ICircle[] = [];
    greenPieces: ICircle[] = [];

    circles: ICircle[] = [];

    piecesPerPlayer = 15;

    canvasService: CanvasService;

    initCircles() {
        this.circles = [
            new BoardCircle(0, 0, this.baseRadiusSize),
            new BoardCircle(3, 0, this.baseRadiusSize),
            new BoardCircle(6, 0, this.baseRadiusSize),

            new BoardCircle(1, 1, this.baseRadiusSize),
            new BoardCircle(3, 1, this.baseRadiusSize),
            new BoardCircle(5, 1, this.baseRadiusSize),

            new BoardCircle(2, 2, this.baseRadiusSize),
            new BoardCircle(3, 2, this.baseRadiusSize),
            new BoardCircle(4, 2, this.baseRadiusSize),

            new BoardCircle(0, 3, this.baseRadiusSize),
            new BoardCircle(1, 3, this.baseRadiusSize),
            new BoardCircle(2, 3, this.baseRadiusSize),

            new BoardCircle(4, 3, this.baseRadiusSize),
            new BoardCircle(5, 3, this.baseRadiusSize),
            new BoardCircle(6, 3, this.baseRadiusSize),

            new BoardCircle(2, 4, this.baseRadiusSize),
            new BoardCircle(3, 4, this.baseRadiusSize),
            new BoardCircle(4, 4, this.baseRadiusSize),

            new BoardCircle(1, 5, this.baseRadiusSize),
            new BoardCircle(3, 5, this.baseRadiusSize),
            new BoardCircle(5, 5, this.baseRadiusSize),

            new BoardCircle(0, 6, this.baseRadiusSize),
            new BoardCircle(3, 6, this.baseRadiusSize),
            new BoardCircle(6, 6, this.baseRadiusSize),
        ];
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

        this.initializePlayersPieces();

        this.initCircles();
        this.drawBoard();
        this.addCanvasOnClickListener();
        this.addCanvasOnMouseMoveListener();
    }

    initializePlayersPieces(): void {
        for (let i = 0; i < this.piecesPerPlayer; ++i) {
            this.redPieces.push(new RedPiece(null, null, this.baseRadiusSize * 2));
            this.greenPieces.push(new GreenPiece(null, null, this.baseRadiusSize * 2));
        }
    }

    addCanvasOnClickListener(): void {
        this.canvas.addEventListener('click', (mouseEvent) => {
            const relativePosition = this.canvasService.getMousePositionInCanvas(mouseEvent);
            const pixel = this.canvasService.getPixel(relativePosition);
            if (this.moveType === MoveType.NORMAL) {
                this.performNormalMove(relativePosition, pixel);
            } else if (this.moveType === MoveType.REMOVE) {
                this.performRemoveMove(relativePosition);
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
            } else if (this.moveType === MoveType.REMOVE) {
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
            if (this.turn === Turn.RED) {
                this.setAvailablePiece(this.redPieces, foundCircle);
            } else {
                this.setAvailablePiece(this.greenPieces, foundCircle);
            }
        }
    }

    findCircleOnBoardForNormalMove(relativePosition: IPosition, pixel: string): ICircle {
        for (const circle of this.circles) {
            if (this.canvasService.isIntersect(relativePosition, circle)) {
                if (circle.color === 'rgba(' + pixel + ')') {
                    return circle;
                }
            }
        }
        return null;
    }

    findIntersectingPieceForRemove(relativePosition: IPosition): ICircle {
        let pieces: ICircle[];

        if (this.turn === Turn.GREEN) {
            pieces = this.redPieces;
        } else {
            pieces = this.greenPieces;
        }
        return this.findIntersectingPiece(pieces, relativePosition);
    }

    performRemoveMove(relativePosition: IPosition): void {
        const foundPiece = this.findIntersectingPieceForRemove(relativePosition);
        if (foundPiece) {
            if (foundPiece instanceof RedPiece) {
                this.redPieces = this.redPieces.filter(piece => piece.x !== foundPiece.x || piece.y !== foundPiece.y);
            } else {
                this.greenPieces = this.greenPieces.filter(piece => piece.x !== foundPiece.x || piece.y !== foundPiece.y);
            }
            this.moveType = MoveType.NORMAL;
            this.changeTurn();
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

        this.redPieces.filter(piece => piece.x != null && piece.y != null)
            .forEach(filteredPiece => this.canvasService.drawCircle(filteredPiece));
        this.greenPieces.filter(piece => piece.x != null && piece.y != null)
            .forEach(filteredPiece => this.canvasService.drawCircle(filteredPiece));

        this.availableReds = this.redPieces.filter(piece => piece.x == null && piece.y == null).length;
        this.availableGreens = this.greenPieces.filter(piece => piece.x == null && piece.y == null).length;

        this.usedReds = this.redPieces.filter(piece => piece.x != null && piece.y != null).length;
        this.usedGreens = this.greenPieces.filter(piece => piece.x != null && piece.y != null).length;
    }


    setAvailablePiece(pieces: ICircle[], circle: ICircle): void {
        const foundPiece = pieces.find(piece => piece.x == null && piece.y == null);
        if (foundPiece) {
            foundPiece.x = circle.x;
            foundPiece.y = circle.y;
            if (this.checkForMill(pieces, foundPiece)) {
                this.moveType = MoveType.REMOVE;
                this.drawBoard();
            } else {
                this.changeTurn();
            }
        }
    }

    changeTurn() {
        if (this.turn === Turn.RED) {
            this.turn = Turn.GREEN;
        } else {
            this.turn = Turn.RED;
        }
        this.drawBoard();
    }

    checkForMill(pieces: ICircle[], newPiece: ICircle): boolean {
        if (newPiece.x === 3) {
            if (pieces.filter(piece => piece.x === newPiece.x &&
                ((newPiece.y > 3 && piece.y > 3) || (newPiece.y < 3 && piece.y < 3))).length === 3) {
                return true;
            }
        } else {
            if (pieces.filter(piece => piece.x === newPiece.x).length === 3) {
                return true;
            }
        }

        if (newPiece.y === 3) {
            if (pieces.filter(piece => piece.y === newPiece.y &&
                ((newPiece.x > 3 && piece.x > 3) || (newPiece.x < 3 && piece.x < 3))).length === 3) {
                return true;
            }
        } else {
            if (pieces.filter(piece => piece.y === newPiece.y).length === 3) {
                return true;
            }
        }
        return false;
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

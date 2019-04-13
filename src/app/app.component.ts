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

    piecesPerPlayer = 9;

    canvasService: CanvasService;

    redDrawerCanvasService: CanvasService;
    greenDrawerCanvasService: CanvasService;

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

        this.redDrawerCanvasService = new CanvasService(document.getElementById('red-drawer') as HTMLCanvasElement, 50, 50);
        this.greenDrawerCanvasService = new CanvasService(document.getElementById('green-drawer') as HTMLCanvasElement, 50, 50);

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
            } else if (this.moveType === MoveType.REMOVE_OPPONENT || this.moveType === MoveType.REMOVE_OPPONENT_2) {
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

        this.redPieces.filter(piece => piece.x != null && piece.y != null)
            .forEach(filteredPiece => this.canvasService.drawCircle(filteredPiece));
        this.greenPieces.filter(piece => piece.x != null && piece.y != null)
            .forEach(filteredPiece => this.canvasService.drawCircle(filteredPiece));

        this.availableReds = this.redPieces.filter(piece => piece.x == null && piece.y == null).length;
        this.availableGreens = this.greenPieces.filter(piece => piece.x == null && piece.y == null).length;

        this.usedReds = this.redPieces.filter(piece => piece.x != null && piece.y != null).length;
        this.usedGreens = this.greenPieces.filter(piece => piece.x != null && piece.y != null).length;

        this.drawRedDrawer();
        this.drawGreenDrawer();
    }

    drawRedDrawer() {
        this.redDrawerCanvasService.clearCanvas();
        let circlesForDrawer = this.redPieces.filter(piece => piece.x == null && piece.y == null);
        for (let i = 0; i < circlesForDrawer.length; ++i) {
            this.redDrawerCanvasService.drawCircleInCoords(circlesForDrawer[i], i % 3, Math.floor(i / 3));
        }
    }

    drawGreenDrawer() {
        this.greenDrawerCanvasService.clearCanvas();
        let circlesForDrawer = this.greenPieces.filter(piece => piece.x == null && piece.y == null);
        for (let i = 0; i < circlesForDrawer.length; ++i) {
            this.greenDrawerCanvasService.drawCircleInCoords(circlesForDrawer[i], i % 3, Math.floor(i / 3));
        }
    }

    setAvailablePiece(pieces: ICircle[], circle: ICircle): void {
        const foundPiece = pieces.find(piece => piece.x == null && piece.y == null);
        if (foundPiece) {
            foundPiece.x = circle.x;
            foundPiece.y = circle.y;
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
        if (this.turn === Turn.RED) {
            this.turn = Turn.GREEN;
        } else {
            this.turn = Turn.RED;
        }
        this.adjustMoveType();
        this.drawBoard();
    }

    adjustMoveType() {
        let numberOfAvailablePieces = 0;
        let numberOfAllPieces = 0;
        if (this.turn === Turn.RED) {
            numberOfAllPieces = this.redPieces.length;
            numberOfAvailablePieces = this.redPieces.filter(piece => piece.x === null && piece.y === null).length;
        } else {
            numberOfAllPieces = this.greenPieces.length;
            numberOfAvailablePieces = this.greenPieces.filter(piece => piece.x === null && piece.y === null).length;
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

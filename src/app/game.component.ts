import {AfterViewInit, Component} from '@angular/core';
import {Circle, ICircle} from './circle.model';
import {MoveType} from './move-type.enum';
import {CanvasService} from './canvas.service';
import {IPosition} from './position.model';
import {Color, getOpponentColor} from "./color.enum";
import {DrawerService} from "./drawer.service";

@Component({
    selector: 'app-root',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
})
export class GameComponent implements AfterViewInit {
    turn: Color = Color.RED;
    moveType: MoveType = MoveType.NORMAL;
    piecesPerPlayer = 9;
    boardSize = 7;

    canvas: HTMLCanvasElement;
    availableReds: number;
    availableGreens: number;
    usedReds: number;
    usedGreens: number;

    baseSize: number;

    offset: number;
    baseRadiusSize: number;
    circles: ICircle[] = [];

    canvasService: CanvasService;

    redDrawerService: DrawerService;
    greenDrawerService: DrawerService;

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

    initCircles() {
        for (let x = 0; x < this.boardSize; ++x) {
            for (let y = 0; y < this.boardSize; ++y) {
                if ((Math.abs(x - 3) === Math.abs(y - 3) || x === 3 || y === 3)
                    && !(x === 3 && y === 3)) {
                    this.circles.push(new Circle(x, y, this.baseRadiusSize));
                }
            }
        }
    }

    addCanvasOnClickListener(): void {
        this.canvas.addEventListener('click', (mouseEvent) => {
            const relativePosition = this.canvasService.getMousePositionInCanvas(mouseEvent);

            switch (this.moveType) {
                case MoveType.NORMAL:
                    this.performNormalMove(relativePosition);
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
            let circleFound = false;
            switch (this.moveType) {
                case MoveType.NORMAL:
                    circleFound = this.findCircleOnBoardForNormalMove(relativePosition) != null;
                    break;
                case MoveType.REMOVE_OPPONENT:
                case MoveType.REMOVE_OPPONENT_2:
                    circleFound = this.findCircleOnBoardForRemove(relativePosition) != null;
                    break;
                case MoveType.MOVE_NEARBY:
                case MoveType.MOVE_ANYWHERE:
                    break;
            }

            if (circleFound) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        });
    }

    performNormalMove(relativePosition: IPosition): void {
        const foundCircle = this.findCircleOnBoardForNormalMove(relativePosition);
        if (foundCircle) {
            this.putPieceOnBoard(foundCircle);
        }
    }

    performRemoveMove(relativePosition: IPosition): void {
        const foundPiece = this.findCircleOnBoardForRemove(relativePosition);
        if (foundPiece && foundPiece.x != null && foundPiece.y != null) {
            foundPiece.changeColor(Color.BLACK);
            if (this.moveType === MoveType.REMOVE_OPPONENT_2) {
                this.moveType = MoveType.REMOVE_OPPONENT;
                this.drawBoard();
            } else {
                this.moveType = MoveType.NORMAL;
                this.changeTurn();
            }
        }
    }

    performNearbyMove(relativePosition: IPosition): void {
        //todo
    }

    performAnywhereMove(relativePosition: IPosition): void {
        //todo
    }

    findCircleOnBoardForNormalMove(relativePosition: IPosition): ICircle {
        const pieces: ICircle[] = this.circles.filter(circle => circle.color === Color.BLACK);
        return this.findIntersectingPiece(pieces, relativePosition);
    }

    findCircleOnBoardForRemove(relativePosition: IPosition): ICircle {
        let pieces: ICircle[] = this.circles.filter(piece => piece.color === getOpponentColor(this.turn));
        return this.findIntersectingPiece(pieces, relativePosition);
    }

    findCircleOnBoardForNearbyMove(relativePosition: IPosition): ICircle {
        //todo
        return null;
    }

    findCircleOnBoardForAnywhereMove(relativePosition: IPosition): ICircle {
        //todo
        return null;
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

        this.calculateStats();

        this.redDrawerService.drawDrawer();
        this.greenDrawerService.drawDrawer();
    }

    calculateStats() {
        this.availableReds = this.redDrawerService.getNumberOfAvailablePieces();
        this.availableGreens = this.greenDrawerService.getNumberOfAvailablePieces();

        this.usedReds = this.circles.filter(piece => piece.color === Color.RED).length;
        this.usedGreens = this.circles.filter(piece => piece.color === Color.GREEN).length;
    }

    putPieceOnBoard(circle: ICircle): void {
        const drawerService = this.getDrawerServiceForCurrentPlayer();
        if (drawerService.getNumberOfAvailablePieces() > 0) {
            circle.changeColor(this.turn);
            drawerService.decreaseNumberOfAvailablePieces();

            const pieces = this.circles.filter(c => c.color === this.turn);
            const mill = this.checkForMill(pieces, circle);

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

    getDrawerServiceForCurrentPlayer(): DrawerService {
        switch (this.turn) {
            case Color.RED:
                return this.redDrawerService;
            case Color.GREEN:
                return this.greenDrawerService;
        }
    }

    changeTurn() {
        this.turn = getOpponentColor(this.turn);
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

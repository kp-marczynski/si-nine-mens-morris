import {AfterViewInit, Component} from '@angular/core';
import {Circle, HighlightedCircle, ICircle} from './model/circle.model';
import {MoveType} from './model/move-type.enum';
import {CanvasService} from './service/canvas.service';
import {IPosition} from './model/position.model';
import {Color, getOpponentColor} from "./model/color.enum";
import {DrawerService} from "./service/drawer.service";
import {getWinSize, isBigScreen} from "./service/window-size.service";

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
    boardCenter = 3;

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

    highlightedCircles: ICircle[] = [];
    chosenForShift: ICircle = null;

    lastRed: ICircle = null;
    lastGreen: ICircle = null;

    ngAfterViewInit(): void {
        setTimeout(() => this.afterVieInitCallback());
    }

    afterVieInitCallback(): void {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        if (!isBigScreen()) {
            this.canvas.width = 0.8 * getWinSize();
            this.canvas.height = 0.8 * getWinSize();
        } else {
            this.canvas.width = 500;
            this.canvas.height = 500;
        }

        this.baseSize = this.canvas.width / 8;
        this.offset = this.baseSize;
        this.baseRadiusSize = this.baseSize / 6;
        this.canvasService = new CanvasService(this.canvas, this.baseSize, this.offset);

        this.redDrawerService = new DrawerService(document.getElementById('red-drawer') as HTMLCanvasElement,
            this.baseSize,
            this.offset,
            this.piecesPerPlayer,
            Color.RED,
            2 * this.baseRadiusSize);
        this.greenDrawerService = new DrawerService(document.getElementById('green-drawer') as HTMLCanvasElement,
            this.baseSize,
            this.offset,
            this.piecesPerPlayer,
            Color.GREEN,
            2 * this.baseRadiusSize);

        this.initCircles();
        this.drawBoard();
        this.addCanvasOnClickListener();
        this.addCanvasOnMouseMoveListener();
        this.addCanvasOnTouchListener();
    }

    initCircles() {
        for (let x = 0; x < this.boardSize; ++x) {
            for (let y = 0; y < this.boardSize; ++y) {
                if ((Math.abs(x - this.boardCenter) === Math.abs(y - this.boardCenter) || x === this.boardCenter || y === this.boardCenter)
                    && !(x === this.boardCenter && y === this.boardCenter)) {
                    this.circles.push(new Circle(x, y, this.baseRadiusSize));
                }
            }
        }
    }

    addCanvasOnTouchListener(): void {
        this.canvas.addEventListener('touchstart', (touchEvent) => this.onClickOrTouchListener(touchEvent));
    }

    addCanvasOnClickListener(): void {
        this.canvas.addEventListener('click', (mouseEvent) => this.onClickOrTouchListener(mouseEvent));
    }

    onClickOrTouchListener(event: UIEvent) {
        const relativePosition = this.canvasService.getPositionInCanvas(event);
        event.preventDefault();
        switch (this.moveType) {
            case MoveType.NORMAL:
                this.performNormalMove(relativePosition);
                break;
            case MoveType.REMOVE_OPPONENT:
            case MoveType.REMOVE_OPPONENT_2:
                this.performRemoveMove(relativePosition);
                break;
            case MoveType.MOVE_NEARBY:
                this.performNearbyMove(relativePosition);
                break;
            case MoveType.MOVE_ANYWHERE:
                this.performAnywhereMove(relativePosition);
                break;
        }
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
                    circleFound = this.findCircleOnBoardForShift(relativePosition) != null;
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
            this.setLastMove(foundPiece);
            if (this.moveType === MoveType.REMOVE_OPPONENT_2) {
                this.moveType = MoveType.REMOVE_OPPONENT;
                this.drawBoard();
            } else {
                this.changeTurn();
            }
        }
    }

    performNearbyMove(relativePosition: IPosition): void {
        const circleForShift = this.findCircleOnBoardForShift(relativePosition);

        if (circleForShift) {
            this.chosenForShift = circleForShift;
            this.highlightedCircles = this.findCirclesForNearbyMove(circleForShift);
            this.drawBoard();

        } else {
            const foundCircle = this.findHighlightedCircle(relativePosition);
            if (foundCircle) {
                this.putPieceOnBoard(this.circles.find(circle => circle.x == foundCircle.x && circle.y == foundCircle.y));
            }
        }
    }

    performAnywhereMove(relativePosition: IPosition): void {
        const circleForShift = this.findCircleOnBoardForShift(relativePosition);

        if (circleForShift) {
            this.chosenForShift = circleForShift;
            this.highlightedCircles = this.findCirclesOnBoardForAnywhereMove(circleForShift);
            this.drawBoard();

        } else {
            const foundCircle = this.findHighlightedCircle(relativePosition);
            if (foundCircle) {
                this.putPieceOnBoard(this.circles.find(circle => circle.x == foundCircle.x && circle.y == foundCircle.y));
            }
        }
    }

    findCircleOnBoardForNormalMove(relativePosition: IPosition): ICircle {
        let lastMove = this.getLastMove();
        const pieces: ICircle[] = this.circles.filter(circle => circle.color === Color.BLACK && !(circle.x == lastMove.x && circle.y == lastMove.y));
        return this.findIntersectingPiece(pieces, relativePosition);
    }

    findHighlightedCircle(relativePosition: IPosition): ICircle {
        return this.findIntersectingPiece(this.highlightedCircles, relativePosition);
    }

    findCircleOnBoardForRemove(relativePosition: IPosition): ICircle {
        let pieces: ICircle[] = this.circles.filter(piece => piece.color === getOpponentColor(this.turn));
        return this.findIntersectingPiece(pieces, relativePosition);
    }

    findCircleOnBoardForShift(relativePosition: IPosition): ICircle {
        let pieces: ICircle[] = this.circles.filter(piece => piece.color === this.turn);
        return this.findIntersectingPiece(pieces, relativePosition);
    }

    findCirclesForNearbyMove(chosenCircle: ICircle): ICircle[] {
        const foundCircles: ICircle[] = this.circles.filter(circle => circle.color === Color.BLACK);
        const result = [];

        for (const circle of foundCircles) {
            if (Math.abs(this.boardCenter - chosenCircle.x) == Math.abs(this.boardCenter - chosenCircle.y)) {
                if ((circle.x == chosenCircle.x && circle.y == this.boardCenter) || (circle.x == this.boardCenter && circle.y == chosenCircle.y)) {
                    result.push(new HighlightedCircle(circle));
                }
            } else if (chosenCircle.x == this.boardCenter) {
                if ((circle.y == chosenCircle.y
                    && (circle.x == chosenCircle.x + Math.abs(this.boardCenter - chosenCircle.y) || circle.x == chosenCircle.x - Math.abs(this.boardCenter - chosenCircle.y))
                ) || (circle.x == this.boardCenter && (circle.y == chosenCircle.y + 1 || circle.y == chosenCircle.y - 1))) {
                    result.push(new HighlightedCircle(circle));
                }

            } else if (chosenCircle.y == this.boardCenter) {
                if ((circle.x == chosenCircle.x
                    && (circle.y == chosenCircle.y + Math.abs(this.boardCenter - chosenCircle.x) || circle.y == chosenCircle.y - Math.abs(this.boardCenter - chosenCircle.x))
                ) || (circle.y == this.boardCenter && (circle.x == chosenCircle.x + 1 || circle.x == chosenCircle.x - 1))) {
                    result.push(new HighlightedCircle(circle));
                }
            }
        }
        return result;
    }

    findCirclesOnBoardForAnywhereMove(chosenCircle: ICircle): ICircle[] {
        const foundCircles: ICircle[] = this.circles.filter(circle => circle.color === Color.BLACK);
        const result = [];
        for (const circle of foundCircles) {
            result.push(new HighlightedCircle(circle));
        }
        return result;
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

        this.circles.forEach(circle => this.canvasService.drawCircle(circle));
        this.highlightedCircles.forEach(circle => this.canvasService.drawCircle(circle));

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
        if (circle == this.getLastMove()) {
            alert('You cant put piece on last used position');
            this.drawBoard();
        } else {
            this.highlightedCircles = [];
            const drawerService = this.getDrawerServiceForCurrentPlayer();

            let movePossible: boolean = false;

            if (drawerService.getNumberOfAvailablePieces() > 0) {
                drawerService.decreaseNumberOfAvailablePieces();
                movePossible = true;
            }
            if (this.chosenForShift) {
                this.chosenForShift.changeColor(Color.BLACK);
                this.chosenForShift = null;
                movePossible = true;
            }


            if (movePossible) {
                circle.changeColor(this.turn);
                this.setLastMove(circle);

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
    }

    setLastMove(circle: ICircle) {
        switch (circle.color) {
            case Color.RED:
                this.lastRed = circle;
                break;
            case Color.GREEN:
                this.lastGreen = circle;
                break;
        }
    }

    getLastMove(): ICircle {
        switch (this.turn) {
            case Color.RED:
                return this.lastRed;
            case Color.GREEN:
                return this.lastGreen;
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
        this.setMoveType();
        this.drawBoard();
    }

    setMoveType() {
        this.calculateStats();
        let availablePieces = 0;
        let usedPieces = 0;
        if (this.turn === Color.RED) {
            usedPieces = this.usedReds;
            availablePieces = this.availableReds;
        } else {
            usedPieces = this.usedGreens;
            availablePieces = this.availableGreens;
        }

        const allPieces = usedPieces + availablePieces;

        if (allPieces < 3) {
            this.moveType = MoveType.END_GAME;
            alert("Player " + this.turn + " has lost");
        } else if (availablePieces > 0) {
            this.moveType = MoveType.NORMAL;
        } else if (usedPieces === 3) {
            if (this.checkIfAnyCanMoveNearby()) {
                this.moveType = MoveType.MOVE_ANYWHERE;
            } else {
                this.moveType = MoveType.END_GAME;
            }
        } else if (availablePieces === 0) {
            this.moveType = MoveType.MOVE_NEARBY;
        }
    }

    checkIfAnyCanMoveNearby(): boolean {
        let currentPlayerPieces = this.circles.filter(circle => circle.color == this.turn);
        for (const piece of currentPlayerPieces) {
            if (this.findCirclesForNearbyMove(piece).length > 0) {
                return true;
            }
        }
        return false;
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

import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Circle, HighlightedCircle, ICircle} from './model/circle.model';
import {MoveType} from './model/move-type.enum';
import {CanvasService} from './service/canvas.service';
import {IPosition} from './model/position.model';
import {Color, getOpponentColor} from "./model/color.enum";
import {DrawerService} from "./service/drawer.service";
import {getWinSize, isBigScreen} from "./service/window-size.service";
import {GameState, IGameState} from "./model/game-state.model";
import {PutPieceResult} from "./model/put-piece-result.enum";

@Component({
    selector: 'app-root',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
})
export class GameComponent implements AfterViewInit, OnInit {
    boardSize = 7;
    boardCenter = 3;

    baseSize: number;
    offset: number;
    baseRadiusSize: number;

    canvas: HTMLCanvasElement;
    canvasService: CanvasService;

    redDrawerService: DrawerService;
    greenDrawerService: DrawerService;

    highlightedCircles: ICircle[] = [];
    chosenForShift: ICircle = null;

    gameState: IGameState = null;

    ngOnInit(): void {
        this.gameState = new GameState();
    }

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
            this.gameState.redPlayerState.availablePieces,
            Color.RED,
            2 * this.baseRadiusSize);
        this.greenDrawerService = new DrawerService(document.getElementById('green-drawer') as HTMLCanvasElement,
            this.baseSize,
            this.offset,
            this.gameState.greenPlayerState.availablePieces,
            Color.GREEN,
            2 * this.baseRadiusSize);

        this.initCircles();
        this.drawBoard(this.gameState);
        this.addCanvasOnClickListener();
        this.addCanvasOnMouseMoveListener();
        this.addCanvasOnTouchListener();
    }

    initCircles() {
        for (let x = 0; x < this.boardSize; ++x) {
            for (let y = 0; y < this.boardSize; ++y) {
                if ((Math.abs(x - this.boardCenter) === Math.abs(y - this.boardCenter) || x === this.boardCenter || y === this.boardCenter)
                    && !(x === this.boardCenter && y === this.boardCenter)) {
                    this.gameState.circles.push(new Circle(x, y, this.baseRadiusSize));
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
        event.preventDefault();
        const relativePosition = this.canvasService.getPositionInCanvas(event);
        const selectedCircle: ICircle = this.findIntersectingPiece(this.gameState.circles, relativePosition);
        if (selectedCircle) {
            switch (this.gameState.moveType) {
                case MoveType.NORMAL:
                    this.performNormalMove(this.gameState, selectedCircle);
                    break;
                case MoveType.REMOVE_OPPONENT:
                case MoveType.REMOVE_OPPONENT_2:
                    this.performRemoveMove(this.gameState, selectedCircle);
                    break;
                case MoveType.MOVE_NEARBY:
                    this.performNearbyMove(this.gameState, selectedCircle);
                    break;
                case MoveType.MOVE_ANYWHERE:
                    this.performAnywhereMove(this.gameState, selectedCircle);
                    break;
            }
        }
    }

    addCanvasOnMouseMoveListener(): void {
        this.canvas.addEventListener('mousemove', (mouseEvent) => {
            const relativePosition = this.canvasService.getMousePositionInCanvas(mouseEvent);
            const hoveredCircle: ICircle = this.findIntersectingPiece(this.gameState.circles, relativePosition);
            let circleFound = false;

            if (hoveredCircle) {
                switch (this.gameState.moveType) {
                    case MoveType.NORMAL:
                        circleFound = this.gameState.isNormalMoveAllowed(hoveredCircle) != null;
                        break;
                    case MoveType.REMOVE_OPPONENT:
                    case MoveType.REMOVE_OPPONENT_2:
                        circleFound = this.gameState.isOpponentRemoveAllowed(hoveredCircle) != null;
                        break;
                    case MoveType.MOVE_NEARBY:
                    case MoveType.MOVE_ANYWHERE:
                        circleFound = this.gameState.isShiftAllowed(hoveredCircle) != null;
                        break;
                }
            }
            if (circleFound) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        });
    }


    performNormalMove(gameState: IGameState, selectedCircle: ICircle): void {
        if (gameState.isNormalMoveAllowed(selectedCircle)) {
            this.putPieceOnBoard(gameState, selectedCircle, false);
        }
    }

    performRemoveMove(gameState: IGameState, selectedCircle: ICircle): void {
        const removeAllowed = gameState.isOpponentRemoveAllowed(selectedCircle);
        if (removeAllowed && selectedCircle.x != null && selectedCircle.y != null) {
            selectedCircle.changeColor(Color.BLACK);
            gameState.setLastMove(selectedCircle);
            if (gameState.moveType === MoveType.REMOVE_OPPONENT_2) {
                gameState.moveType = MoveType.REMOVE_OPPONENT;
                this.drawBoard(gameState);
            } else {
                this.changeTurn(gameState);
            }
        }
    }

    performNearbyMove(gameState: IGameState, selectedCircle: ICircle): void {
        const circleForShift = gameState.isShiftAllowed(selectedCircle);

        if (circleForShift) {
            this.chosenForShift = selectedCircle;
            this.highlightedCircles = this.findCirclesForNearbyMove(gameState, selectedCircle);
            this.drawBoard(gameState);
        } else {
            this.performShift(gameState, this.chosenForShift, selectedCircle);
        }
    }

    performShift(gameState: IGameState, chosenForShift: ICircle, destination: ICircle) {
        const foundCircle = this.findHighlightedCircle(destination);
        if (foundCircle) {
            chosenForShift.changeColor(Color.BLACK);
            this.chosenForShift = null;
            this.putPieceOnBoard(gameState, gameState.circles.find(circle => circle.x == foundCircle.x && circle.y == foundCircle.y), true);
        }
    }

    putPieceOnBoard(gameState: IGameState, circle: ICircle, isShifting: boolean) {
        let putPieceResult = gameState.putPieceOnBoard(circle, isShifting);
        this.getDrawerServiceForCurrentPlayer(gameState).numberOfPieces = gameState.getCurrentPlayer().availablePieces;

        switch (putPieceResult) {
            case PutPieceResult.FINISHED_TURN:
                this.changeTurn(gameState);
                break;
            case PutPieceResult.CHANGED_STATE_TO_REMOVE:
            case PutPieceResult.ERROR:
                this.drawBoard(gameState);
                break;
        }

    }


    performAnywhereMove(gameState: IGameState, selectedCircle: ICircle): void {
        const circleForShift = gameState.isShiftAllowed(selectedCircle);

        if (circleForShift) {
            this.chosenForShift = selectedCircle;
            this.highlightedCircles = this.findCirclesOnBoardForAnywhereMove(gameState);
            this.drawBoard(gameState);

        } else {
            this.performShift(gameState, this.chosenForShift, selectedCircle);
        }
    }

    findHighlightedCircle(selectedCircle: ICircle): ICircle {
        return this.findIntersectingPiece(this.highlightedCircles, selectedCircle);
    }

    findCirclesForNearbyMove(gameState: IGameState, chosenCircle: ICircle): ICircle[] {
        const foundCircles: ICircle[] = gameState.circles.filter(circle => circle.color === Color.BLACK);
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

    findCirclesOnBoardForAnywhereMove(gameState): ICircle[] {
        const foundCircles: ICircle[] = gameState.circles.filter(circle => circle.color === Color.BLACK);
        const result = [];
        for (const circle of foundCircles) {
            result.push(new HighlightedCircle(circle));
        }
        return result;
    }

    drawBoard(gameState: IGameState): void {
        this.canvasService.clearCanvas();
        this.canvasService.drawSquare(2, 2, 2);
        this.canvasService.drawSquare(1, 1, 4);
        this.canvasService.drawSquare(0, 0, 6);
        this.canvasService.drawLine(0, 3, 2, 3);
        this.canvasService.drawLine(4, 3, 6, 3);
        this.canvasService.drawLine(3, 0, 3, 2);
        this.canvasService.drawLine(3, 4, 3, 6);

        gameState.circles.forEach(circle => this.canvasService.drawCircle(circle));
        this.highlightedCircles.forEach(circle => this.canvasService.drawCircle(circle));

        this.calculateStats(gameState);

        this.redDrawerService.drawDrawer();
        this.greenDrawerService.drawDrawer();
    }

    calculateStats(gameState: IGameState) {
        gameState.redPlayerState.usedPieces = gameState.circles.filter(piece => piece.color === Color.RED).length;
        gameState.greenPlayerState.usedPieces = gameState.circles.filter(piece => piece.color === Color.GREEN).length;
    }


    getDrawerServiceForCurrentPlayer(gameState: IGameState): DrawerService {
        switch (gameState.turn) {
            case Color.RED:
                return this.redDrawerService;
            case Color.GREEN:
                return this.greenDrawerService;
        }
    }

    changeTurn(gameState: IGameState) {
        gameState.turn = getOpponentColor(gameState.turn);
        this.setMoveType(gameState);
        this.drawBoard(gameState);
    }

    setMoveType(gameState: IGameState) {
        this.calculateStats(gameState);
        let availablePieces = 0;
        let usedPieces = 0;
        if (gameState.turn === Color.RED) {
            usedPieces = gameState.redPlayerState.usedPieces;
            availablePieces = gameState.redPlayerState.availablePieces;
        } else {
            usedPieces = gameState.greenPlayerState.usedPieces;
            availablePieces = gameState.greenPlayerState.availablePieces;
        }

        const allPieces = usedPieces + availablePieces;

        if (allPieces < 3) {
            gameState.moveType = MoveType.END_GAME;
            alert("Player " + gameState.turn + " has lost");
        } else if (availablePieces > 0) {
            gameState.moveType = MoveType.NORMAL;
        } else if (usedPieces === 3) {
            if (this.checkIfAnyCanMoveNearby(gameState)) {
                gameState.moveType = MoveType.MOVE_ANYWHERE;
            } else {
                gameState.moveType = MoveType.END_GAME;
            }
        } else if (availablePieces === 0) {
            gameState.moveType = MoveType.MOVE_NEARBY;
        }
    }

    checkIfAnyCanMoveNearby(gameState: IGameState): boolean {
        let currentPlayerPieces = gameState.circles.filter(circle => circle.color == gameState.turn);
        for (const piece of currentPlayerPieces) {
            if (this.findCirclesForNearbyMove(gameState, piece).length > 0) {
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

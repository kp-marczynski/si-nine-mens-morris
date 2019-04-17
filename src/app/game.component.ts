import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Circle, HighlightedCircle, ICircle} from './model/circle.model';
import {MoveType} from './model/move-type.enum';
import {CanvasService} from './service/canvas.service';
import {IPosition} from './model/position.model';
import {Color, getOpponentColor} from "./model/color.enum";
import {DrawerService} from "./service/drawer.service";
import {getWinSize, isBigScreen} from "./service/window-size.service";
import {GameState, IGameState} from "./model/game-state.model";
import {MoveResult} from "./model/move-result.enum";

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
                    this.processMoveResult(this.gameState, this.gameState.performNormalMove(selectedCircle));
                    break;
                case MoveType.REMOVE_OPPONENT:
                case MoveType.REMOVE_OPPONENT_2:
                    this.processMoveResult(this.gameState, this.gameState.performRemoveMove(selectedCircle));
                    break;
                case MoveType.MOVE_NEARBY:
                case MoveType.MOVE_ANYWHERE:
                    this.processMoveResult(this.gameState, this.gameState.performShift(selectedCircle));
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
                        circleFound = this.gameState.isShiftFromAllowed(hoveredCircle) != null;
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


    processMoveResult(gameState: IGameState, moveResult: MoveResult): void {
        this.getDrawerServiceForCurrentPlayer(gameState).numberOfPieces = gameState.getCurrentPlayer().availablePieces;
        switch (moveResult) {
            case MoveResult.FINISHED_TURN:
                this.changeTurn(gameState);
                break;
            case MoveResult.CHANGED_STATE_TO_REMOVE:
            case MoveResult.MOVE_NOT_ALLOWED:
            case MoveResult.SELECTED_TO_SHIFT:
                this.drawBoard(gameState);
                break;
        }
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
        gameState.highlightedCircles.forEach(circle => this.canvasService.drawCircle(circle));

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
            if (gameState.findDestinationsForNearbyMove(piece).length > 0) {
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

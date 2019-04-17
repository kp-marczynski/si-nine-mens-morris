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


    baseSize: number;
    offset: number;

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
        const baseRadiusSize = this.baseSize / 6;
        this.gameState.setBaseRadiusSize(baseRadiusSize);

        this.canvasService = new CanvasService(this.canvas, this.baseSize, this.offset);

        this.redDrawerService = new DrawerService(document.getElementById('red-drawer') as HTMLCanvasElement,
            this.baseSize,
            this.offset,
            this.gameState.redPlayerState.availablePieces,
            Color.RED,
            2 * baseRadiusSize);
        this.greenDrawerService = new DrawerService(document.getElementById('green-drawer') as HTMLCanvasElement,
            this.baseSize,
            this.offset,
            this.gameState.greenPlayerState.availablePieces,
            Color.GREEN,
            2 * baseRadiusSize);

        this.drawBoard(this.gameState);
        this.addCanvasOnClickListener();
        this.addCanvasOnMouseMoveListener();
        this.addCanvasOnTouchListener();
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
            this.processMoveResult(this.gameState, this.gameState.performMove(selectedCircle));
        }
    }

    addCanvasOnMouseMoveListener(): void {
        this.canvas.addEventListener('mousemove', (mouseEvent) => {
            const relativePosition = this.canvasService.getMousePositionInCanvas(mouseEvent);
            const hoveredCircle: ICircle = this.findIntersectingPiece(this.gameState.circles, relativePosition);
            let isMoveAllowed = false;

            if (hoveredCircle) {
                switch (this.gameState.moveType) {
                    case MoveType.NORMAL:
                        isMoveAllowed = this.gameState.isNormalMoveAllowed(hoveredCircle) != null;
                        break;
                    case MoveType.REMOVE_OPPONENT:
                    case MoveType.REMOVE_OPPONENT_2:
                        isMoveAllowed = this.gameState.isOpponentRemoveAllowed(hoveredCircle) != null;
                        break;
                    case MoveType.MOVE_NEARBY:
                    case MoveType.MOVE_ANYWHERE:
                        isMoveAllowed = this.gameState.isShiftFromAllowed(hoveredCircle) != null;
                        break;
                }
            }
            if (isMoveAllowed) {
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
        gameState.shiftDestinations.forEach(circle => this.canvasService.drawCircle(new HighlightedCircle(circle)));

        this.redDrawerService.drawDrawer();
        this.greenDrawerService.drawDrawer();
    }


    getDrawerServiceForCurrentPlayer(gameState: IGameState): DrawerService {
        switch (gameState.turn) {
            case Color.RED:
                return this.redDrawerService;
            case Color.GREEN:
                return this.greenDrawerService;
        }
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

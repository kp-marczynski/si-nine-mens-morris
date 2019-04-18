import {AfterViewInit, Component, OnInit} from '@angular/core';
import {HighlightedCircle, ICircle} from './model/circle.model';
import {MoveType} from './model/enum/move-type.enum';
import {CanvasService} from './service/canvas.service';
import {IPosition} from './model/position.model';
import {Color} from "./model/enum/color.enum";
import {DrawerService} from "./service/drawer.service";
import {getWinSize, isBigScreen} from "./service/window-size.service";
import {GameState, IGameState} from "./model/game-state.model";
import {MoveResult} from "./model/enum/move-result.enum";
import {PlayerType} from "./model/enum/player-type.enum";
import {GameService} from "./service/game.service";
import {AiPlayerService} from "./service/ai-player.service";
import {changePlayerType, IPlayerState} from "./model/player-state.model";

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

    constructor(private gameService: GameService, private aiPlayerService: AiPlayerService) {
    }

    ngOnInit(): void {
        this.gameState = new GameState(PlayerType.HUMAN, PlayerType.HUMAN);
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.afterViewInitCallback());
    }

    afterViewInitCallback(): void {
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

        this.canvasService = new CanvasService(this.canvas, this.baseSize, this.offset, baseRadiusSize);

        this.redDrawerService = new DrawerService(document.getElementById('red-drawer') as HTMLCanvasElement,
            this.baseSize,
            this.offset,
            this.gameState.redPlayerState.piecesInDrawer,
            Color.RED,
            2, baseRadiusSize);
        this.greenDrawerService = new DrawerService(document.getElementById('green-drawer') as HTMLCanvasElement,
            this.baseSize,
            this.offset,
            this.gameState.greenPlayerState.piecesInDrawer,
            Color.GREEN,
            2, baseRadiusSize);

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
        if (this.gameService.getCurrentPlayer(this.gameState).playerType == PlayerType.HUMAN) {
            const relativePosition = this.canvasService.getPositionInCanvas(event);
            const selectedCircle: ICircle = this.findIntersectingPiece(this.gameState.circles, relativePosition);
            if (selectedCircle) {
                this.processMoveResult(this.gameState, this.gameService.performMove(this.gameState, selectedCircle));
            }
        }
    }

    addCanvasOnMouseMoveListener(): void {
        this.canvas.addEventListener('mousemove', (mouseEvent) => {
            if (this.gameService.getCurrentPlayer(this.gameState).playerType == PlayerType.HUMAN) {
                const relativePosition = this.canvasService.getMousePositionInCanvas(mouseEvent);
                const hoveredCircle: ICircle = this.findIntersectingPiece(this.gameState.circles, relativePosition);
                let isMoveAllowed = false;

                if (hoveredCircle) {
                    switch (this.gameState.moveType) {
                        case MoveType.NORMAL:
                        case MoveType.REMOVE_OPPONENT:
                        case MoveType.REMOVE_OPPONENT_2:
                            isMoveAllowed = this.gameService.isMoveAllowed(this.gameState, hoveredCircle);
                            break;
                        case MoveType.MOVE_NEARBY:
                        case MoveType.MOVE_ANYWHERE:
                            isMoveAllowed = this.gameService.isMoveAllowed(this.gameState, hoveredCircle);
                            if (!isMoveAllowed && this.gameState.chosenForShift != null) {
                                isMoveAllowed = this.gameService.isShiftToAllowed(this.gameState, this.gameState.chosenForShift, hoveredCircle);
                            }
                            break;
                    }
                }
                if (isMoveAllowed) {
                    this.canvas.style.cursor = 'pointer';
                } else {
                    this.canvas.style.cursor = 'default';
                }
            }
        });
    }


    processMoveResult(gameState: IGameState, moveResult: MoveResult): void {
        this.drawBoard(gameState);
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

        this.redDrawerService.numberOfPieces = gameState.redPlayerState.piecesInDrawer;
        this.greenDrawerService.numberOfPieces = gameState.greenPlayerState.piecesInDrawer;

        gameState.circles.forEach(circle => this.canvasService.drawCircle(circle));
        gameState.shiftDestinations.forEach(circle => this.canvasService.drawCircle(new HighlightedCircle(circle)));

        this.redDrawerService.drawDrawer();
        this.greenDrawerService.drawDrawer();

        if (this.gameService.getCurrentPlayer(gameState).playerType == PlayerType.COMPUTER) {
            setTimeout(() => this.processComputerMove(gameState));
        }
    }

    processComputerMove(gameState: IGameState) {
        this.gameState = this.aiPlayerService.minimax(gameState);
        this.drawBoard(this.gameState);
    }

    findIntersectingPiece(pieces: ICircle[], relativePosition: IPosition): ICircle {
        for (const piece of pieces) {
            if (this.canvasService.isIntersect(relativePosition, piece)) {
                return piece;
            }
        }
        return null;
    }

    changePlayerType(playerState: IPlayerState) {
        changePlayerType(playerState);
        if (this.gameService.getCurrentPlayer(this.gameState).playerType == PlayerType.COMPUTER) {
            setTimeout(() => this.processComputerMove(this.gameState));
        }
    }
}

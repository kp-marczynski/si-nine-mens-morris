import {AfterViewInit, Component, OnInit} from '@angular/core';
import {HighlightedCircle, ICircle} from './model/circle.model';
import {MoveType} from './model/enum/move-type.enum';
import {CanvasService} from './service/canvas.service';
import {IPosition} from './model/position.model';
import {Color} from "./model/enum/color.enum";
import {DrawerService} from "./service/drawer.service";
import {getWinSize, isBigScreen} from "./service/window-size.service";
import {GameState, IGameState} from "./model/game-state.model";
import {PlayerType} from "./model/enum/player-type.enum";
import {GameService} from "./service/game.service";
import {AiPlayerService} from "./service/ai-player.service";
import {MatDialog, MatSnackBar} from "@angular/material";
import {InfoComponent} from "./info/info.component";
import {EndgameComponent} from "./endgame/endgame.component";
import {SwUpdate} from "@angular/service-worker";
import {AlgorithmType} from "./model/enum/algorithm-type.enum";
import {HeuristicsType} from "./model/enum/heuristics-type.enum";
import {EndgameData} from "./model/endgame-data.model";

@Component({
    selector: 'app-root',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
})
export class GameComponent implements AfterViewInit, OnInit {

    boardSize: number = 7;
    baseSize: number;
    offset: number;

    canvas: HTMLCanvasElement;
    canvasService: CanvasService;

    redDrawerService: DrawerService;
    greenDrawerService: DrawerService;

    gameStates: IGameState[] = [];
    currentIndex = 0;

    redPlayerType: PlayerType;
    greenPlayerType: PlayerType;

    // algorithmType: AlgorithmType = AlgorithmType.MINI_MAX;
    greenAiAlgorithm: AlgorithmType = AlgorithmType.MINI_MAX;
    redAiAlgorithm: AlgorithmType = AlgorithmType.MINI_MAX;

    greenHeuristics: HeuristicsType = HeuristicsType.NAIVE;
    redHeuristics: HeuristicsType = HeuristicsType.NAIVE;

    defaultCanvasSize = 400;

    gameStartTime = Date.now();

    constructor(private gameService: GameService, private aiPlayerService: AiPlayerService, private snackBar: MatSnackBar, private dialog: MatDialog, private swUpdate: SwUpdate) {
        this.redPlayerType = PlayerType.HUMAN;
        this.greenPlayerType = PlayerType.HUMAN;
    }

    ngOnInit(): void {
        this.initNewGame();
        // if (this.swUpdate.isEnabled) {
        //     this.swUpdate.available.subscribe(() => {
        //         if (confirm("New version available. Load New Version?")) {
        //             window.location.reload();
        //         }
        //     });
        // }
    }

    initNewGame(): void {
        this.gameStates = [];
        this.currentIndex = 0;
        this.redPlayerType = PlayerType.HUMAN;
        this.greenPlayerType = PlayerType.HUMAN;
        this.gameStates.push(new GameState(PlayerType.HUMAN, PlayerType.HUMAN));
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
            this.canvas.width = this.defaultCanvasSize;
            this.canvas.height = this.defaultCanvasSize;
        }

        this.baseSize = this.canvas.width / 8;
        this.offset = this.baseSize * 1.25;
        const baseRadiusSize = this.baseSize / 6;

        this.canvasService = new CanvasService(this.canvas, this.baseSize, this.offset, baseRadiusSize);

        this.redDrawerService = new DrawerService(document.getElementById('red-drawer') as HTMLCanvasElement,
            this.baseSize,
            this.offset * 0.5,
            this.gameStates[this.currentIndex].redPlayerState.piecesInDrawer,
            Color.RED,
            2, baseRadiusSize);
        this.greenDrawerService = new DrawerService(document.getElementById('green-drawer') as HTMLCanvasElement,
            this.baseSize,
            this.offset * 0.5,
            this.gameStates[this.currentIndex].greenPlayerState.piecesInDrawer,
            Color.GREEN,
            2, baseRadiusSize);

        this.drawBoard(this.gameStates[this.currentIndex]);
        this.addCanvasOnClickListener();
        this.addCanvasOnMouseMoveListener();
    }

    addCanvasOnClickListener(): void {
        this.canvas.addEventListener('click', (mouseEvent) => this.onClickOrTouchListener(mouseEvent));
    }

    onClickOrTouchListener(event: UIEvent) {
        if (this.getCurrentPlayerType(this.gameStates[this.gameStates.length - 1]) == PlayerType.HUMAN) {
            const relativePosition = this.canvasService.getPositionInCanvas(event);
            const selectedCircle: ICircle = this.findIntersectingPiece(this.gameStates[this.gameStates.length - 1].circles, relativePosition);
            if (selectedCircle) {
                let newGameState = this.gameService.clone(this.gameStates[this.currentIndex]);
                let circle = newGameState.circles.find(circle => circle.x == selectedCircle.x && circle.y == selectedCircle.y);
                this.gameService.performMove(newGameState, circle);
                this.processMoveResult(newGameState);
            }
        }
    }

    getCurrentPlayerType(gameState: IGameState): PlayerType {
        switch (gameState.turn) {
            case Color.RED:
                return this.redPlayerType;
            case Color.GREEN:
                return this.greenPlayerType;
        }
    }

    addCanvasOnMouseMoveListener(): void {
        this.canvas.addEventListener('mousemove', (mouseEvent) => {
            if (this.getCurrentPlayerType(this.gameStates[this.currentIndex]) == PlayerType.HUMAN) {
                const relativePosition = this.canvasService.getMousePositionInCanvas(mouseEvent);
                const hoveredCircle: ICircle = this.findIntersectingPiece(this.gameStates[this.currentIndex].circles, relativePosition);
                let isMoveAllowed = false;

                if (hoveredCircle) {
                    switch (this.gameStates[this.currentIndex].moveType) {
                        case MoveType.NORMAL:
                        case MoveType.REMOVE_OPPONENT:
                        case MoveType.REMOVE_OPPONENT_2:
                            isMoveAllowed = this.gameService.isMoveAllowed(this.gameStates[this.currentIndex], hoveredCircle);
                            break;
                        case MoveType.MOVE_NEARBY:
                        case MoveType.MOVE_ANYWHERE:
                            isMoveAllowed = this.gameService.isMoveAllowed(this.gameStates[this.currentIndex], hoveredCircle);
                            if (!isMoveAllowed && this.gameStates[this.currentIndex].chosenForShift != null) {
                                isMoveAllowed = this.gameService.isShiftToAllowed(this.gameStates[this.currentIndex], this.gameStates[this.currentIndex].chosenForShift, hoveredCircle);
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
        }, {passive: true});
    }

    processMoveResult(gameState: IGameState): void {
        if (this.currentIndex == 0) {
            this.gameStartTime = Date.now();
        }
        if (gameState != null) {

            this.gameStates = this.gameStates.slice(0, this.currentIndex + 1);
            this.gameStates.push(gameState);
            this.currentIndex++;
            this.drawBoard(this.gameStates[this.currentIndex]);
            if (gameState.moveType == MoveType.END_GAME || gameState.moveType == MoveType.DRAW) {
                console.log(gameState);
                this.openEndgameDialog();
                // alert("Player " + gameState.turn + " has lost");
            } else if (this.getCurrentPlayerType(gameState) == PlayerType.COMPUTER) {
                this.performComputerMove();
            }
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
        const legendOffset = 0.15;
        for (let i = 0; i < this.boardSize; ++i) {
            this.canvasService.writeOnCanvas(this.offset / 4, this.offset * (1 + legendOffset) + i * this.baseSize, i.toString());
            this.canvasService.writeOnCanvas(this.offset * (1 - legendOffset) + i * this.baseSize, this.offset / 2, String.fromCharCode('A'.charCodeAt(0) + i));
        }

        this.redDrawerService.numberOfPieces = gameState.redPlayerState.piecesInDrawer;
        this.greenDrawerService.numberOfPieces = gameState.greenPlayerState.piecesInDrawer;

        gameState.circles.forEach(circle => this.canvasService.drawCircle(circle));
        gameState.shiftDestinations.forEach(circle => this.canvasService.drawCircle(new HighlightedCircle(circle)));

        this.redDrawerService.drawDrawer();
        this.greenDrawerService.drawDrawer();
    }

    performComputerMove() {
        let state: IGameState = null;
        new Promise((resolve, reject) => setTimeout(() => {
            state = this.aiPlayerService.performComputerMove(this.gameStates[this.currentIndex], this.getAlgorithmForCurrentAI(), this.getHeuristicsForCurrentAI());
            if (state) {
                // this.gameState = state;
                this.showSnackBarWithMoveResult(state);
            } else {
                console.log("no moves");
                // console.log(this.gameState);
            }
            resolve();
        }, 100)).then(() => this.processMoveResult(state));

    }

    getAlgorithmForCurrentAI() {
        switch (this.gameStates[this.currentIndex].turn) {
            case Color.GREEN:
                return this.greenAiAlgorithm;
            case Color.RED:
                return this.redAiAlgorithm;
        }
    }

    getHeuristicsForCurrentAI() {
        switch (this.gameStates[this.currentIndex].turn) {
            case Color.GREEN:
                return this.greenHeuristics;
            case Color.RED:
                return this.redHeuristics;
        }
    }

    showSnackBarWithMoveResult(gameState: IGameState) {
        const moves = gameState.moves.filter(move => move.count === gameState.moveCount);
        let message: string = '';
        message += '=== ' + moves[0].color + ' === ';
        for (let i = 0; i < moves.length; ++i) {
            message += moves[i].moveType + ': ' + moves[i].moveDescription;
            if (i != moves.length - 1) {
                message += '; ';
            }
        }
        this.snackBar.open(message, 'OK', {duration: 3000});
    }

    findIntersectingPiece(pieces: ICircle[], relativePosition: IPosition): ICircle {
        for (const piece of pieces) {
            if (this.canvasService.isIntersect(relativePosition, piece)) {
                return piece;
            }
        }
        return null;
    }

    getPlayerTypeByColor(color: Color): PlayerType {
        switch (color) {
            case Color.RED:
                return this.redPlayerType;
            case Color.GREEN:
                return this.greenPlayerType;
        }
    }

    changePlayerType(colorString: string) {
        const color: Color = Color[colorString];
        let playerType = this.getPlayerTypeByColor(color);
        let result: PlayerType;
        switch (playerType) {
            case PlayerType.HUMAN:
                result = PlayerType.COMPUTER;
                break;
            case  PlayerType.COMPUTER:
                result = PlayerType.HUMAN;
                break;
        }
        switch (color) {
            case Color.RED:
                this.redPlayerType = result;
                break;
            case Color.GREEN:
                this.greenPlayerType = result;
                break;
        }
        if (this.getCurrentPlayerType(this.gameStates[this.currentIndex]) == PlayerType.COMPUTER) {
            this.performComputerMove();
        }
    }

    undo() {
        this.currentIndex--;
        this.updateState();
    }

    redo() {
        this.currentIndex++;
        this.updateState();
    }

    updateState() {
        this.drawBoard(this.gameStates[this.currentIndex]);
        if (this.getCurrentPlayerType(this.gameStates[this.currentIndex]) == PlayerType.COMPUTER) {
            this.performComputerMove();
        }
    }

    openInfoDialog(): void {
        this.dialog.open(InfoComponent);
    }

    reset() {
        this.initNewGame();
        this.drawBoard(this.gameStates[this.currentIndex]);
    }

    openEndgameDialog(): void {
        const endgameDate = new EndgameData(this.gameStates[this.currentIndex].moveType == MoveType.DRAW ? null : this.gameStates[this.currentIndex].turn, this.gameStates[this.currentIndex].moveCount, this.gameStartTime);
        const dialogRef = this.dialog.open(EndgameComponent, {
            width: '250px',
            data: endgameDate
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            this.reset();
        });
    }
}

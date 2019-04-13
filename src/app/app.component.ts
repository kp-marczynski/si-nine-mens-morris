import {AfterViewInit, Component} from '@angular/core';
import {Circle, ICircle} from './circle.model';
import {MoveType} from './move-type.enum';
import {CanvasService} from './canvas.service';
import {IPosition} from './position.model';

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
  isRedPlayerTurn = true;
  moveType: MoveType = MoveType.NORMAL;
  redPieces: ICircle[] = [];
  greenPieces: ICircle[] = [];

  circles: ICircle[] = [];

  piecesPerPlayer = 15;

  canvasService: CanvasService;

  initCircles() {
    this.circles = [
      new Circle(0, 0, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(3, 0, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(6, 0, this.baseRadiusSize, 'rgba(0,0,0,255)'),

      new Circle(1, 1, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(3, 1, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(5, 1, this.baseRadiusSize, 'rgba(0,0,0,255)'),

      new Circle(2, 2, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(3, 2, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(4, 2, this.baseRadiusSize, 'rgba(0,0,0,255)'),

      new Circle(0, 3, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(1, 3, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(2, 3, this.baseRadiusSize, 'rgba(0,0,0,255)'),

      new Circle(4, 3, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(5, 3, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(6, 3, this.baseRadiusSize, 'rgba(0,0,0,255)'),

      new Circle(2, 4, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(3, 4, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(4, 4, this.baseRadiusSize, 'rgba(0,0,0,255)'),

      new Circle(1, 5, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(3, 5, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(5, 5, this.baseRadiusSize, 'rgba(0,0,0,255)'),

      new Circle(0, 6, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(3, 6, this.baseRadiusSize, 'rgba(0,0,0,255)'),
      new Circle(6, 6, this.baseRadiusSize, 'rgba(0,0,0,255)'),
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
  }

  initializePlayersPieces(): void {
    for (let i = 0; i < this.piecesPerPlayer; ++i) {
      this.redPieces.push(new Circle(null, null, this.baseRadiusSize * 2, 'rgba(180,0,0,255)'));
      this.greenPieces.push(new Circle(null, null, this.baseRadiusSize * 2, 'rgba(0,100,0,255)'));
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

  performNormalMove(relativePosition: IPosition, pixel: string): void {
    this.circles.forEach(circle => {
      if (this.canvasService.isIntersect(relativePosition, circle)) {
        if (circle.color === 'rgba(' + pixel + ')') {
          if (this.isRedPlayerTurn) {
            this.setAvailablePiece(this.redPieces, circle);
          } else {
            this.setAvailablePiece(this.greenPieces, circle);
          }
          this.isRedPlayerTurn = !this.isRedPlayerTurn;
        }
      }
    });
  }

  performRemoveMove(relativePosition: IPosition): void {
    if (this.isRedPlayerTurn) {
      const foundPiece = this.findIntersectingPiece(this.redPieces, relativePosition);
      if (foundPiece) {
        this.redPieces = this.redPieces.filter(piece => piece.x !== foundPiece.x || piece.y !== foundPiece.y);
        this.moveType = MoveType.NORMAL;
        this.drawBoard();
      }
    } else {
      const foundPiece = this.findIntersectingPiece(this.greenPieces, relativePosition);
      if (foundPiece) {
        this.greenPieces = this.greenPieces.filter(piece => piece.x !== foundPiece.x || piece.y !== foundPiece.y);
        this.moveType = MoveType.NORMAL;
        this.drawBoard();
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
  }


  setAvailablePiece(pieces: ICircle[], circle: ICircle): void {
    const foundPiece = pieces.find(piece => piece.x == null && piece.y == null);
    if (foundPiece) {
      foundPiece.x = circle.x;
      foundPiece.y = circle.y;
      if (this.checkForMill(pieces, foundPiece)) {
        this.moveType = MoveType.REMOVE;
      }
      this.drawBoard();
    }
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

export interface ICircle {
  x: number;
  y: number;
  radius: number;
  color: string;
}

export class BoardCircle implements ICircle {
  color = 'rgba(0,0,0,255)';
  constructor(
    public x: number,
    public y: number,
    public radius: number
  ) {
  }
}

export class RedPiece implements ICircle {
  color = 'rgba(180,0,0,255)';
  constructor(
      public x: number,
      public y: number,
      public radius: number
  ) {
  }
}

export class GreenPiece implements ICircle {
  color = 'rgba(0,100,0,255)';
  constructor(
      public x: number,
      public y: number,
      public radius: number
  ) {
  }
}

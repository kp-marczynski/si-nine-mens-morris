export interface ICircle {
  x: number;
  y: number;
  radius: number;
  color: string;
}

export class Circle implements ICircle {
  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public color: string
  ) {
  }
}

export interface IPosition {
    x: number;
    y: number;
}

export class Position implements IPosition {
    constructor(
        public x: number,
        public y: number
    ) {
    }
}

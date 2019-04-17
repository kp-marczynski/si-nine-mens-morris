import {ICircle} from "./circle.model";

export interface IPlayerState {
    availablePieces: number;
    usedPieces: number;

    lastPosition: ICircle;

    decreaseNumberOfAvailablePieces(): void;
}

export class PlayerState implements IPlayerState {
    availablePieces: number;
    usedPieces: number;

    lastPosition: ICircle;

    constructor() {
        this.availablePieces = 4;
    }

    decreaseNumberOfAvailablePieces(): void {
        this.availablePieces--;
    }

}


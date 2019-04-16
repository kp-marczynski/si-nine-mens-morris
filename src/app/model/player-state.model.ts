import {ICircle} from "./circle.model";

export interface IPlayerState {
    availablePieces: number;
    usedPieces: number;

    lastPosition: ICircle;
}

export class PlayerState implements IPlayerState {
    availablePieces: number;
    usedPieces: number;

    lastPosition: ICircle;

    constructor() {
    }

}


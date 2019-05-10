import {Color} from "./enum/color.enum";


export class EndgameData {
    public timeInMinutes: number;

    constructor(public losingPlayer: Color, public moveCount: number, timeStart: number) {
        this.timeInMinutes = (Date.now() - timeStart) / 60000;
    }

}

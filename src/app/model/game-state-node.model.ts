import {IGameState} from "./game-state.model";

export interface IGameStateNode {
    root: IGameState;
    children: IGameStateNode[];
    value: number;
    imminentValue: number;

    isMaximizing: boolean;

    calcValue(): number;

    getBestChild(): IGameStateNode;
}

export class GameStateNode implements IGameStateNode {
    children: IGameStateNode[];
    imminentValue: number;

    constructor(public root: IGameState, public isMaximizing: boolean, public value: number) {
        this.imminentValue = value;
    }

    calcValue(): number {
        if (!this.children || this.children.length == 0) {
            return this.value;
        } else {
            const childrenValues: number[] = this.children.map(child => child.calcValue());
            this.value = this.isMaximizing ? Math.max(...childrenValues) : Math.min(...childrenValues);
            return this.value;
        }
    }

    getBestChild(): IGameStateNode {
        let result: IGameStateNode = null;
        for (let i = 0; i < this.children.length; ++i) {
            if (this.children[i].value == this.value && (result == null
                || (this.isMaximizing ? this.children[i].imminentValue > result.imminentValue : this.children[i].imminentValue < result.imminentValue)
                || (result.imminentValue == this.children[i].imminentValue && Math.random() > 0.7))) {
                result = this.children[i];
            }
        }
        console.log(this.children.map(child => child.value));
        console.log('chosen val: ' + result.value);
        console.log('is maximizing' + this.isMaximizing);
        return result;
    }
}

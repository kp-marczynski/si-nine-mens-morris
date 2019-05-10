import {IGameState} from "./game-state.model";

export interface IGameStateNode {
    root: IGameState;
    children: IGameStateNode[];
    value: number;
    imminentValue: number;

    isMaximizing: boolean;

    isAlphaBeta: boolean;
    alpha: number;
    beta: number;

    calcValue(): number;

    getBestChild(): IGameStateNode;
}

export class GameStateNode implements IGameStateNode {
    children: IGameStateNode[];
    imminentValue: number;
    alpha: number = null;
    beta: number = null;
    isAlphaBeta: boolean = false;

    constructor(public root: IGameState, public isMaximizing: boolean, public value: number) {
        this.imminentValue = value;
    }

    calcValue(): number {
        if (!this.children || this.children.length == 0) {
            return this.value;
        } else {
            if (!this.isAlphaBeta) {
                const childrenValues: number[] = this.children.map(child => child.calcValue());
                this.value = this.isMaximizing ? Math.max(...childrenValues) : Math.min(...childrenValues);
                return this.value;
            } else {
                let alphabetaCut = false;
                for (let i = 0; i < this.children.length && !alphabetaCut; ++i) {
                    let currentChild = this.children[i];
                    currentChild.alpha = this.alpha;
                    currentChild.beta = this.beta;

                    let childValue = currentChild.calcValue();
                    if (childValue != null) {
                        if (this.isMaximizing && (this.alpha == null || this.alpha < childValue)) {
                            this.alpha = childValue;
                        } else if (!this.isMaximizing && (this.beta == null || this.beta > childValue)) {
                            this.beta = childValue;
                        }
                    }

                    if (this.alpha != null && this.beta != null) {
                        if (this.isMaximizing && this.alpha > this.beta) {
                            alphabetaCut = true;
                        } else if (!this.isMaximizing && this.alpha < this.beta) {
                            alphabetaCut = true;
                        }
                    }
                }
                if (alphabetaCut) {
                    this.value = null;
                } else {
                    if (this.isMaximizing) {
                        this.value = this.alpha;
                    } else {
                        this.value = this.beta;
                    }
                }
                return this.value;
            }
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

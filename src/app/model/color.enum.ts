export enum Color {
    RED = 'RED', GREEN = 'GREEN', BLACK = 'BLACK', NONE = 'NONE'
}

export function getColorRgbaString(color: Color): string {
    switch (color) {
        case Color.RED:
            return 'rgba(180,0,0,255)';
        case Color.GREEN:
            return 'rgba(0,100,0,255)';
        case Color.BLACK:
            return 'rgba(0,0,0,255)';
        case Color.NONE:
            return '';
    }
}

export function getOpponentColor(turn: Color): Color {
    switch (turn) {
        case Color.RED:
            return Color.GREEN;
        case Color.GREEN:
            return Color.RED;
    }
}

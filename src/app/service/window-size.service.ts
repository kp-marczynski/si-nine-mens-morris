export function getWinSize(): number {
    const measures = [];
    measures.push(window.innerWidth);
    measures.push(window.innerHeight);
    measures.push(screen.availWidth);
    measures.push(screen.availHeight);
    measures.sort((a, b) => a - b);
    return measures[0];
}

export function isBigScreen(): boolean {
    return getWinSize() > 600;
}
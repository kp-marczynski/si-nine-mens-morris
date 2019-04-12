const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const baseSize = canvas.width / 8;
const offset = baseSize;
const baseRadiusSize = baseSize / 6;
let isRedPlayerTurn = true;
const moveTypes = {
    NORMAL: 'normal',
    REMOVE: 'remove'
};
let moveType = 'normal';
const redPieces = [];
const greenPieces = [];

const circles = [
    {x: 0, y: 0, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 3, y: 0, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 6, y: 0, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},

    {x: 1, y: 1, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 3, y: 1, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 5, y: 1, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},

    {x: 2, y: 2, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 3, y: 2, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 4, y: 2, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},

    {x: 0, y: 3, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 1, y: 3, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 2, y: 3, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},

    {x: 4, y: 3, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 5, y: 3, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 6, y: 3, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},

    {x: 2, y: 4, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 3, y: 4, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 4, y: 4, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},

    {x: 1, y: 5, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 3, y: 5, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 5, y: 5, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},

    {x: 0, y: 6, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 3, y: 6, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
    {x: 6, y: 6, radius: baseRadiusSize, color: 'rgba(0,0,0,255)'},
];

function isIntersect(point, circle) {
    return Math.sqrt((point.x - getRealCoordinate(circle.x)) ** 2 + (point.y - getRealCoordinate(circle.y)) ** 2) < circle.radius;
}

function drawSquare(x, y, size) {
    const finalSize = size * baseSize;
    const finalX = getRealCoordinate(x);
    const finalY = getRealCoordinate(y);
    ctx.beginPath();
    ctx.rect(finalX, finalY, finalSize, finalSize);
    ctx.stroke();
}

function drawLine(xStart, yStart, xEnd, yEnd) {
    ctx.beginPath();
    ctx.moveTo(getRealCoordinate(xStart), getRealCoordinate(yStart));
    ctx.lineTo(getRealCoordinate(xEnd), getRealCoordinate(yEnd));
    ctx.stroke();
}

function getRealCoordinate(val) {
    return val * baseSize + offset;
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSquare(2, 2, 2);
    drawSquare(1, 1, 4);
    drawSquare(0, 0, 6);
    drawLine(0, 3, 2, 3);
    drawLine(4, 3, 6, 3);
    drawLine(3, 0, 3, 2);
    drawLine(3, 4, 3, 6);

    circles.forEach(circle => {
        drawCircle(circle);
    });

    redPieces.filter(piece => piece.x != null && piece.y != null).forEach(filteredPiece => drawCircle(filteredPiece));
    greenPieces.filter(piece => piece.x != null && piece.y != null).forEach(filteredPiece => drawCircle(filteredPiece));

    if (redPieces.filter(piece => piece.x != null && piece.y != null).length >= 3) {
        moveType = moveTypes.REMOVE;
    }
}

function getMousePos(evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function drawCircle(circle) {
    ctx.beginPath();
    const finalX = getRealCoordinate(circle.x);
    const finalY = getRealCoordinate(circle.y);
    ctx.arc(finalX, finalY, circle.radius, 0, 2 * Math.PI);
    ctx.fillStyle = circle.color;
    ctx.fill();
}

function setAvailablePiece(pieces, circle) {
    const filteredResult = pieces.filter(piece => piece.x == null && piece.y == null);
    if (filteredResult) {
        filteredResult[0].x = circle.x;
        filteredResult[0].y = circle.y;
        drawBoard();
    }
}

(function main() {
    drawBoard();
    for (let i = 0; i < 15; ++i) {
        redPieces.push({x: null, y: null, radius: baseRadiusSize * 2, color: 'rgba(180,0,0,255)'});
        greenPieces.push({x: null, y: null, radius: baseRadiusSize * 2, color: 'rgba(0,100,0,255)'});
    }

    canvas.addEventListener('click', (e) => {
        const relativePosition = getMousePos(e);
        const pixel = ctx.getImageData(relativePosition.x, relativePosition.y, 1, 1).data;
        if (moveType === moveTypes.NORMAL) {
            circles.forEach(circle => {
                if (isIntersect(relativePosition, circle)) {
                    if (circle.color === 'rgba(' + pixel + ')') {
                        if (isRedPlayerTurn) {
                            setAvailablePiece(redPieces, circle);
                        } else {
                            setAvailablePiece(greenPieces, circle);
                        }
                        isRedPlayerTurn = !isRedPlayerTurn;
                    }
                }
            });
        } else if (moveType === moveTypes.REMOVE) {
            let pieces = [];
            if (isRedPlayerTurn) {
                pieces = redPieces;
            } else {
                pieces = greenPieces;
            }
            pieces.forEach(piece => {
                if (isIntersect(relativePosition, piece)) {
                    piece.x = null;
                    piece.y = null;
                    moveType = moveTypes.NORMAL;
                    drawBoard();
                }
            })
        }
    });
})();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const baseSize = canvas.width / 8;
const offset = baseSize;
const baseRadiusSize = baseSize / 6;
let firstPlayer = true;

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

function drawSquare(x, y, size, shouldFill) {
    const finalSize = size * baseSize;
    const finalX = getRealCoordinate(x);
    const finalY = getRealCoordinate(y);
    ctx.beginPath();
    if (shouldFill) {
        ctx.fillStyle = 'rgba(255,255,255,255)';
        ctx.border =
            ctx.fillRect(finalX, finalY, finalSize, finalSize);
    } else {
        ctx.rect(finalX, finalY, finalSize, finalSize);
    }
    ctx.stroke();
}

function getRealCoordinate(val) {
    return val * baseSize + offset;
}

function drawBoard() {
    drawSquare(0, 0, 3);
    drawSquare(3, 0, 3);
    drawSquare(0, 3, 3);
    drawSquare(3, 3, 3);
    drawSquare(1, 1, 4);
    drawSquare(2, 2, 2, true);
    drawSquare(2, 2, 2);
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

(function main() {
    drawBoard();

    circles.forEach(circle => {
        drawCircle(circle);
    });


    canvas.addEventListener('click', (e) => {
        // const pos = {
        //     x: e.clientX,
        //     y: e.clientY
        // };
        const relativePosition = getMousePos(e);
        circles.forEach(circle => {
            const pixel = ctx.getImageData(relativePosition.x, relativePosition.y, 1, 1).data;
            if (isIntersect(relativePosition, circle)) {
                if (circle.color === 'rgba(' + pixel + ')') {
                    if (firstPlayer) {
                        drawCircle({x: circle.x, y: circle.y, radius: circle.radius * 2, color: 'rgb(180,0,0)'});
                    } else {
                        drawCircle({x: circle.x, y: circle.y, radius: circle.radius * 2, color: 'rgb(0,107,0)'});
                    }
                    firstPlayer = !firstPlayer;
                }

            }
        });
    });
})();
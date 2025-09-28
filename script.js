const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start');
const restartBtn = document.getElementById('restart');
const resetBtn = document.getElementById('reset');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const messageDisplay = document.getElementById('message');

let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = 2;
let ballDY = -2;
let ballRadius = 5;
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let gameActive = false;
let score = 0;
let startTime = null;

let brickRowCount = 7;
let brickColumnCount = 53;
let brickWidth = 10;
let brickHeight = 10;
let brickPadding = 1;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

let bricks = [];
const colors = ['#d3e0ea', '#9be9a8', '#40c463', '#30a14e', '#216e39']; // Grey and green shades

const activePositions = [
    {c: 10, r: 5, colorIdx: 1},
    {c: 15, r: 6, colorIdx: 2},
    {c: 20, r: 4, colorIdx: 3},
    {c: 25, r: 2, colorIdx: 4},
    {c: 30, r: 5, colorIdx: 1},
    {c: 35, r: 3, colorIdx: 2},
    {c: 40, r: 5, colorIdx: 3},
    {c: 45, r: 3, colorIdx: 4},
    {c: 46, r: 5, colorIdx: 1},
    {c: 49, r: 1, colorIdx: 2},
    {c: 50, r: 3, colorIdx: 3},
    {c: 51, r: 5, colorIdx: 4},
    {c: 51, r: 3, colorIdx: 1},
    {c: 51, r: 1, colorIdx: 2}
];

const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const monthPositions = [0, 4, 9, 13, 18, 22, 26, 31, 35, 39, 44, 48, 52];

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, color: '#d3e0ea' };
        }
    }
    activePositions.forEach(pos => {
        bricks[pos.c][pos.r] = {
            x: (pos.c * (brickWidth + brickPadding)) + brickOffsetLeft,
            y: (pos.r * (brickHeight + brickPadding)) + brickOffsetTop,
            status: 1,
            color: colors[pos.colorIdx]
        };
    });
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                ctx.beginPath();
                ctx.rect(b.x, b.y, brickWidth, brickHeight);
                ctx.fillStyle = b.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawLabels() {
    ctx.font = "10px Arial";
    ctx.fillStyle = "#666";
    ctx.fillText("Mon", 5, brickOffsetTop + 1 * (brickHeight + brickPadding) + brickHeight / 2);
    ctx.fillText("Wed", 5, brickOffsetTop + 3 * (brickHeight + brickPadding) + brickHeight / 2);
    ctx.fillText("Fri", 5, brickOffsetTop + 5 * (brickHeight + brickPadding) + brickHeight / 2);
    for (let i = 0; i < months.length; i++) {
        const x = brickOffsetLeft + monthPositions[i] * (brickWidth + brickPadding);
        ctx.fillText(months[i], x, brickOffsetTop - 10);
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                    ballDY = -ballDY; // Bounce off all blocks
                    score += 10; // Increment score for hitting any block
                    scoreDisplay.textContent = `Score: ${score}`;
                }
            }
        }
    }
}

function updateTime() {
    if (gameActive && startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timeDisplay.textContent = `Time: ${elapsed}s`;
    }
}

function checkWinLose() {
    if (ballY > canvas.height) {
        messageDisplay.textContent = "You Lose!";
        gameActive = false;
    }
    // Win condition: Arbitrary high score for demonstration
    if (score >= 500) {
        messageDisplay.textContent = "You Win!";
        gameActive = false;
    }
}

function draw() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLabels();
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    updateTime();
    checkWinLose();

    ballX += ballDX;
    ballY += ballDY;

    if (ballX + ballDX < ballRadius || ballX + ballDX > canvas.width - ballRadius) ballDX = -ballDX;
    if (ballY + ballDY < ballRadius) ballDY = -ballDY;

    if (ballY + ballDY > canvas.height - ballRadius - paddleHeight &&
        ballX > paddleX && ballX < paddleX + paddleWidth) {
        ballDY = -ballDY;
        const hitPos = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
        ballDX += hitPos * 2;
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 5;
    if (leftPressed && paddleX > 0) paddleX -= 5;

    requestAnimationFrame(draw);
}

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDX = 2;
    ballDY = -2;
}

function startGame() {
    if (!gameActive) {
        gameActive = true;
        startTime = Date.now();
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        timeDisplay.textContent = `Time: 0s`;
        messageDisplay.textContent = "";
        initBricks();
        resetBall();
        draw();
    }
}

initBricks();
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    startGame();
});
resetBtn.addEventListener('click', resetBall);
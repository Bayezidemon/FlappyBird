let board;
let context;

// Detect device
let isMobile = window.innerWidth <= 768;

// Board size
let boardWidth = isMobile ? window.innerWidth : 420;
let boardHeight = isMobile ? window.innerHeight : 640;

// Bird
let birdWidth = 40;
let birdHeight = 30;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };

// Pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Physics
let velocityX = isMobile ? -1.6 : -2;
let velocityY = 0;
let gravity = isMobile ? 0.35 : 0.4;

let gameOver = false;
let score = 0;

// High Score
let highScore = localStorage.getItem("flappyHighScore") || 0;

// 🎵 SOUNDS (new but minimal)
let bgm = new Audio("bgm_mario.mp3");
bgm.loop = true;
bgm.volume = 0.3;

let sfxWing = new Audio("sfx_wing.wav");
let sfxPoint = new Audio("sfx_point.wav");
let sfxHit = new Audio("sfx_hit.wav");
let sfxDie = new Audio("sfx_die.wav");

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);

    // Controls
    document.addEventListener("keydown", jump);
    document.addEventListener("click", jump);
    document.addEventListener("touchstart", jump);

    document.getElementById("restartBtn")
        .addEventListener("click", restartGame);
};

function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    if (!gameOver) {
        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY, 0);
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

        if (bird.y > board.height) endGame();

        for (let pipe of pipeArray) {
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5;
                pipe.passed = true;

                // 🔊 point sound
                sfxPoint.currentTime = 0;
                sfxPoint.play();
            }

            if (detectCollision(bird, pipe)) endGame();
        }

        while (pipeArray.length && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift();
        }

        // Score panel
        context.fillStyle = "rgba(0,0,0,0.5)";
        context.fillRect(boardWidth - 140, 10, 130, 60);
        context.fillStyle = "white";
        context.font = "16px Arial";
        context.fillText("Score: " + score, boardWidth - 130, 35);
        context.fillText("Best: " + highScore, boardWidth - 130, 55);
    }

    if (gameOver) {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("flappyHighScore", highScore);
        }

        // Game Over Box
        let boxMargin = isMobile ? 20 : 30;
        let boxWidth = boardWidth - boxMargin * 2;
        let boxHeight = 180;
        let boxX = boxMargin;
        let boxY = boardHeight / 2 - boxHeight / 2;

        context.fillStyle = "rgba(0,0,0,0.7)";
        context.fillRect(boxX, boxY, boxWidth, boxHeight);

        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = "26px Arial";
        context.fillText("GAME OVER", boardWidth / 2, boxY + 50);

        context.font = "18px Arial";
        context.fillText("Score: " + score, boardWidth / 2, boxY + 95);
        context.fillText("Best: " + highScore, boardWidth / 2, boxY + 125);

        context.textAlign = "left";
        document.getElementById("restartBtn").style.display = "block";
    }
}

function placePipes() {
    if (gameOver) return;

    let randomPipeY =
        pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    pipeArray.push({
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    });

    pipeArray.push({
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    });
}

function jump(e) {
    if (e.type === "keydown" &&
        e.code !== "Space" &&
        e.code !== "ArrowUp") return;

    velocityY = -6;

    // 🔊 wing sound
    sfxWing.currentTime = 0;
    sfxWing.play();

    // 🎵 start bgm after user action
    if (bgm.paused) bgm.play();

    if (gameOver) restartGame();
}

function endGame() {
    if (gameOver) return;

    gameOver = true;
    bgm.pause();
    sfxHit.play();
    sfxDie.play();
}

function restartGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    velocityY = 0;
    gameOver = false;

    document.getElementById("restartBtn").style.display = "none";

    bgm.currentTime = 0;
    bgm.play();
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
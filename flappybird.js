let board;
let context;

// Detect device
let isMobile = window.innerWidth <= 768;

// ✅ Mobile safe height
let boardWidth = isMobile ? window.innerWidth : 420;
let boardHeight = isMobile
    ? document.documentElement.clientHeight
    : 640;

// Bird
let birdWidth = 40;
let birdHeight = 30;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };

// Background
let bgImg = new Image();
bgImg.src = "flappybirdbg.png";

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
let jumpPower = isMobile ? -4.5 : -6;

let gameOver = false;
let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;

// Sound flag
let userInteracted = false;

// Sounds
let bgm = new Audio("bgm_mario.mp3");
bgm.loop = true;
bgm.volume = 0.3;

let sfxWing = new Audio("sfx_wing.wav");
let sfxPoint = new Audio("sfx_point.wav");
let sfxHit = new Audio("sfx_hit.wav");
let sfxDie = new Audio("sfx_die.wav");

window.onload = () => {
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

    document.addEventListener("keydown", jump);
    document.addEventListener("click", jump);
    document.addEventListener("touchstart", jump);

    document
        .getElementById("restartBtn")
        .addEventListener("click", restartGame);
};

function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // ✅ DRAW BACKGROUND INSIDE CANVAS
    context.drawImage(bgImg, 0, 0, board.width, board.height);

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
                if (userInteracted) sfxPoint.play().catch(() => { });
            }

            if (detectCollision(bird, pipe)) endGame();
        }

        while (pipeArray.length && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift();
        }

        // Score UI
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

        let margin = isMobile ? 20 : 30;
        let boxWidth = boardWidth - margin * 2;
        let boxHeight = 180;

        context.fillStyle = "rgba(0,0,0,0.7)";
        context.fillRect(
            margin,
            boardHeight / 2 - boxHeight / 2,
            boxWidth,
            boxHeight
        );

        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = "26px Arial";
        context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2 - 30);
        context.font = "18px Arial";
        context.fillText("Score: " + score, boardWidth / 2, boardHeight / 2 + 10);
        context.fillText("Best: " + highScore, boardWidth / 2, boardHeight / 2 + 40);

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

    userInteracted = true;
    velocityY = jumpPower;

    sfxWing.play().catch(() => { });
    if (bgm.paused) bgm.play().catch(() => { });

    if (gameOver) restartGame();
}

function endGame() {
    if (gameOver) return;
    gameOver = true;
    bgm.pause();

    if (userInteracted) {
        sfxHit.play().catch(() => { });
        sfxDie.play().catch(() => { });
    }
}

function restartGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    velocityY = 0;
    gameOver = false;
    document.getElementById("restartBtn").style.display = "none";
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
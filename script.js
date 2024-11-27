const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("scoreValue");

canvas.width = 400;
canvas.height = 400;

const background = new Image();
background.src = 'background.png';

const playerImg = new Image();
playerImg.src = 'pacman.png';

const objectImg = new Image();
objectImg.src = 'Beer.png';

let score = 0;
let player = { x: 180, y: 350, width: 40, height: 40, speed: 20 };
let fallingObjects = [];
let gameOver = false;
let gameEndTime = 0; // Час закінчення гри (через 1 хвилину)

// Малювання
function drawBackground() {
    ctx.fillStyle = "#000"; // Чорний фон
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawObject(obj) {
    ctx.drawImage(objectImg, obj.x, obj.y, obj.width, obj.height);
}

// Перевірка зіткнення
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
    );
}

// Управління
document.addEventListener("keydown", (e) => {
    if (!gameOver) {
        if (e.key === "ArrowLeft" && player.x > 0) player.x -= player.speed;
        if (e.key === "ArrowRight" && player.x + player.width < canvas.width) player.x += player.speed;
    }
});

// Оновлення
let lastUpdateTime = 0;
function updateGame(timestamp) {
    if (gameOver) return; // Гра завершена

    if (!lastUpdateTime) lastUpdateTime = timestamp;
    const delta = timestamp - lastUpdateTime;

    if (delta > 16) { // 16 ms ~ 60 FPS
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();

        // Оновлення падаючих об'єктів
        for (let i = 0; i < fallingObjects.length; i++) {
            let obj = fallingObjects[i];
            obj.y += obj.speed;

            if (checkCollision(player, obj)) {
                score++;
                scoreElement.textContent = score;
                fallingObjects.splice(i, 1);
                i--;
            } else if (obj.y > canvas.height) {
                fallingObjects.splice(i, 1);
                i--;
            } else {
                drawObject(obj);
            }
        }

        // Створення нового об'єкта кожні 20 мс (близько 50 об'єктів за секунду)
        if (Math.random() < 0.05) createFallingObject();
        drawPlayer();

        lastUpdateTime = timestamp;
    }

    // Перевірка часу
    if (timestamp > gameEndTime) {
        endGame();
    } else {
        requestAnimationFrame(updateGame);
    }
}

// Створення об'єкта
function createFallingObject() {
    let x = Math.random() * (canvas.width - 20);
    fallingObjects.push({ x, y: 0, width: 20, height: 20, speed: 3 + Math.random() * 3 });
}

// Завершення гри
function endGame() {
    gameOver = true;
    alert("Час вичерпано! Ваш рахунок: " + score);
    document.getElementById("startButton").style.display = "block"; // Показати кнопку старту
}

// Початок гри
background.onload = playerImg.onload = objectImg.onload = () => {
    // Гра не запускається до натискання кнопки
    document.getElementById("startButton").addEventListener("click", function() {
        this.style.display = "none"; // Сховати кнопку
        score = 0;
        scoreElement.textContent = score;
        gameOver = false;
        gameEndTime = performance.now() + 60000; // Час закінчення через 1 хвилину
        updateGame(performance.now()); // Запустити гру
    });
};

// --- Game Config ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

const gravity = 0.6;
const jumpPower = -12;
const playerSpeed = 5;
let currentLevel = 0;
let score = 0;

// --- Assets ---
const playerImg = new Image();
playerImg.src = 'assets/player.png';
const coinImg = new Image();
coinImg.src = 'assets/coin.png';
const enemyImg = new Image();
enemyImg.src = 'assets/kiromi.png';
const platformImg = new Image();
platformImg.src = 'assets/platform.png';

// --- Player ---
const player = {
    x: 50, y: 300, width: 32, height: 32,
    dx: 0, dy: 0, onGround: false
};

// --- Levels ---
const levels = [
    {
        coins: [
            {x: 200, y: 320}, {x: 400, y: 320}, {x: 600, y: 250}, {x: 650, y: 320}
        ],
        platforms: [
            {x: 550, y: 280, width: 100, height: 20}
        ],
        enemies: [
            {x: 500, y: 320, width: 32, height: 32, alive: true}
        ]
    },
    {
        coins: [
            {x: 150, y: 320}, {x: 350, y: 250}, {x: 500, y: 180}, {x: 700, y: 320}
        ],
        platforms: [
            {x: 300, y: 280, width: 100, height: 20},
            {x: 480, y: 210, width: 100, height: 20}
        ],
        enemies: [
            {x: 400, y: 320, width: 32, height: 32, alive: true},
            {x: 650, y: 320, width: 32, height: 32, alive: true}
        ]
    },
    {
        coins: [
            {x: 200, y: 320}, {x: 250, y: 250}, {x: 400, y: 180}, {x: 600, y: 320}, {x: 750, y: 250}
        ],
        platforms: [
            {x: 220, y: 280, width: 80, height: 20},
            {x: 380, y: 210, width: 100, height: 20},
            {x: 700, y: 280, width: 100, height: 20}
        ],
        enemies: [
            {x: 300, y: 320, width: 32, height: 32, alive: true},
            {x: 500, y: 320, width: 32, height: 32, alive: true},
            {x: 650, y: 320, width: 32, height: 32, alive: true}
        ]
    },
    {
        coins: [
            {x: 150, y: 250}, {x: 350, y: 180}, {x: 500, y: 320}, {x: 700, y: 250}
        ],
        platforms: [
            {x: 130, y: 210, width: 100, height: 20},
            {x: 300, y: 140, width: 100, height: 20},
            {x: 650, y: 210, width: 100, height: 20}
        ],
        enemies: [
            {x: 200, y: 320, width: 32, height: 32, alive: true},
            {x: 400, y: 320, width: 32, height: 32, alive: true},
            {x: 550, y: 320, width: 32, height: 32, alive: true}
        ]
    },
    {
        coins: [
            {x: 100, y: 250}, {x: 250, y: 180}, {x: 400, y: 110}, {x: 550, y: 180}, {x: 700, y: 250}
        ],
        platforms: [
            {x: 80, y: 210, width: 100, height: 20},
            {x: 230, y: 140, width: 100, height: 20},
            {x: 380, y: 70, width: 100, height: 20},
            {x: 530, y: 140, width: 100, height: 20},
            {x: 680, y: 210, width: 100, height: 20}
        ],
        enemies: [
            {x: 150, y: 320, width: 32, height: 32, alive: true},
            {x: 300, y: 320, width: 32, height: 32, alive: true},
            {x: 450, y: 320, width: 32, height: 32, alive: true},
            {x: 600, y: 320, width: 32, height: 32, alive: true}
        ]
    }
];

// --- Input ---
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

// --- Game Loop ---
function update() {
    // Horizontal movement
    if (keys['ArrowRight']) player.dx = playerSpeed;
    else if (keys['ArrowLeft']) player.dx = -playerSpeed;
    else player.dx = 0;

    // Jump
    if (keys['Space'] && player.onGround) {
        player.dy = jumpPower;
        player.onGround = false;
    }

    // Apply gravity
    player.dy += gravity;
    player.x += player.dx;
    player.y += player.dy;

    // Ground collision
    if (player.y + player.height >= canvas.height - 50) {
        player.y = canvas.height - 50 - player.height;
        player.dy = 0;
        player.onGround = true;
    }

    // Platform collisions
    for (let p of levels[currentLevel].platforms) {
        if (player.x < p.x + p.width && player.x + player.width > p.x &&
            player.y + player.height <= p.y + 10 && player.y + player.height + player.dy >= p.y) {
            player.y = p.y - player.height;
            player.dy = 0;
            player.onGround = true;
        }
    }

    // Coin collection
    levels[currentLevel].coins = levels[currentLevel].coins.filter(c => {
        if (player.x < c.x + 16 && player.x + player.width > c.x &&
            player.y < c.y + 16 && player.y + player.height > c.y) {
            score += 10;
            return false;
        }
        return true;
    });

    // Enemy collisions
    for (let e of levels[currentLevel].enemies) {
        if (!e.alive) continue;
        if (player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
            if (player.dy > 0) { // Jump kill
                e.alive = false;
                player.dy = jumpPower / 2; // bounce
                score += 20;
            } else {
                // Player hit
                alert("Game Over!");
                document.location.reload();
            }
        }
    }

    // Next level
    if (levels[currentLevel].coins.length === 0) {
        currentLevel++;
        if (currentLevel >= levels.length) {
            alert("You Win! Final Score: " + score);
            document.location.reload();
        } else {
            player.x = 50; player.y = 300; player.dy = 0;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#88c070';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Draw coins
    for (let c of levels[currentLevel].coins) {
        ctx.drawImage(coinImg, c.x, c.y, 16, 16);
    }

    // Draw platforms
    for (let p of levels[currentLevel].platforms) {
        ctx.drawImage(platformImg, p.x, p.y, p.width, p.height);
    }

    // Draw enemies
    for (let e of levels[currentLevel].enemies) {
        if (e.alive) ctx.drawImage(enemyImg, e.x, e.y, e.width, e.height);
    }

    // Score
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText("Score: " + score, 20, 30);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

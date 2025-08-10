// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas size
canvas.width = 800;
canvas.height = 450;

// Load assets
const backgroundImg = new Image();
backgroundImg.src = 'assets/background.png';

const platformImg = new Image();
platformImg.src = 'assets/platform.png';

const coinImg = new Image();
coinImg.src = 'assets/coin.png';

const playerImg = new Image();
playerImg.src = 'assets/player.png';

const kiromiImg = new Image();
kiromiImg.src = 'assets/kiromi.png';

// Game variables
let gravity = 0.6;
let level = 1;
let score = 0;
let lives = 3;

// Player
let player = {
    x: 50,
    y: 300,
    width: 40,
    height: 50,
    dx: 0,
    dy: 0,
    onGround: false
};

// Platforms
let platforms = [];
let coins = [];
let enemies = [];

// Create platforms, coins, enemies for a level
function generateLevel(lvl) {
    platforms = [];
    coins = [];
    enemies = [];

    // Platforms
    platforms.push({ x: 0, y: 400, width: 800, height: 50 });
    platforms.push({ x: 200, y: 300, width: 120, height: 20 });
    platforms.push({ x: 450, y: 250, width: 120, height: 20 });
    if (lvl >= 2) platforms.push({ x: 650, y: 200, width: 120, height: 20 });
    if (lvl >= 3) platforms.push({ x: 350, y: 150, width: 120, height: 20 });

    // Coins (smaller size, some on ground, some floating)
    coins.push({ x: 230, y: 270, collected: false });
    coins.push({ x: 480, y: 220, collected: false });
    if (lvl >= 2) coins.push({ x: 680, y: 170, collected: false });
    if (lvl >= 3) coins.push({ x: 380, y: 120, collected: false });
    coins.push({ x: 600, y: 370, collected: false });

    // Enemies
    enemies.push({ x: 500, y: 370, width: 40, height: 40, dx: 1 });
    if (lvl >= 2) enemies.push({ x: 250, y: 270, width: 40, height: 40, dx: -1 });
    if (lvl >= 3) enemies.push({ x: 650, y: 170, width: 40, height: 40, dx: -1 });
}

generateLevel(level);

// Controls
let keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

// Game loop
function update() {
    // Player movement
    if (keys['ArrowRight']) player.dx = 3;
    else if (keys['ArrowLeft']) player.dx = -3;
    else player.dx = 0;

    if (keys['Space'] && player.onGround) {
        player.dy = -12;
        player.onGround = false;
    }

    player.dy += gravity;
    player.x += player.dx;
    player.y += player.dy;

    // Collision with platforms
    player.onGround = false;
    platforms.forEach(p => {
        if (player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y + player.height < p.y + player.dy &&
            player.y + player.height + player.dy >= p.y) {
            player.dy = 0;
            player.y = p.y - p

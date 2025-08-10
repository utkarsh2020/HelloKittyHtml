class BaseLevel extends Phaser.Scene {
    constructor(key, nextLevel) {
        super(key);
        this.nextLevel = nextLevel;
        this.level = parseInt(key.replace('Level', ''));
    }

    preload() {
        // Load all assets with proper sizing based on Python implementation
        this.load.image('background', 'assets/background.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('coin', 'assets/coin.png');
        this.load.image('powerup', 'assets/coin.png');
        this.load.image('player', 'assets/hello_kitty.png');
        this.load.image('enemy', 'assets/kiromi.png');
    }

    create() {
        // Background with coastal theme like Python version
        this.createBackground();

        // Initialize game state
        this.score = 0;
        this.lives = 3;
        this.playerPoweredUp = false;
        this.powerUpTimer = 0;
        this.invincible = false;
        this.invincibleTimer = 0;

        // Platforms - exact layout from Python implementation
        this.platforms = this.physics.add.staticGroup();
        this.createPlatforms();

        // Player - 40x40 size like Python version
        this.player = this.physics.add.sprite(100, 500, 'player');
        this.player.setDisplaySize(40, 40);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(480); // Gravity like Python (0.8 * 60fps)

        // Collectibles - coins and power-ups based on level
        this.coins = this.physics.add.group();
        this.powerups = this.physics.add.group();
        this.createCollectibles();

        // Enemies based on level
        this.enemies = this.physics.add.group();
        this.createEnemies();

        // Physics colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.coins, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);

        // Overlaps for collectibles and enemies
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

        // Input controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // UI Text
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#000' });
        this.livesText = this.add.text(16, 50, 'Lives: 3', { fontSize: '24px', fill: '#000' });
    }

    createBackground() {
        // Use the background image from assets folder
        this.add.image(400, 300, 'background').setScrollFactor(0);
    }

    createPlatforms() {
        // Ground platform
        this.platforms.create(400, 580, 'ground').setScale(10, 1).refreshBody();
        
        // Level-specific platforms based on Python implementation
        if (this.level === 1) {
            this.platforms.create(250, 470, 'ground').setScale(1.25, 0.33).refreshBody();
            this.platforms.create(450, 370, 'ground').setScale(1.25, 0.33).refreshBody();
            this.platforms.create(650, 270, 'ground').setScale(1.25, 0.33).refreshBody();
        } else if (this.level === 2) {
            this.platforms.create(190, 520, 'ground').setScale(1, 0.33).refreshBody();
            this.platforms.create(340, 420, 'ground').setScale(1, 0.33).refreshBody();
            this.platforms.create(540, 320, 'ground').setScale(1, 0.33).refreshBody();
            this.platforms.create(140, 220, 'ground').setScale(1, 0.33).refreshBody();
            this.platforms.create(700, 170, 'ground').setScale(1.25, 0.33).refreshBody();
        } else if (this.level === 3) {
            this.platforms.create(130, 500, 'ground').setScale(0.75, 0.33).refreshBody();
            this.platforms.create(280, 440, 'ground').setScale(0.75, 0.33).refreshBody();
            this.platforms.create(430, 380, 'ground').setScale(0.75, 0.33).refreshBody();
            this.platforms.create(580, 320, 'ground').setScale(0.75, 0.33).refreshBody();
            this.platforms.create(230, 260, 'ground').setScale(0.75, 0.33).refreshBody();
            this.platforms.create(430, 200, 'ground').setScale(0.75, 0.33).refreshBody();
            this.platforms.create(650, 140, 'ground').setScale(1.25, 0.33).refreshBody();
        }
    }

    createCollectibles() {
        // Level-specific collectibles based on Python implementation
        if (this.level === 1) {
            // Coins
            const coinPositions = [
                {x: 240, y: 440}, {x: 440, y: 340}, {x: 640, y: 240},
                {x: 70, y: 480}, {x: 770, y: 480}
            ];
            coinPositions.forEach(pos => {
                const coin = this.coins.create(pos.x, pos.y, 'coin');
                coin.setDisplaySize(20, 20);
                coin.setTint(0xffff00);
            });
            
            // Power-up
            const powerup = this.powerups.create(440, 330, 'powerup');
            powerup.setDisplaySize(20, 20);
            powerup.setTint(0xff6600); // Orange tint to distinguish from coins
            
        } else if (this.level === 2) {
            // More coins
            const coinPositions = [
                {x: 190, y: 490}, {x: 340, y: 390}, {x: 540, y: 290},
                {x: 140, y: 190}, {x: 700, y: 140}
            ];
            coinPositions.forEach(pos => {
                const coin = this.coins.create(pos.x, pos.y, 'coin');
                coin.setDisplaySize(20, 20);
                coin.setTint(0xffff00);
            });
            
            // Multiple power-ups
            const powerup1 = this.powerups.create(340, 380, 'powerup');
            powerup1.setDisplaySize(20, 20);
            powerup1.setTint(0xff6600); // Orange tint to distinguish from coins
            
            const powerup2 = this.powerups.create(700, 130, 'powerup');
            powerup2.setDisplaySize(20, 20);
            powerup2.setTint(0xff6600); // Orange tint to distinguish from coins
            
        } else if (this.level === 3) {
            // Challenge level coins
            const coinPositions = [
                {x: 130, y: 470}, {x: 280, y: 410}, {x: 430, y: 350},
                {x: 580, y: 290}, {x: 230, y: 230}, {x: 430, y: 170}, {x: 650, y: 110}
            ];
            coinPositions.forEach(pos => {
                const coin = this.coins.create(pos.x, pos.y, 'coin');
                coin.setDisplaySize(20, 20);
                // Remove tint to show actual coin image
            });
            
            // Multiple power-ups for final level
            const powerup1 = this.powerups.create(280, 400, 'powerup');
            powerup1.setDisplaySize(20, 20);
            powerup1.setTint(0xff6600); // Orange tint to distinguish from coins
            
            const powerup2 = this.powerups.create(430, 160, 'powerup');
            powerup2.setDisplaySize(20, 20);
            powerup2.setTint(0xff6600); // Orange tint to distinguish from coins
        }
    }

    createEnemies() {
        // Level-specific enemies based on Python implementation
        if (this.level === 1) {
            this.spawnEnemy(300, 540, 'normal');
            this.spawnEnemy(500, 350, 'fast');
            this.spawnEnemy(150, 450, 'normal');
        } else if (this.level === 2) {
            this.spawnEnemy(200, 500, 'normal');
            this.spawnEnemy(350, 400, 'fast');
            this.spawnEnemy(550, 300, 'jumper');
            this.spawnEnemy(400, 540, 'normal');
            this.spawnEnemy(600, 540, 'normal');
        } else if (this.level === 3) {
            this.spawnEnemy(150, 480, 'fast');
            this.spawnEnemy(300, 420, 'jumper');
            this.spawnEnemy(450, 360, 'fast');
            this.spawnEnemy(250, 240, 'jumper');
            this.spawnEnemy(200, 540, 'normal');
            this.spawnEnemy(500, 540, 'normal');
            this.spawnEnemy(700, 540, 'fast');
        }
    }

    spawnEnemy(x, y, type = 'normal') {
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setDisplaySize(35, 35);
        enemy.setCollideWorldBounds(true);
        enemy.enemyType = type;
        enemy.direction = -1;
        
        // Set properties based on enemy type (like Python version)
        if (type === 'fast') {
            enemy.speed = 120;
            enemy.setTint(0xff6666); // Red tint
        } else if (type === 'jumper') {
            enemy.speed = 30;
            enemy.jumpTimer = 0;
            enemy.setTint(0xcc66cc); // Purple tint
        } else {
            enemy.speed = 60;
        }
        
        enemy.setVelocityX(enemy.speed * enemy.direction);
    }

    collectCoin(player, coin) {
        coin.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        
        // Check if all coins collected for level completion
        if (this.coins.countActive(true) === 0 && this.powerups.countActive(true) === 0) {
            this.levelComplete();
        }
    }
    
    collectPowerup(player, powerup) {
        powerup.disableBody(true, true);
        
        // Activate power-up like Python version
        this.playerPoweredUp = true;
        this.powerUpTimer = 600; // 10 seconds at 60fps
        
        // Visual feedback - golden outline like Python
        this.player.setTint(0xffff00); // Yellow/golden tint
        
        // Check if all collectibles gathered
        if (this.coins.countActive(true) === 0 && this.powerups.countActive(true) === 0) {
            this.levelComplete();
        }
    }
    
    levelComplete() {
        if (this.nextLevel) {
            this.scene.start(this.nextLevel);
        } else {
            // Game completed
            this.add.text(400, 300, 'Congratulations!\nYou completed all levels!', 
                { fontSize: '32px', fill: '#000', align: 'center' }).setOrigin(0.5);
        }
    }

    hitEnemy(player, enemy) {
        if (!this.invincible) {
            if (this.playerPoweredUp) {
                // Kill enemy if powered up (like Python version)
                enemy.disableBody(true, true);
                this.score += 50;
                this.scoreText.setText('Score: ' + this.score);
            } else {
                // Player takes damage
                this.lives -= 1;
                this.livesText.setText('Lives: ' + this.lives);
                
                // Invincibility period like Python version
                this.invincible = true;
                this.invincibleTimer = 120; // 2 seconds at 60fps
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    gameOver() {
        this.add.text(400, 300, 'Game Over!\nPress R to restart', 
            { fontSize: '32px', fill: '#ff0000', align: 'center' }).setOrigin(0.5);
        
        this.input.keyboard.once('keydown-R', () => {
            this.scene.start('Level1');
        });
    }

    update() {
        // Power-up timer (like Python version)
        if (this.playerPoweredUp) {
            this.powerUpTimer -= 1;
            if (this.powerUpTimer <= 0) {
                this.playerPoweredUp = false;
                this.player.clearTint();
            }
        }
        
        // Invincibility timer (like Python version)
        if (this.invincible) {
            this.invincibleTimer -= 1;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
            
            // Blinking effect during invincibility
            this.player.setVisible((this.invincibleTimer % 10) < 5);
        } else {
            this.player.setVisible(true);
        }
        
        // Enemy AI based on Python implementation
        this.enemies.children.iterate(enemy => {
            if (enemy.enemyType === 'jumper') {
                enemy.jumpTimer += 1;
                if (enemy.jumpTimer > 60 && enemy.body.touching.down) {
                    enemy.setVelocityY(-360);
                    enemy.jumpTimer = 0;
                }
            }
            
            // Horizontal movement
            enemy.setVelocityX(enemy.speed * enemy.direction);
            
            // Boundary checking
            if (enemy.x <= 0 || enemy.x >= 765) {
                enemy.direction *= -1;
            }
        });

        // Player movement (like Python version)
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-180);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(180);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
        }

        // Jumping (like Python version) - Fixed spacebar detection
        if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
            this.player.setVelocityY(-480);
        }
    }
}

// Three levels with increasing difficulty
class Level1 extends BaseLevel {
    constructor() {
        super('Level1', 'Level2');
    }
}

class Level2 extends BaseLevel {
    constructor() {
        super('Level2', 'Level3');
    }
}

class Level3 extends BaseLevel {
    constructor() {
        super('Level3', null);
    }
}

// Phaser config
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // We handle gravity per-object
            debug: false
        }
    },
    scene: [Level1, Level2, Level3]
};

window.addEventListener('load', () => {
    new Phaser.Game(config);
});

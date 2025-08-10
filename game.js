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
        this.load.image('flag', 'assets/kitty_flag.png');
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
        this.allCoinsCollected = false;
        this.flag = null;
        this.gameOver = false;

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
        
        // Flag for level completion (initially hidden)
        this.flagGroup = this.physics.add.group();

        // Physics colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.coins, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);

        // Overlaps for collectibles and enemies
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.flagGroup, this.touchFlag, null, this);

        // Input controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // UI Text
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#000' });
        this.livesText = this.add.text(16, 50, 'Lives: 3', { fontSize: '24px', fill: '#000' });
        
        // Mobile controls
        this.createMobileControls();
    }

    createBackground() {
        // Use the background image from assets folder
        this.add.image(400, 300, 'background').setScrollFactor(0);
    }

    createPlatforms() {
        // Ground platform
        this.platforms.create(400, 580, 'ground').setScale(10, 1).refreshBody();
        
        // Level-specific platforms with proper vertical spacing (player height = 40px, so 80px+ gaps)
        if (this.level === 1) {
            this.platforms.create(250, 450, 'ground').setScale(1.25, 0.33).refreshBody();
            this.platforms.create(450, 350, 'ground').setScale(1.25, 0.33).refreshBody();
            this.platforms.create(650, 250, 'ground').setScale(1.25, 0.33).refreshBody();
        } else if (this.level === 2) {
            this.platforms.create(190, 500, 'ground').setScale(1, 0.33).refreshBody();
            this.platforms.create(340, 400, 'ground').setScale(1, 0.33).refreshBody();
            this.platforms.create(540, 300, 'ground').setScale(1, 0.33).refreshBody();
            this.platforms.create(140, 200, 'ground').setScale(1, 0.33).refreshBody();
            this.platforms.create(700, 150, 'ground').setScale(1.25, 0.33).refreshBody();
        } else if (this.level === 3) {
            // Level 3: Much better spacing - at least 100px between platforms
            this.platforms.create(130, 460, 'ground').setScale(0.75, 0.33).refreshBody();
            this.platforms.create(300, 350, 'ground').setScale(0.75, 0.33).refreshBody();
            this.platforms.create(500, 240, 'ground').setScale(0.75, 0.33).refreshBody();
            this.platforms.create(200, 130, 'ground').setScale(0.75, 0.33).refreshBody();
            this.platforms.create(650, 350, 'ground').setScale(0.75, 0.33).refreshBody();
        }
    }

    createCollectibles() {
        // Level-specific collectibles with adjusted positions for new platform heights
        if (this.level === 1) {
            // Coins
            const coinPositions = [
                {x: 240, y: 420}, {x: 440, y: 320}, {x: 640, y: 220},
                {x: 70, y: 500}, {x: 750, y: 500}
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
                {x: 190, y: 470}, {x: 340, y: 370}, {x: 540, y: 270},
                {x: 140, y: 170}, {x: 700, y: 120}
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
            // Challenge level coins - adjusted for new platform positions
            const coinPositions = [
                {x: 130, y: 430}, {x: 300, y: 320}, {x: 500, y: 210},
                {x: 200, y: 100}, {x: 650, y: 320}, {x: 400, y: 500}
            ];
            coinPositions.forEach(pos => {
                const coin = this.coins.create(pos.x, pos.y, 'coin');
                coin.setDisplaySize(20, 20);
                // Remove tint to show actual coin image
            });
            
            // Multiple power-ups for final level - adjusted positions
            const powerup1 = this.powerups.create(300, 310, 'powerup');
            powerup1.setDisplaySize(20, 20);
            powerup1.setTint(0xff6600); // Orange tint to distinguish from coins
            
            const powerup2 = this.powerups.create(200, 90, 'powerup');
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
            this.spawnEnemy(150, 440, 'fast');
            this.spawnEnemy(320, 330, 'jumper');
            this.spawnEnemy(520, 220, 'fast');
            this.spawnEnemy(220, 110, 'jumper');
            this.spawnEnemy(200, 540, 'normal');
            this.spawnEnemy(500, 540, 'normal');
            this.spawnEnemy(670, 330, 'fast');
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
        
        // Check if all coins collected to spawn flag
        if (this.coins.countActive(true) === 0 && !this.allCoinsCollected) {
            this.allCoinsCollected = true;
            this.spawnFlag();
        }
    }
    
    collectPowerup(player, powerup) {
        powerup.disableBody(true, true);
        
        // Activate power-up like Python version
        this.playerPoweredUp = true;
        this.powerUpTimer = 600; // 10 seconds at 60fps
        
        // Visual feedback - golden outline like Python
        this.player.setTint(0xffff00); // Yellow/golden tint
    }
    
    spawnFlag() {
        // Spawn flag on ground or platforms only, never in air
        const flagPositions = [];
        
        // Always add ground positions
        flagPositions.push(
            {x: 100, y: 520}, {x: 300, y: 520}, {x: 500, y: 520}, {x: 700, y: 520}
        );
        
        // Add platform positions based on level
        if (this.level === 1) {
            flagPositions.push(
                {x: 250, y: 410}, {x: 450, y: 310}, {x: 650, y: 210}
            );
        } else if (this.level === 2) {
            flagPositions.push(
                {x: 190, y: 460}, {x: 340, y: 360}, {x: 540, y: 260}, {x: 140, y: 160}, {x: 700, y: 110}
            );
        } else if (this.level === 3) {
            flagPositions.push(
                {x: 130, y: 420}, {x: 300, y: 310}, {x: 500, y: 200}, {x: 200, y: 90}, {x: 650, y: 310}
            );
        }
        
        const randomPos = Phaser.Utils.Array.GetRandom(flagPositions);
        this.flag = this.flagGroup.create(randomPos.x, randomPos.y, 'flag');
        this.flag.setDisplaySize(60, 80); // Make flag visible
        this.flag.setTint(0x00ff00); // Green tint to make it stand out
        
        // Add gentle floating animation
        this.tweens.add({
            targets: this.flag,
            y: this.flag.y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    touchFlag(player, flag) {
        flag.disableBody(true, true);
        this.levelComplete();
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
        this.gameOver = true;
        
        // Stop all physics and animations
        this.physics.pause();
        
        // Disable mobile controls
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        
        this.add.text(400, 300, 'Game Over!\nPress R to restart', 
            { fontSize: '32px', fill: '#ff0000', align: 'center' }).setOrigin(0.5);
        
        this.input.keyboard.once('keydown-R', () => {
            this.scene.start('Level1');
        });
    }

    update() {
        // Stop all updates if game is over
        if (this.gameOver) {
            return;
        }
        
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
            
            // Improved boundary and platform edge detection
            const nextX = enemy.x + (enemy.speed * enemy.direction * 0.1); // Predict next position
            
            // Turn around at screen edges
            if (nextX <= 0 || nextX >= 765) {
                enemy.direction *= -1;
                enemy.setVelocityX(enemy.speed * enemy.direction);
                return; // Skip other checks this frame
            }
            
            // Check if enemy will fall off platform
            if (enemy.body.touching.down) {
                let willFall = true;
                const futureX = nextX + (enemy.width / 2);
                
                this.platforms.children.entries.forEach(platform => {
                    const platformRect = platform.getBounds();
                    if (enemy.y + enemy.height >= platformRect.top - 5 && 
                        enemy.y + enemy.height <= platformRect.bottom + 5 &&
                        futureX >= platformRect.left && 
                        futureX <= platformRect.right) {
                        willFall = false;
                    }
                });
                
                // Also check ground
                if (enemy.y + enemy.height >= 540 && futureX >= 0 && futureX <= 800) {
                    willFall = false;
                }
                
                if (willFall) {
                    enemy.direction *= -1;
                    enemy.setVelocityX(enemy.speed * enemy.direction);
                }
            }
        });

        // Player movement (like Python version) - Include mobile controls
        if (!this.gameOver) {
            if (this.cursors.left.isDown || this.leftPressed) {
                this.player.setVelocityX(-180);
                this.player.setFlipX(true);
            } else if (this.cursors.right.isDown || this.rightPressed) {
                this.player.setVelocityX(180);
                this.player.setFlipX(false);
            } else {
                this.player.setVelocityX(0);
            }

            // Jumping (like Python version) - Fixed spacebar detection
            if ((this.cursors.up.isDown || this.spaceKey.isDown || this.jumpPressed) && this.player.body.touching.down) {
                this.player.setVelocityY(-480);
            }
        }
        
        // Reset mobile control flags
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
    }
    
    createMobileControls() {
        // Mobile control flags
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        
        // Left button
        const leftBtn = this.add.rectangle(80, 520, 60, 60, 0x000000, 0.3)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => { this.leftPressed = true; })
            .on('pointerup', () => { this.leftPressed = false; })
            .on('pointerout', () => { this.leftPressed = false; });
        
        this.add.text(80, 520, '←', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5)
            .setScrollFactor(0);
        
        // Right button
        const rightBtn = this.add.rectangle(160, 520, 60, 60, 0x000000, 0.3)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => { this.rightPressed = true; })
            .on('pointerup', () => { this.rightPressed = false; })
            .on('pointerout', () => { this.rightPressed = false; });
        
        this.add.text(160, 520, '→', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5)
            .setScrollFactor(0);
        
        // Jump button
        const jumpBtn = this.add.rectangle(680, 520, 80, 60, 0x000000, 0.3)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => { this.jumpPressed = true; })
            .on('pointerup', () => { this.jumpPressed = false; })
            .on('pointerout', () => { this.jumpPressed = false; });
        
        this.add.text(680, 520, 'JUMP', { fontSize: '16px', fill: '#fff' })
            .setOrigin(0.5)
            .setScrollFactor(0);
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

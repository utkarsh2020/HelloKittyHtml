class BaseLevel extends Phaser.Scene {
    constructor(key, nextLevel) {
        super(key);
        this.nextLevel = nextLevel;
    }

    preload() {
        // Load all assets
        this.load.image('background', 'assets/background.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('coin', 'assets/coin.png');
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        // Background
        this.add.image(400, 300, 'background').setScrollFactor(0);

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        // Player
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // Player animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [{ key: 'player', frame: 4 }],
            frameRate: 20
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // Coins
        this.coins = this.physics.add.group({
            key: 'coin',
            repeat: 10,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
        this.coins.children.iterate(child => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        // Enemies
        this.enemies = this.physics.add.group();
        this.spawnEnemy(400, 300);
        this.spawnEnemy(700, 150);

        // Colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.coins, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);

        // Overlaps
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    spawnEnemy(x, y) {
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setCollideWorldBounds(true);
        enemy.setVelocityX(50); // Move horizontally
        enemy.direction = 1;
    }

    collectCoin(player, coin) {
        coin.disableBody(true, true);

        if (this.coins.countActive(true) === 0) {
            this.coins.children.iterate(child => {
                child.enableBody(true, child.x, 0, true, true);
            });
        }
    }

    hitEnemy(player, enemy) {
        if (player.body.velocity.y > 0) {
            enemy.disableBody(true, true); // Kill enemy if jumped on
            player.setVelocityY(-200); // Bounce
        } else {
            this.scene.restart(); // Player dies
        }
    }

    update() {
        // Enemy movement AI
        this.enemies.children.iterate(enemy => {
            enemy.setVelocityX(enemy.direction * 50);
            if (enemy.x <= 50) enemy.direction = 1;
            if (enemy.x >= 750) enemy.direction = -1;
        });

        // Player movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }

        // Level complete
        if (this.player.y < 0) {
            if (this.nextLevel) {
                this.scene.start(this.nextLevel);
            } else {
                alert('You finished all levels!');
                this.scene.start('Level1');
            }
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
    create() {
        super.create();
        this.spawnEnemy(300, 200);
        this.spawnEnemy(500, 100);
    }
}
class Level3 extends BaseLevel {
    constructor() {
        super('Level3', null);
    }
    create() {
        super.create();
        this.spawnEnemy(200, 300);
        this.spawnEnemy(400, 250);
        this.spawnEnemy(600, 150);
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
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [Level1, Level2, Level3]
};

window.addEventListener('load', () => {
    new Phaser.Game(config);
});

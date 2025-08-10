// Simple Phaser 3 platformer inspired by your Python game
const WIDTH = Math.min(window.innerWidth, 900);
const HEIGHT = Math.round(WIDTH * 0.66);

const config = {
  type: Phaser.AUTO,
  parent: 'gameContainer',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: 0x87ceeb,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1000 }, debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {
  // Replace these with your actual assets placed in assets/
  this.load.image('bg', 'assets/background.png');             // optional background
  this.load.image('platform', 'assets/platform.png');        // optional platform image
  this.load.image('coin', 'assets/coin.png');                // optional coin
  this.load.image('hello', 'assets/hello kitty.png');        // your provided kitty image
  this.load.image('kuromi', 'assets/kiromi.png');            // enemy image
}

let player, cursors, leftDown=false, rightDown=false, jumpDown=false;
let score = 0, scoreText, lives = 3, livesText;
let coins, platforms, enemies;

function create() {
  // background (if present)
  if (this.textures.exists('bg')) {
    this.add.image(WIDTH/2, HEIGHT/2, 'bg').setDisplaySize(WIDTH, HEIGHT);
  } else {
    this.add.rectangle(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT, 0xd0f4f7);
  }

  // static platforms group (ground + a few floating)
  platforms = this.physics.add.staticGroup();
  // ground
  platforms.create(WIDTH/2, HEIGHT - 16, 'platform')?.setScale(WIDTH/200, 0.5).refreshBody();
  // fallback if platform image missing: create graphics
  if (!this.textures.exists('platform')) {
    const g = this.add.graphics();
    g.fillStyle(0x5c3c1a, 1);
    g.fillRect(0, HEIGHT - 32, WIDTH, 32);
  } else {
    platforms.create(150, HEIGHT - 140, 'platform').refreshBody();
    platforms.create(WIDTH - 150, HEIGHT - 230, 'platform').refreshBody();
    platforms.create(WIDTH/2, HEIGHT - 320, 'platform').refreshBody();
  }

  // player (use image—single frame)
  player = this.physics.add.sprite(100, HEIGHT - 150, 'hello');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);
  player.setScale(0.12); // scale down common large PNGs
  player.body.setSize(player.width*0.8, player.height*0.9, true);

  this.physics.add.collider(player, platforms);

  // coins group (procedurally placed)
  coins = this.physics.add.group();
  for (let i = 0; i < 8; i++) {
    let x = 120 + i * (WIDTH - 240) / 7;
    let y = Phaser.Math.Between(50, HEIGHT - 200);
    let c = coins.create(x, y, 'coin');
    if (c) {
      c.setBounceY(Phaser.Math.FloatBetween(0.3, 0.8));
      c.setScale(c.displayWidth ? 0.5 : 0.08);
    } else {
      // if coin image missing, draw small circle
      const circ = this.add.circle(x, y, 10, 0xffd700);
      this.physics.add.existing(circ);
      circ.body.setBounce(0.5);
      circ.body.setCollideWorldBounds(true);
      coins.add(circ);
    }
  }
  this.physics.add.collider(coins, platforms);
  this.physics.add.overlap(player, coins, collectCoin, null, this);

  // enemies (Kuromi) - simple patrols
  enemies = this.physics.add.group();
  const enemyA = enemies.create(WIDTH - 140, HEIGHT - 260, 'kuromi');
  if (enemyA) { enemyA.setScale(0.12); enemyA.setCollideWorldBounds(true); enemyA.setVelocityX(-60); }
  const enemyB = enemies.create(WIDTH/2, HEIGHT - 380, 'kuromi');
  if (enemyB) { enemyB.setScale(0.12); enemyB.setCollideWorldBounds(true); enemyB.setVelocityX(50); }

  this.physics.add.collider(enemies, platforms);
  this.physics.add.collider(player, enemies, hitEnemy, null, this);

  // UI
  scoreText = this.add.text(12, 12, 'Score: 0', { fontSize: '20px', fill: '#000' }).setScrollFactor(0);
  livesText = this.add.text(12, 36, 'Lives: 3', { fontSize: '20px', fill: '#000' }).setScrollFactor(0);

  // keyboard cursors
  cursors = this.input.keyboard.createCursorKeys();

  // Mobile touch buttons
  setupTouchControls(this);
}

function collectCoin(player, coin) {
  if (!coin.active) return;
  coin.disableBody ? coin.disableBody(true, true) : coin.destroy();
  score += 10;
  scoreText.setText('Score: ' + score);
}

function hitEnemy(player, enemy) {
  // simple collision: if player falls onto enemy, kill enemy; else lose life
  if (player.body.velocity.y > 100) {
    // stomped
    if (enemy.disableBody) { enemy.disableBody(true,true); } else { enemy.destroy(); }
    player.setVelocityY(-200);
    score += 20;
    scoreText.setText('Score: ' + score);
  } else {
    // take damage / respawn
    lives -= 1;
    livesText.setText('Lives: ' + lives);
    if (lives <= 0) {
      this.scene.pause();
      this.add.text(WIDTH/2, HEIGHT/2, 'Game Over', { fontSize: '48px', fill:'#000' }).setOrigin(0.5);
    } else {
      // small invulnerability blink and respawn
      player.setTint(0xff0000);
      player.x = 100; player.y = HEIGHT - 150;
      setTimeout(()=> player.clearTint(), 800);
    }
  }
}

function update(time, delta) {
  // enemy simple patrol flip
  enemies.children.iterate((e) => {
    if (!e || !e.body) return;
    if (e.body.blocked.left) e.setVelocityX(60);
    if (e.body.blocked.right) e.setVelocityX(-60);
  });

  // input handling
  const onGround = player.body.touching.down || player.body.blocked.down;

  let moveVel = 160;
  if (cursors.left.isDown || leftDown) {
    player.setVelocityX(-moveVel);
    player.flipX = true;
  } else if (cursors.right.isDown || rightDown) {
    player.setVelocityX(moveVel);
    player.flipX = false;
  } else {
    player.setVelocityX(0);
  }

  // jump: keyboard or touch
  if ((Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(cursors.space) || jumpDown) && onGround) {
    player.setVelocityY(-480);
    jumpDown = false; // single jump per press
  }
}

// --- Touch control wiring ---
function setupTouchControls(scene) {
  // hide controls if desktop
  if (!scene.sys.game.device.os.desktop) {
    document.getElementById('touchControls').style.display = 'block';
  } else {
    document.getElementById('touchControls').style.display = 'none';
  }

  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const btnJump = document.getElementById('btnJump');

  const setTouch = (el, start, end) => {
    if (!el) return;
    el.addEventListener('touchstart', (e)=>{ e.preventDefault(); start(); }, {passive:false});
    el.addEventListener('touchend', (e)=>{ e.preventDefault(); end(); }, {passive:false});
    el.addEventListener('mousedown', (e)=>{ e.preventDefault(); start(); });
    el.addEventListener('mouseup', (e)=>{ e.preventDefault(); end(); });
    el.addEventListener('mouseleave', (e)=>{ e.preventDefault(); end(); });
  };

  setTouch(btnLeft, ()=>{ leftDown=true; }, ()=>{ leftDown=false; });
  setTouch(btnRight, ()=>{ rightDown=true; }, ()=>{ rightDown=false; });
  setTouch(btnJump, ()=>{ jumpDown=true; setTimeout(()=> jumpDown=false, 200); }, ()=>{ jumpDown=false; });
}


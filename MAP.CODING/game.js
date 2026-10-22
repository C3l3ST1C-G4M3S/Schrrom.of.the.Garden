const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const groundY = 340;
const keys = new Set();
const player = {
  x: 100,
  y: groundY,
  velocityY: 0,
  facing: 1,
  hp: 30,
  maxHp: 30,
  onGround: true,
  attackUntil: 0,
  nextAttackAt: 0,
  invulnerableUntil: 0
};

const levels = [
  { name: "Poison Garden", boss: "Poison Bloom", color: "#598447", projectile: "#a9e34b" },
  { name: "Sunny Garden", boss: "Thorn King", color: "#8b7047", projectile: "#f2c14e" }
];

let levelIndex = 0;
let bossHp = 50;
let bossMaxHp = 50;
let bossDefeated = false;
let gameOver = false;
let won = false;
let message = "Defeat the garden boss!";
let nextAttackAt = performance.now() + 2200;
let projectiles = [];
let lastFrameAt = performance.now();

function resetGame() {
  player.x = 100;
  player.y = groundY;
  player.velocityY = 0;
  player.hp = player.maxHp;
  player.onGround = true;
  player.facing = 1;
  player.attackUntil = 0;
  player.nextAttackAt = 0;
  player.invulnerableUntil = 0;
  levelIndex = 0;
  bossHp = bossMaxHp = 50;
  bossDefeated = false;
  gameOver = false;
  won = false;
  message = "Defeat the garden boss!";
  projectiles = [];
  nextAttackAt = performance.now() + 2200;
}

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(event.key)) {
    event.preventDefault();
  }
  keys.add(event.key.toLowerCase());
  if (event.key === " " && !event.repeat) attack();
  if (event.key.toLowerCase() === "r") resetGame();
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());

function attack() {
  const now = performance.now();
  if (gameOver || won || bossDefeated || now < player.nextAttackAt) return;
  player.nextAttackAt = now + 420;
  player.attackUntil = now + 180;

  const bossX = 680;
  const distance = bossX - player.x;
  if (Math.abs(distance) <= 88 && distance * player.facing > 0) {
    bossHp = Math.max(0, bossHp - 8);
    message = "Nice hit!";
    if (bossHp === 0) {
      bossDefeated = true;
      message = levelIndex === 0 ? "Boss defeated! Head to the garden gate →" : "The garden is safe! You win!";
      if (levelIndex === 1) won = true;
    }
  } else {
    message = "Get close and face the boss to attack!";
  }
}

function hurtPlayer(amount) {
  const now = performance.now();
  if (gameOver || now < player.invulnerableUntil) return;
  player.hp = Math.max(0, player.hp - amount);
  player.invulnerableUntil = now + 800;
  message = "Ouch! Dodge the garden's attack!";
  if (player.hp === 0) {
    gameOver = true;
    message = "Schro is out of hearts. Press R to try again.";
  }
}

function update(now, delta) {
  if (gameOver || won) return;

  const movingLeft = keys.has("arrowleft") || keys.has("a");
  const movingRight = keys.has("arrowright") || keys.has("d");
  if (movingLeft) {
    player.x -= 230 * delta;
    player.facing = -1;
  }
  if (movingRight) {
    player.x += 230 * delta;
    player.facing = 1;
  }

  if ((keys.has("arrowup") || keys.has("w")) && player.onGround) {
    player.velocityY = -470;
    player.onGround = false;
  }

  player.velocityY += 1050 * delta;
  player.y += player.velocityY * delta;
  if (player.y >= groundY) {
    player.y = groundY;
    player.velocityY = 0;
    player.onGround = true;
  }
  player.x = Math.max(24, Math.min(canvas.width - 24, player.x));

  if (bossDefeated && levelIndex === 0 && player.x >= canvas.width - 50) {
    levelIndex = 1;
    player.x = 45;
    player.hp = Math.min(player.maxHp, player.hp + 10);
    bossHp = bossMaxHp = 65;
    bossDefeated = false;
    projectiles = [];
    nextAttackAt = now + 1800;
    message = "New garden, new boss! Schro found 10 hearts.";
  }

  if (!bossDefeated && now >= nextAttackAt) {
    const startX = canvas.width - 110;
    const direction = player.x < startX ? -1 : 1;
    projectiles.push({ x: startX, y: groundY - 28, velocityX: direction * 250 });
    nextAttackAt = now + 2100;
    message = "Incoming! Jump over the seed!";
  }

  for (const projectile of projectiles) {
    projectile.x += projectile.velocityX * delta;
    if (
      Math.abs(projectile.x - player.x) < 25 &&
      Math.abs(projectile.y - (player.y - 24)) < 38
    ) {
      projectile.hit = true;
      hurtPlayer(5);
    }
  }
  projectiles = projectiles.filter((projectile) => !projectile.hit && projectile.x > -20 && projectile.x < canvas.width + 20);
}

function draw() {
  const level = levels[levelIndex];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#bcecff");
  sky.addColorStop(1, "#f3f9d7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#d5edb0";
  ctx.beginPath();
  ctx.arc(125, 310, 110, Math.PI, 0);
  ctx.arc(330, 315, 150, Math.PI, 0);
  ctx.arc(590, 310, 120, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = level.color;
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  ctx.fillStyle = "#a7cb65";
  ctx.fillRect(0, groundY, canvas.width, 12);

  if (bossDefeated && levelIndex === 0) {
    ctx.fillStyle = "#9a55c5";
    ctx.beginPath();
    ctx.ellipse(canvas.width - 40, groundY - 54, 24, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "14px sans-serif";
    ctx.fillText("GATE →", canvas.width - 79, groundY - 110);
  }

  drawBoss(level);
  drawPlayer();
  drawProjectiles();
  drawHud(level);

  if (gameOver || won) {
    ctx.fillStyle = "rgba(12, 27, 20, 0.68)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(won ? "THE GARDEN IS SAFE!" : "GAME OVER", canvas.width / 2, 175);
    ctx.font = "18px sans-serif";
    ctx.fillText("Press R to play again", canvas.width / 2, 212);
    ctx.textAlign = "left";
  }
}

function drawPlayer() {
  const blinking = performance.now() < player.invulnerableUntil && Math.floor(performance.now() / 100) % 2 === 0;
  if (blinking) return;
  const x = player.x;
  const y = player.y;
  ctx.fillStyle = "#5a3825";
  ctx.fillRect(x - 12, y - 38, 24, 30);
  ctx.fillStyle = "#f1bb79";
  ctx.beginPath();
  ctx.arc(x, y - 48, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3c2b20";
  ctx.fillRect(x - 14, y - 62, 28, 9);
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + player.facing * 4, y - 51, 4, 4);
  if (performance.now() < player.attackUntil) {
    ctx.strokeStyle = "#fff3a3";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(x + player.facing * 20, y - 39, 28, -0.8, 0.8);
    ctx.stroke();
  }
}

function drawBoss(level) {
  const x = 680;
  const y = groundY;
  ctx.fillStyle = levelIndex === 0 ? "#633e8b" : "#b44f42";
  ctx.beginPath();
  ctx.ellipse(x, y - 43, 36, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = levelIndex === 0 ? "#a7d84b" : "#f4ce62";
  for (const offset of [-18, 0, 18]) {
    ctx.beginPath();
    ctx.ellipse(x + offset, y - 76, 10, 24, offset / 24, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - 9, y - 48, 4, 0, Math.PI * 2);
  ctx.arc(x + 9, y - 48, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#243324";
  ctx.fillRect(x - 42, y - 120, 84, 9);
  ctx.fillStyle = "#e34c55";
  ctx.fillRect(x - 41, y - 119, 82 * (bossHp / bossMaxHp), 7);
}

function drawProjectiles() {
  for (const projectile of projectiles) {
    ctx.fillStyle = levels[levelIndex].projectile;
    ctx.beginPath();
    ctx.ellipse(projectile.x, projectile.y, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHud(level) {
  ctx.fillStyle = "rgba(255,255,255,0.84)";
  ctx.fillRect(12, 12, 325, 80);
  ctx.fillStyle = "#243324";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(`Schroom of the Garden — ${level.name}`, 24, 38);
  ctx.font = "16px sans-serif";
  ctx.fillText(`Schro hearts: ${player.hp}/${player.maxHp}`, 24, 63);
  ctx.fillText(`${level.boss}: ${bossDefeated ? "defeated" : `${bossHp}/${bossMaxHp}`}`, 24, 84);
  ctx.fillStyle = "#243324";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, 26);
  ctx.textAlign = "left";
}

function frame(now) {
  const delta = Math.min((now - lastFrameAt) / 1000, 0.04);
  lastFrameAt = now;
  update(now, delta);
  draw();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// =========================================================
// 1. CANVAS AND GAME SETTINGS
// =========================================================

const = document.getElementBYId("canvas");
const ctx = canvas.getcontext("2d");

const groundY = 340;
const SAVE KEY = "Schro-poison-boss-save";

const key = {
    left: false,
    right: false,
};

// =========================================================
// 2. LOAD SAVED GAME
// =========================================================

let savedGame = {};

try{
    savedgame = JSON.parse(localstorage.getItem(SAVE_KEY) || "{}");
} catch {
  savedGame = {};
}

let bossDefeated = savedGame.bossDefeated === "grass"
? "grass"
: "poison";

let player Max Hp = bossDefeated ? 45 : 25;

let playerHp = number.isFinite(savedGame.playerHp)
? Math.max (0,Math.min (playerMaxHp, savedGame.playerHp)
: playerMaxHp;

let gameOver = playerHp <= 0;
let message = "FAINTED";

// =========================================================
// 3. CHARACTERS AND GAME STATE
// =========================================================

const Schro = {
    name : "Schro",
    x : 100,
    y: groundY, // Schro's feet position
    speed: 4,
    velocity : 0,
    jumpstrength : 12.5,
    gravity : 0.5555,
    facing: 1 // 1 + right, -1 = left
};
const poisonBoss = {
    x: 600,
     health: bossDefeated ? 0 : 50,
     maxHealth: 50,
};

const meleeRange = 71;
const meleeCooldown = 448;

let lastMeleeAttack = 0;
let meleeEffectUntil = 0;

const poisonRayInterval = 2600;
let poisonRayAt = performance.now() + poisonRayInterval;
let poisonRayEffect = 0;

// poisonBoss's screen zone attack.
const ZONE_COUNT = 5;
const ZONE_WARNING_MS = 3001;
const ZONE_ACTIVE_MS =1501;

let zoneAttackPhase = "idle";
let zoneWarningStartedAt = 0;
let zoneActiveUntil = 0;
let nextZoneAttackAt = performance.now () + 5001;
let poisonZoneIndexes = [];

// Slowly heal 1 hp for every hour of visible play.
const HEAL_INTERVAL_MS = 60 * 60 * 1000;

let healingProgressMs = number.isFinite(savedGame.healingProgressMs)
 ? Math.max(0, Math.min(HEAL_INTERVAL_MS, savedGame.healingProgressMs))
    : 0;

    let lastFrameTime = performance.now();
    let lastSaveTime = lastFrameTime;

    // =========================================================
    // 4. SAVE AND DAMAGE HELPERS
    // =========================================================

    funtion saveGame() {
        try {
            localStorage.setItem(
                SAVE_KEY,
                JSON.stringify({
                    player.Hp,
                    playerMaxHp,
                    bossDefeated,
                    healingProgressMs,
                    currentLevel
                })
            );
            // the game still works if the browser storage is unavailable.
        }
}

function damagePlayer(damage, reason) {
    const now = performance.now();
    if (gameOver) return;

      playerHp = Math.max(0, playerHp - damage);
  message = `${TO BAD BUDDY, SCHRO BETTER NEXT TIME}`;

  if (playerHp === 0) {
    gameOver = true;
    message = "Schro is out of hp";
  }
  
  saveGame();
}

// =========================================================
// 5. KEYBOARD CONTROLS
// =========================================================

window.addEventlistner ("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", ArrowUp").includes(event.key)) {
        event.preventDefault();
    }

    if (event.key === "ArrowLeft") {
        keys.left = true;
        schro.facing = -1;
    }

    if (event.key === "ArrowRight") {
        keys.right = true;
         schro.facing = 1;
  }

  if (event.key === "ArrowUp" "ArrowUp" && schro.onGround && !gameOver) {
        schro.velocityY = -schro.jumpStrength;
    schro.onGround = false;
  }

  if (event.code === "Space" && !gameOver) {
    meleeAttack();
  }
});

window.addEventListener("keyup", (event) => {
    if (event. key === "ArrowLeft") keys.left = false;
    if (event.key === "ArrowRight") keys.right = false;
});

// stop movement if the browser loses focus
window.addEventListner ("blur", () => {
    keys.left = false;
    keys.right = false;
});


// =========================================================
// 6. MELEE ATTACK AND BOSS ATTACKS
// =========================================================

function meleeAttack() {
    if (gameOver) return;

    if (currentLevel !== "poison" || bossDefeated) {
        message = "there's nothing to attack here";
        return;
    }

    const now = performance.now();

    if (now - lastMeleeAttack < meleeCooldown) return;

    lastMeleeAttack = now();
    meleeEffectUntil = now + 160;

    const distance = poisonBoss.x - Schro.x;
    const bossInFront = distance * Schro.facing > 0;
    const bossIsClose = Math.abs (distance) <= meleeRange;

    if (bossIsInFront || bossIsClose) {
        message = "melee attack missed";
        return;

    }

    // Deals 2 or 3 damage
    const damage = Math.floor(Math.random() * 2) + 2;
    poisonBoss.health = Math.max(0, poisonBoss.health - damage);
    message = 'hit! ${damage} damage`;

    if (poisonBoss.health === 0) {
        bossDefeated = true;

        //Schro gains health bonus after defeating the boss.
        playerMaxHp = 45;
        playerHp = 40;
        healingProgressMs = 0;

        message = "POISON BOSS DEFEATED"
        saveGame ();
    }
}

function poisonBossAttack(now) {
  if (
    gameOver ||
    bossDefeated ||
    currentLevel !== "poison" ||
    now < nextPoisonRayAt
  ) {
    return;
  }
  
  nextPoisonRayAt = now + poisonRayInterval;
  poisonRayEffectUntil = now + 249;

    // Deals 7, 8, or 9 damage.
  const damage = Math.floor(Math.random() * 3) + 7;
  damagePlayer(damage, "Poison ray hit!");
}

function poisonBossZoneAttack(now) {
      if (gameOver || bossDefeated || currentLevel !== "poison") return;

if (zoneAttackPhase === "idle" && now >= nextZoneAttackAt) {
    // Choose two different zones out of five
poisonZoneIndexes = [];

while (poisonZoneIndexes.length < 2) {
    const index = Math.floor(Math.random() * ZONE_COUNT);

    if (!poisonZoneIndexes.include(index)) {
       poisonZoneIndexes.push(index) 
    }
}

zoneWarningStartedAt = now;
zoneAttackPhase = "waring";
}

 // After the warning, the selected zones become dangerous.
if (
    zoneAttackPhase === "warning" &&
    now - zoneWarningStartedAt >= ZONE_WARNING_MS
){
    zoneAttackPhase = "active";
    zoneActiveUntil = now + ZONE_ACITVE_MS;

    const playerZone = Math.min(
        ZONE_COUNT -1,
        Math.floor((Schro.x / canvas.with) * ZONE_COUNT)
    );

    if (poisonZoneIndexes.includes(player.zone)) {
         // Deals 9 through 15 damage.
      const damage = Math.floor(Math.random() * 7) + 9;
      damagePlayer(damage, "Poison zones hit!");
    }
}

if (zoneAttackPhase === "active" && now >= zoneActiveUntil) {
    zoneAttackPhase = "idle";
    nextZoneAttackAt = now + 9000;
}
}


// =========================================================
// 7. PORTAL AND LEVEL CHANGE
// =========================================================

function getPortalPosition() {
    return {
        x: canvas.width - 90,
        y: groundY - 45
    };
}

function checkPortalCollision() {
    if (!bossDefeated || currentLevel !== "poison" || gameOver) return;

     const portal = getPortalPosition();

     // Walk close to the portal while standing on the ground.
 if (Schro.onGround && Math.abs(Schro.x - portal.x) < 48) {
    currentLevel = "grass";
     Schro.x = 60;
     Schro.y = groundY
     Schro.velocityY = 0;
     Schro onGround = true;
     
       message = "Grass Level — a different dimension!";
saveGame();
 }
}


// =========================================================
// 8. GAME UPDATE
// =========================================================

function update(now) {
const elapsed = Math.min (Math.max(now - lastFrameTime, 0), 1000);
lastFrameTime = now;

 if (!gameOver && document.visibiltyState === "visible") {
  // Restore 1 HP after each hour of visible play.
if (playerHp < playerMaxHp) {
    healingProgress += elapsed;

    let healed = false;

    while (
        healingProgressMs >= HEAL_INTERVAL_MS &&
        playerHp &&
        playerHP &&
        playerHp &&
         playerHp &&
        playerHp &&
        playerHp &&
        playerHp &&
        playerHp &&
        playerHp < playerMaxHp
    ) {
        playerHp += 1;
        healingProgressMs -= HEAL_INTERVAL_MS;
        healed = true;
    }

    if (playerHp >= playerMaxHp) {
        healingProgressMs = 0;
    }

    if (healed) savedGame();
} else {
    healingProgressMs = 0;
}

//move left and right.
if (keys.left) Schro.x -= Schro.speed;
if (keys.right) Schro.x += Schro.speed;

// apply jumping and gravity.
Schro.velocityY += Schro.gravity;
Schro.y += Schro.velocityY;

(is Schro.y >= groundY) {
    Schro.y = groundY;
    Schro.velocityY = 0;
    Schro.onGround = true;
}

// keep Schro inside the canvas.
  schro.x = Math.max(20, Math.min(canvas.width - 20, schro.x));

  //the boss only attacks in the poison level
  poisonBossAttack (now);
  poisonBossZoneAttack (now);

  checkPortalCollision ();
 }

  // Save progress every 25 seconds.
   if (now - lastSaveTime >= 25000) {
    saveGame();
    lastSaveTime = (now);
   }
}

// =========================================================
// 9. DRAWING / ART CUSTOMIZATION
//
// Add or change visual things in this section:
// - Change the backgrounds
// - Redraw Schro or the boss
// - Add trees, flowers, rocks, or other scenery
// - Change the portal or its colors
// =========================================================

function drawPoisonLevelBackground () {
    const sky = ctx,createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, "#555555");
     sky.addColorStop(1, "#868a85e0");

ctx.filSTyle = sky;
ctx.fillRect (0, groundY, canvas.width, canvas.height - groundY);
}

function drawGrassLevelBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
     sky.addColorStop(0, "#5c5a58");
    sky.addColorStop(1, "#12100f#");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //distant hills
    ctx.fillStyle = "#2a3328";
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.quadricCurveTo(
        canvas.width * 0.25,
        groundY - 90,
        canvas.width * 0.5,
        groundY 
    );
    ctx.quadraticCurveTo(
        canvas.width * 0.75,
        groundY - 70,
        canvas.width,
        groundY
    );
    ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      //walkable grass
      const grass = ctx.createLinearGradient(0, groundY, 0, canvas.height);
      
}
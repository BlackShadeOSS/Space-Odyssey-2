const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const inventoryCanvas = document.getElementById("inventory");
const ctxInventory = inventoryCanvas.getContext("2d");
const withcanvas = document.querySelector(".withcanvas")[0];
const progressbar = document.querySelector(".progressBar");
var retro = new FontFace("retro", "url(Others/RetroGaming.woff2)");

retro.load().then(function (font) {
    // with canvas, if this is ommited won't work
    document.fonts.add(font);

    console.log("Font loaded");
});

var textures = {
    pressEnter: new Image(),
    rocket: new Image(),
    rocketWithWeaponPack: new Image(),
    rock: new Image(),
    missle: new Image(),
    weaponPackItem: new Image(),
    bullet: new Image(),
    boss: new Image(),
    h2Canister: new Image(),
};
{
    textures.pressEnter.src = "./Photos/pressEnter.png";
    textures.rocket.src = "./Photos/rocket.png";
    textures.rocketWithWeaponPack.src = "./Photos/rocket-with-weapon.png";
    textures.rock.src = "./Photos/rock.png";
    textures.missle.src = "./Photos/missle.png";
    textures.weaponPackItem.src = "./Photos/weapon-pack.png";
    textures.bullet.src = "./Photos/bullet.png";
    textures.boss.src = "./Photos/boss.png";
    textures.h2Canister.src = "./Photos/h2canister.png";
}
var texturesLoaded = false;
var tutorialTextures = {
    before: new Image(),
    neutral: new Image(),
    left: new Image(),
    right: new Image(),
    shiftLeft: new Image(),
    shiftRight: new Image(),
    ready: new Image(),
};
{
    tutorialTextures.before.src = "./Photos/tutorial-L-R/frame-BEFORE.png";
    tutorialTextures.neutral.src = "./Photos/tutorial-L-R/frame-N.png";
    tutorialTextures.left.src = "./Photos/tutorial-L-R/frame-L.png";
    tutorialTextures.right.src = "./Photos/tutorial-L-R/frame-R.png";
    tutorialTextures.shiftLeft.src = "./Photos/tutorial-L-R/frame-NL.png";
    tutorialTextures.shiftRight.src = "./Photos/tutorial-L-R/frame-NR.png";
    tutorialTextures.ready.src = "./Photos/tutorial-L-R/frame-READY.png";
}
{
    var tutorialTexturesLoaded = false;
    var keysActive;
    var game;
    var tutorial;
    var inventory;
    var stopwatch;
    var levelWatch;
    var levelProgressBar;
}
document.addEventListener("DOMContentLoaded", () => {
    // Set canvas size to 80% window size
    canvas.width = window.innerWidth * 0.725;
    canvas.height = window.innerHeight * 0.8;
    inventoryCanvas.width = window.innerWidth * 0.125;
    inventoryCanvas.height = window.innerHeight * 0.8;
    if (window.innerWidth < 1200) {
        canvas.style.visibility = "hidden";
        progressbar.style.display = "none";
        const h1 = document.createElement("h1");
        h1.innerHTML = "Please open this page on a bigger screen";
        h1.className = "warningSign";
        document.body.appendChild(h1);
    }

    stopwatch = document.getElementById("stopwatch");
    levelWatch = document.getElementById("level");
    levelProgressBar = document.getElementsByClassName("rocketInPB")[0];
});

tutorialTextures.ready.addEventListener("load", () => {
    tutorialTexturesLoaded = true;
});

textures.rock.addEventListener("load", () => {
    texturesLoaded = true;
    // render press enter for 1 second then clear for 1 second and repeat
    this.originalWidth = textures.pressEnter.width / 1.25;
    this.originalHeight = textures.pressEnter.height / 1.25;
    var pressEnterInterval = setInterval(() => {
        if (tutorial) {
            clearInterval(pressEnterInterval);
            return;
        }
        ctx.drawImage(
            textures.pressEnter,
            canvas.width / 2 - this.originalWidth / 2,
            canvas.height / 2 - this.originalHeight / 2,
            this.originalWidth,
            this.originalHeight
        );
        setTimeout(() => {
            if (tutorial) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 750);
    }, 1500);
    askForNickname();
});

var nickname = "";

function askForNickname() {
    if (document.getElementById("nicknameScreen")) {
        document.body.removeChild(document.getElementById("nicknameScreen"));
    }
    if (checkCookie("nickname") && getCookie("nickname") != "") {
        nickname = getCookie("nickname");
    } else {
        var nicknameScreen = document.createElement("div");
        nicknameScreen.id = "nicknameScreen";
        nicknameScreen.innerHTML = `
    <div id="nicknameScreenContent">
        <h1>Enter your nickname</h1>
        <input type="text" id="nicknameInput" placeholder="Nickname" maxlength="15">
        <br>
        <button id="nicknameButton">Submit</button>
    </div>
    `;
        document.body.appendChild(nicknameScreen);
        document
            .getElementById("nicknameButton")
            .addEventListener("click", () => {
                if (document.getElementById("nicknameInput").value == "") {
                    return;
                }
                nickname = document.getElementById("nicknameInput").value;
                setCookie("nickname", nickname, 365);
                document.body.removeChild(nicknameScreen);
            });
    }
}

window.addEventListener("keydown", (e) => {
    if (
        e.key == "Enter" &&
        !game &&
        document.getElementById("nicknameScreen") == null
    ) {
        if (tutorialTexturesLoaded && !tutorial) {
            tutorial = new Tutorial();
            tutorial.moveGif();
        }
    }
    if (e.key == "Enter" && tutorial && tutorial.readyToSkip && !game) {
        tutorial.skipTutorial = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        inventory = new Inventory();
        game = new Game();
        game.newGame();
    }
});

class Rocket {
    constructor() {
        this.rocketTexture = textures.rocket;
        this.originalWidth = this.rocketTexture.width;
        this.originalHeight = this.rocketTexture.height;
        this.width = this.originalWidth / 8;
        this.height = this.originalHeight / 8;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - (this.height + 25);
        this.addMovementListeners();
        this.xVelocity = 0;
        this.friction = 0.85;
        this.hasWeaponPack = false;
        this.lastTimeFireMissle = 0;
        this.amunitionMissle = 4;
        this.maxAmunitionMissle = 4;
        this.reloadingMissle = false;
        this.lastTimeFireBullet = 0;
        this.amunitionBullet = 50;
        this.maxAmunitionBullet = 50;
        this.reloadingBullet = false;
        this.health = 100;
        this.maxHealth = 100;
        keysActive = [];
    }

    addMovementListeners() {
        window.addEventListener("keydown", (e) => {
            var key = e.key.toLowerCase();
            if (!keysActive.includes(key)) keysActive.push(key);
        });
        window.addEventListener("keyup", (e) => {
            var key = e.key.toLowerCase();
            if (keysActive.includes(key))
                keysActive.splice(keysActive.indexOf(key), 1);
        });
    }

    draw() {
        ctx.drawImage(
            this.rocketTexture,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }

    fireMissle() {
        if (this.hasWeaponPack) {
            if (Date.now() - this.lastTimeFireMissle > 500) {
                if (this.amunitionMissle <= 1) {
                    if (this.reloadingMissle) return;
                    if (this.amunitionMissle <= 0) return;
                    this.lastTimeFireMissle = Date.now();
                    this.amunitionMissle--;
                    game.missles.push(new Missle());
                    this.reloadMissle();
                    return;
                } else {
                    this.lastTimeFireMissle = Date.now();
                    this.amunitionMissle--;
                    game.missles.push(new Missle());
                }
            }
        }
    }

    reloadMissle() {
        if (this.reloadingMissle) return;
        setTimeout(() => {
            this.amunitionMissle = this.maxAmunitionMissle;
            this.reloadingMissle = false;
        }, 2500);
        this.reloadingMissle = true;
    }

    checkIfFireWeapon() {
        if (
            (keysActive.includes("w") &&
                !this.reloadingMissle &&
                keysActive.includes("shift")) ||
            (keysActive.includes("arrowup") &&
                !this.reloadingMissle &&
                keysActive.includes("shift"))
        ) {
            if (this.hasWeaponPack) {
                this.fireMissle();
            }
        } else if (
            (keysActive.includes("w") && !this.reloadingBullet) ||
            (keysActive.includes("arrowup") && !this.reloadingBullet)
        ) {
            if (this.hasWeaponPack) {
                this.fireBullet();
            }
        }
    }

    fireBullet() {
        if (this.hasWeaponPack) {
            if (Date.now() - this.lastTimeFireBullet > 75) {
                if (this.amunitionBullet <= 1) {
                    if (this.reloadingBullet) return;
                    if (this.amunitionBullet <= 0) return;
                    this.lastTimeFireBullet = Date.now();
                    this.amunitionBullet--;
                    game.bullets.push(new Bullet());
                    this.reloadBullet();
                    return;
                } else {
                    this.lastTimeFireBullet = Date.now();
                    this.amunitionBullet--;
                    game.bullets.push(new Bullet());
                }
            }
        }
    }

    reloadBullet() {
        if (this.reloadingBullet) return;
        setTimeout(() => {
            this.amunitionBullet = this.maxAmunitionBullet;
            this.reloadingBullet = false;
        }, 1500);
        this.reloadingBullet = true;
    }

    moveUpdate() {
        {
            if (
                keysActive.includes("shift") &&
                (keysActive.includes("d") || keysActive.includes("arrowright"))
            ) {
                this.xVelocity = 3.5;
            } else if (
                keysActive.includes("shift") &&
                (keysActive.includes("a") || keysActive.includes("arrowleft"))
            ) {
                this.xVelocity = -3.5;
            } else if (
                keysActive.includes("d") ||
                keysActive.includes("arrowright")
            ) {
                this.xVelocity = 2;
            } else if (
                keysActive.includes("a") ||
                keysActive.includes("arrowleft")
            ) {
                this.xVelocity = -2;
            } else {
                this.xVelocity *= this.friction;
            }
        }
        {
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width - this.width)
                this.x = canvas.width - this.width;
            else this.x += (this.xVelocity * game.deltaTime) / 5;
        }
    }

    weaponPackUpgrade() {
        if (game.timeOnThisLevel > 5000) {
            this.rocketTexture = textures.rocketWithWeaponPack;
            this.hasWeaponPack = true;
        }
    }
}

class Rock {
    constructor(n = 2) {
        this.rockTexture = textures.rock;
        this.originalWidth = this.rockTexture.width;
        this.originalHeight = this.rockTexture.height;
        this.width = this.originalWidth / 8;
        this.height = this.originalHeight / 8;
        this.x = Math.floor(Math.random() * (canvas.width - this.width));
        this.y = -(this.height + 10 * n);
        this.yVelocity = n;
    }
    draw() {
        ctx.drawImage(
            this.rockTexture,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }

    move() {
        this.y += (this.yVelocity * game.deltaTime) / 7.5;
    }

    checkCollision() {
        // check if rocket is hit by rock
        // hitbox is 3/4 in width and 1/2 in height of the rock and is in the middle of the rock
        if (
            game.rocket.x + game.rocket.width / 4 <
                this.x + this.width / 4 + this.width / 2 &&
            game.rocket.x + game.rocket.width / 4 + this.width / 2 >
                this.x + this.width / 4 &&
            game.rocket.y + game.rocket.height / 2 <
                this.y + this.height / 2 + this.height / 2 &&
            game.rocket.y + game.rocket.height / 2 + this.height / 2 >
                this.y + this.height / 2
        ) {
            game.rocket.health = 0;
            inventory.render();
            game.stop = true;
            game.endGame();
        }
    }

    checkIfOutOfScreen() {
        if (this.y >= canvas.height) {
            return true;
        } else return false;
    }
}

class Game {
    constructor() {
        this.rocket;
        this.boss;
        this.rocks;
        this.meteors;
        this.missles;
        this.bullets;
        this.weaponPackItem;
        this.time = 0;
        this.rockInterval;
        this.timeOnThisLevel = 0;
        this.lastTime = Date.now();
        this.deltaTime;
        this.levelProgress = 0;
        this.fps;
        this.levels;
        this.stop = false;
        this.godmode = false;
        this.nickname = nickname;
        this.items = [];
        this.fallingItems = [];
        this.lastTimeSpawnItem = Date.now();
    }

    addResizeListener() {
        // chech if window size is changed
        window.addEventListener("resize", function () {
            // chech if div with warning message exists
            if (!document.querySelector(".warningSign")) {
                const div = document.createElement("div");
                const h1 =
                    "Please refresh the page to have the best playing experience";
                div.innerHTML =
                    h1 + "<br>" + "(click on the text to ignore this message)";
                div.className = "warningSign";
                document.body.appendChild(div);
            }
            // delete the message if clicked on it
            document
                .querySelector(".warningSign")
                .addEventListener("click", function () {
                    if (document.querySelector(".warningSign"))
                        document.querySelector(".warningSign").remove();
                });
        });
    }

    resetListener() {
        // reset game if letter "r" is pressed
        window.addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() == "r") {
                this.restart();
            }
        });
    }

    showTime() {
        // show time on stopwatch
        stopwatch.innerHTML =
            `Time Elapsed: ` +
            Math.floor(this.time / 60000)
                .toString()
                .padStart(2, "0") +
            `:` +
            (Math.floor(this.time / 1000) - Math.floor(this.time / 60000) * 60)
                .toString()
                .padStart(2, "0");
    }

    restart() {
        // remove warning message
        if (document.querySelector(".warningSign"))
            document.querySelector(".warningSign").remove();

        // remove game over message
        if (document.querySelector("#gameOverScreen"))
            document.querySelector("#gameOverScreen").remove();
        clearInterval(game.rockInterval);
        game.stop = false;
        game.rocks = [];
        game.meteors = [];
        game.bullets = [];
        game.boss = null;
        game.time = 0;
        game.rocket = new Rocket();
        game.weaponPackItem = [];
        game.missles = [];
        game.levelProgress = 0;
        game.timeOnThisLevel = 0;
        game.deltaTime = Date.now();
        game.lastTime = Date.now();
        game.levels = new Levels();
        game.fallingItems = [];
        game.items = [];
        game.godmode = false;
        game.lastTimeSpawnItem = Date.now();
        game.rocket.rocketTexture = textures.rocket;
        game.render();
    }

    updateProgressBar() {
        // update progress bar
        if (66 - (this.levelProgress / 100) * 66 < 0) {
            levelProgressBar.style.top = 0 + "vh";
        } else
            levelProgressBar.style.top =
                66 - (this.levelProgress / 100) * 66 + "vh";
    }

    showLevel() {
        // show level
        levelWatch.innerHTML = `Level: ${this.levels.levelNumber}`;
    }

    resetArrays() {
        game.rocks = [];
        game.meteors = [];
        game.missles = [];
        game.bullets = [];
        game.weaponPackItem = [];
        game.items = [];
        game.fallingItems = [];
    }

    newGame() {
        // add resize listener
        this.addResizeListener();

        // add reset listener
        this.resetListener();

        // create rocket
        this.rocket = new Rocket();

        //create level
        this.levels = new Levels();

        // create weapon pack item
        this.weaponPackItems = [];

        // start render loop
        this.render();
    }

    render() {
        // calcutate delta time
        game.deltaTime = Date.now() - game.lastTime;
        game.lastTime = Date.now();

        //add detla time to time
        game.time += game.deltaTime;

        // add time on this level
        game.timeOnThisLevel += game.deltaTime;
        // show time
        game.showTime();

        // show level
        game.showLevel();

        // update progress bar
        game.updateProgressBar();

        // render inventory
        inventory.render();

        // caltuclate fps
        game.fps = 1 / game.deltaTime;

        // move rocket
        game.rocket.moveUpdate();

        // check if rocket fired missle
        game.rocket.checkIfFireWeapon();

        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw rocket
        game.rocket.draw();

        // draw rocks
        game.rocks.forEach(function (rock) {
            rock.move();
            rock.draw();
            if (game.godmode == false) rock.checkCollision();
            if (rock.checkIfOutOfScreen()) {
                game.rocks.splice(game.rocks.indexOf(rock), 1);
            }
        }, game);

        // draw missles
        game.missles.forEach(function (missle) {
            missle.move();
            missle.checkCollision();
            missle.draw();
            if (missle.checkIfOutOfScreen()) {
                game.missles.splice(game.missles.indexOf(missle), 1);
            }
        }, game);

        // draw bullets
        game.bullets.forEach(function (bullet) {
            bullet.move();
            bullet.checkCollision();
            bullet.draw();
            if (bullet.checkIfOutOfScreen()) {
                game.bullets.splice(game.bullets.indexOf(bullet), 1);
            }
        }, game);

        // draw weapon pack item
        game.weaponPackItems.forEach(function (item) {
            item.move();
            item.checkCollision();
            item.draw();
            if (item.checkIfOutOfScreen()) {
                game.weaponPackItems.splice(
                    game.weaponPackItems.indexOf(item),
                    1
                );
            }
        }, game);

        // draw boss
        if (game.boss != null) {
            game.boss.move();
            game.boss.draw();
            game.boss.checkCollision();
            game.boss.checkIfDead();
        }

        // Spawn weapon pack item after 1.5 minutes on level 1 if there is no weapon pack item on the screen and if the rocket doesn't have a weapon pack item yet
        if (
            game.timeOnThisLevel > 90000 &&
            game.weaponPackItems.length == 0 &&
            game.rocket.hasWeaponPack == false &&
            game.levels.levelNumber == 1
        ) {
            game.weaponPackItems.push(new WeaponPackItem());
        }
        // Update level progress
        game.levelProgress = Math.floor(
            (game.timeOnThisLevel / game.levels.levelTime) * 100
        );
        // spawn boss
        if (
            game.timeOnThisLevel > game.levels.levelTime &&
            game.levels.bossKilled == false
        ) {
            if (game.boss == null && game.levels.bossNumber != null) {
                game.boss = new Boss();
            }
        }

        // render falling items
        game.fallingItems.forEach(function (item) {
            item.move();
            item.draw();
            item.checkCollision();
            if (item.checkIfOutOfScreen()) {
                game.fallingItems.splice(game.fallingItems.indexOf(item), 1);
            }
        }, game);

        // spawn random item every 1 minute
        if (Date.now() - game.lastTimeSpawnItem > 60000 * 2) {
            game.randomItem();
            game.lastTimeSpawnItem = Date.now();
        }

        // call render function again
        if (!game.stop) requestAnimationFrame(game.render);
    }

    endGame() {
        if (document.getElementById("gameOverScreen")) {
            document.body.removeChild(
                document.getElementById("gameOverScreen")
            );
        }
        var gameOverScreen = document.createElement("div");
        gameOverScreen.id = "gameOverScreen";
        gameOverScreen.innerHTML = `
        <div id="gameOverScreenContent">
            <h1>Game Over</h1>
            <h2>Level: ${game.levels.levelNumber}</h2>
            <h2>Time: ${
                Math.floor(this.time / 60000).toString() +
                ` minutes ` +
                (
                    Math.floor(this.time / 1000) -
                    Math.floor(this.time / 60000) * 60
                ).toString() +
                ` seconds`
            } </h2>
            <button id="restartButton">Restart</button>
        </div>
        `;
        document.body.appendChild(gameOverScreen);
        game.saveTime();
        document
            .getElementById("restartButton")
            .addEventListener("click", () => {
                game.restart();
            });
    }

    winGame() {
        if (document.getElementById("gameOverScreen")) {
            document.body.removeChild(
                document.getElementById("gameOverScreen")
            );
        }
        var gameOverScreen = document.createElement("div");
        gameOverScreen.id = "gameOverScreen";
        gameOverScreen.innerHTML = `
        <div id="gameOverScreenContent">
            <h1>You Win</h1>
            <h2>Level: ${game.levels.levelNumber}</h2>
            <h2>Time: ${
                Math.floor(this.time / 60000).toString() +
                ` minutes ` +
                (
                    Math.floor(this.time / 1000) -
                    Math.floor(this.time / 60000) * 60
                ).toString() +
                ` seconds`
            } </h2>
            <button id="restartButton">Restart</button>
            <button id="endless">Endless</button>
        </div>
        `;
        document.body.appendChild(gameOverScreen);
        game.saveTime();
        document
            .getElementById("restartButton")
            .addEventListener("click", () => {
                game.restart();
            });
        document.getElementById("endless").addEventListener("click", () => {
            game.stop = false;
            game.render();
            document.body.removeChild(gameOverScreen);
            game.levels.setLevel(6);
        });
    }

    saveTime() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://drukara.ddns.net:4000/game_data", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(
            JSON.stringify({
                nickname: game.nickname,
                level: game.levels.levelNumber,
                time: game.time,
            })
        );
    }

    pauseBetweenLevels() {
        if (document.getElementById("pauseScreen")) {
            document.body.removeChild(document.getElementById("pauseScreen"));
        }
        var pauseScreen = document.createElement("div");
        game.stop = true;
        pauseScreen.id = "pauseScreen";
        pauseScreen.innerHTML = `
        <div id="pauseScreenContent">
            <h1>Level ${game.levels.levelNumber} completed</h1>
            <h2>Time: ${
                Math.floor(this.time / 60000).toString() +
                ` minutes ` +
                (
                    Math.floor(this.time / 1000) -
                    Math.floor(this.time / 60000) * 60
                ).toString() +
                ` seconds`
            } </h2>
            <button id="nextLevelButton">Next Level</button>
        </div>
        `;
        document.body.appendChild(pauseScreen);
        document
            .getElementById("nextLevelButton")
            .addEventListener("click", () => {
                game.resetArrays();
                game.levels.setLevel(game.levels.levelNumber + 1);
                document.body.removeChild(pauseScreen);
                game.stop = false;
                game.Boss = null;
                game.rocket.x = canvas.width / 2 - game.rocket.width / 2;
                game.render();
            });
    }

    randomItem() {
        if (Math.floor(Math.random() * 100) < 15) {
            // 15% chance for each item to spawn
            // switch (Math.floor(Math.random() * 6)) {
            //     case 0:
            //         this.fallingItems.push(new h2CanisterPowerUp());
            //         break;
            //     case 1:
            //         break;
            //     case 2:
            //         break;
            //     case 3:
            //         break;
            //     case 4:
            //         break;
            //     case 5:
            //         break;
            // }
            this.fallingItems.push(new h2CanisterPowerUp());
        }
    }
}

//dorobić
class Tutorial {
    constructor() {
        this.readyToSkip = false;
        this.skipTutorial = false;
    }
    gifEngine(array) {
        array.forEach((item) => {
            setTimeout(() => {
                if (this.skipTutorial) return;
                ctx.drawImage(
                    item[0],
                    canvas.width / 2 - item[0].width / 2,
                    canvas.height / 2 - item[0].height / 2
                );
            }, this.time);
            this.time += item[1];
        });
    }
    moveGif() {
        this.time = 0;
        this.basicTutorial = [
            [tutorialTextures.before, 3000],
            [tutorialTextures.neutral, 750],
            [tutorialTextures.left, 750],
            [tutorialTextures.neutral, 750],
            [tutorialTextures.right, 750],
            [tutorialTextures.neutral, 750],
            [tutorialTextures.shiftLeft, 750],
            [tutorialTextures.neutral, 750],
            [tutorialTextures.shiftRight, 750],
            [tutorialTextures.neutral, 750],
            [tutorialTextures.ready, 1250],
        ];

        this.gifEngine(this.basicTutorial);

        setTimeout(() => {
            this.readyToSkip = true;
        }, 100);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            game = new Game();
            game.newGame();
        }, this.time);
    }
}

class WeaponPackItem {
    constructor() {
        this.weaponPackItemTexture = textures.weaponPackItem;
        this.originalWidth = this.weaponPackItemTexture.width;
        this.originalHeight = this.weaponPackItemTexture.height;
        this.width = this.originalWidth / 2;
        this.height = this.originalHeight / 2;
        this.x = Math.floor(Math.random() * (canvas.width - this.width));
        this.y = 0;
        this.yVelocity = 2;
    }
    draw() {
        ctx.drawImage(
            this.weaponPackItemTexture,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
    move() {
        this.y += (this.yVelocity * game.deltaTime) / 7.5;
    }
    checkCollision() {
        if (
            game.rocket.x < this.x + this.width &&
            game.rocket.x + game.rocket.width > this.x &&
            game.rocket.y < this.y + this.height &&
            game.rocket.y + game.rocket.height > this.y
        ) {
            game.rocket.weaponPackUpgrade();
            game.weaponPackItems.splice(game.weaponPackItems.indexOf(this), 1);
        }
    }
    checkIfOutOfScreen() {
        if (this.y > canvas.height) {
            return true;
        }
    }
}

class Missle {
    constructor() {
        this.missleTexture = textures.missle;
        this.originalWidth = this.missleTexture.width;
        this.originalHeight = this.missleTexture.height;
        this.width = this.originalWidth / 8;
        this.height = this.originalHeight / 8;
        this.x = game.rocket.x + game.rocket.width / 2 - this.width / 2;
        this.y = game.rocket.y - this.height;
        this.yVelocity = 12.5;
    }
    draw() {
        ctx.drawImage(
            this.missleTexture,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
    move() {
        this.y -= (this.yVelocity * game.deltaTime) / 7.5;
    }
    checkCollision() {
        //check collision with rocks
        for (let i = 0; i < game.rocks.length; i++) {
            if (
                game.rocks[i].x < this.x + this.width &&
                game.rocks[i].x + game.rocks[i].width > this.x &&
                game.rocks[i].y < this.y + this.height &&
                game.rocks[i].y + game.rocks[i].height > this.y
            ) {
                game.rocks.splice(i, 1);
                game.missles.splice(game.missles.indexOf(this), 1);
            }
        }
    }
    checkIfOutOfScreen() {
        if (this.y < 0 - this.height) {
            return true;
        }
    }
}

class Bullet {
    constructor() {
        this.bulletTexture = textures.bullet;
        this.originalWidth = this.bulletTexture.width;
        this.originalHeight = this.bulletTexture.height;
        this.width = this.originalWidth / 30;
        this.height = this.originalHeight / 30;
        this.x = game.rocket.x + game.rocket.width / 2 - this.width / 2;
        this.y = game.rocket.y - this.height;
        this.yVelocity = 10;
    }
    draw() {
        ctx.drawImage(
            this.bulletTexture,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
    move() {
        this.y -= (this.yVelocity * game.deltaTime) / 7.5;
    }
    checkCollision() {
        //check collision with rocks
        for (let i = 0; i < game.rocks.length; i++) {
            if (
                game.rocks[i].x < this.x + this.width &&
                game.rocks[i].x + game.rocks[i].width > this.x &&
                game.rocks[i].y < this.y + this.height &&
                game.rocks[i].y + game.rocks[i].height > this.y
            ) {
                game.bullets.splice(game.bullets.indexOf(this), 1);
            }
        }
    }
    checkIfOutOfScreen() {
        if (this.y < 0 - this.height) {
            return true;
        }
    }
}

class Levels {
    constructor() {
        this.levelTime;
        this.levelNumber;
        this.bossNumber;
        this.rockIntervalTime;
        this.rockSpeed;
        this.bossHealth;
        this.bossKilled = false;
        this.setLevel(1);
    }
    setLevel(number = 1) {
        switch (number) {
            case 1:
                this.level1();
                break;
            case 2:
                this.level2();
                break;
            case 3:
                this.level3();
                break;
            case 4:
                this.level4();
                break;
            case 5:
                this.level5();
                break;
            case 6:
                this.level6();
                break;
        }
    }
    level1() {
        this.levelTime = 180000;
        this.rockIntervalTime = 750;
        this.rockSpeed = 2;
        this.levelNumber = 1;
        this.bossNumber = 1;
        this.bossHealth = 1000;
        game.resetArrays();
        clearInterval(game.rockInterval);
        game.rockInterval = setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 500)
                if (!game.stop) game.rocks.push(new Rock(this.rockSpeed));
        }, this.rockIntervalTime);
        game.timeOnThisLevel = 0;
        setTimeout(() => {
            this.bossKilled = false;
        }, 1000);
    }
    level2() {
        this.levelTime = 300000;
        this.rockIntervalTime = 500;
        this.rockSpeed = 3;
        this.levelNumber = 2;
        this.bossNumber = 2;
        this.bossHealth = 2500;
        game.resetArrays();
        clearInterval(game.rockInterval);
        game.rockInterval = setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 500)
                if (!game.stop) game.rocks.push(new Rock(this.rockSpeed));
        }, this.rockIntervalTime);
        game.timeOnThisLevel = 0;
        setTimeout(() => {
            this.bossKilled = false;
        }, 1000);
    }
    level3() {
        this.levelTime = 300000;
        this.rockIntervalTime = 400;
        this.rockSpeed = 4;
        this.levelNumber = 3;
        this.bossNumber = 3;
        this.bossHealth = 5000;
        game.resetArrays();
        clearInterval(game.rockInterval);
        game.rockInterval = setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 500)
                if (!game.stop) game.rocks.push(new Rock(this.rockSpeed));
        }, this.rockIntervalTime);
        game.timeOnThisLevel = 0;
        setTimeout(() => {
            this.bossKilled = false;
        }, 1000);
    }
    level4() {
        this.levelTime = 300000;
        this.rockIntervalTime = 350;
        this.rockSpeed = 5;
        this.levelNumber = 4;
        this.bossNumber = 4;
        this.bossHealth = 12500;
        game.resetArrays();
        clearInterval(game.rockInterval);
        game.rockInterval = setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 400)
                if (!game.stop) game.rocks.push(new Rock(this.rockSpeed));
        }, this.rockIntervalTime);
        game.timeOnThisLevel = 0;
        setTimeout(() => {
            this.bossKilled = false;
        }, 1000);
    }
    level5() {
        this.levelTime = 450000;
        this.rockIntervalTime = 300;
        this.rockSpeed = 6;
        this.levelNumber = 5;
        this.bossNumber = 5;
        this.bossHealth = 25000;
        game.resetArrays();
        clearInterval(game.rockInterval);
        game.rockInterval = setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 400)
                if (!game.stop) game.rocks.push(new Rock(this.rockSpeed));
        }, this.rockIntervalTime);
        game.timeOnThisLevel = 0;
        setTimeout(() => {
            this.bossKilled = false;
        }, 1000);
    }
    level6() {
        this.levelTime = 0;
        this.rockIntervalTime = 250;
        this.rockSpeed = 6.5;
        this.levelNumber = 6;
        this.bossNumber = null;
        this.bossHealth = null;
        game.resetArrays();
        clearInterval(game.rockInterval);
        game.rockInterval = setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 400)
                if (!game.stop) game.rocks.push(new Rock(this.rockSpeed));
        }, this.rockIntervalTime);
        game.timeOnThisLevel = 0;
        setTimeout(() => {
            this.bossKilled = true;
        }, 1000);
    }
}

class Boss {
    constructor() {
        this.bossTexture = textures.boss;
        this.originalWidth = this.bossTexture.width;
        this.originalHeight = this.bossTexture.height;
        this.width = this.originalWidth / 4;
        this.height = this.originalHeight / 4;
        this.width = 100;
        this.height = 100;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = 25 + this.height;
        this.xVelocity = 2;
        this.health = game.levels.bossHealth;
        this.maxHealth = this.health;
        clearInterval(game.rockInterval);
    }
    draw() {
        ctx.drawImage(
            this.bossTexture,
            this.x,
            this.y,
            this.width,
            this.height
        );

        // add health bar
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y - 20, this.width, 10);
        ctx.fillStyle = "green";
        ctx.fillRect(
            this.x,
            this.y - 20,
            (this.width * game.boss.health) / game.boss.maxHealth,
            10
        );
    }
    move() {
        // check if is touching the wall
        if (this.x + this.width > canvas.width) {
            this.xVelocity = -2;
        } else if (this.x < 0) {
            this.xVelocity = 2;
        }
        this.x += (this.xVelocity * game.deltaTime) / 7.5;
    }
    checkCollision() {
        //check collision with missles
        for (let i = 0; i < game.missles.length; i++) {
            if (
                game.missles[i].x < this.x + this.width &&
                game.missles[i].x + game.missles[i].width > this.x &&
                game.missles[i].y < this.y + this.height &&
                game.missles[i].y + game.missles[i].height > this.y
            ) {
                game.missles.splice(i, 1);
                this.health -= 250;
            }
        }
        //check collision with bullets
        for (let i = 0; i < game.bullets.length; i++) {
            if (
                game.bullets[i].x < this.x + this.width &&
                game.bullets[i].x + game.bullets[i].width > this.x &&
                game.bullets[i].y < this.y + this.height &&
                game.bullets[i].y + game.bullets[i].height > this.y
            ) {
                game.bullets.splice(i, 1);
                this.health -= 15;
            }
        }
    }
    checkIfDead() {
        if (this.health <= 0) {
            if (game.levels.levelNumber === 5) {
                game.stop = true;
                game.levels.bossKilled = true;
                game.boss = null;
                game.winGame();
                return;
            }
            game.levels.bossKilled = true;
            game.boss = null;
            game.pauseBetweenLevels();
        }
    }
}

class Inventory {
    constructor() {
        this.addListenerToItemSlot();
    }

    render() {
        // clear inventory canvas
        ctxInventory.clearRect(
            0,
            0,
            inventoryCanvas.width,
            inventoryCanvas.height
        );

        // show rocket health
        this.showRocketHealth();

        // show rocket weapon pack
        this.showRocketWeaponPack();

        // show bullet ammunition
        this.showBulletAmmunition();

        // show missle ammunition
        this.showMissleAmmunition();

        // render grid
        this.renderGrid();
    }

    // show rocket health using inventory canvas using numbers in RetroGaming font of size 3vh and bar
    showRocketHealth() {
        // show rocket health
        ctxInventory.font = "2vh retro";
        ctxInventory.fillStyle = "white";
        ctxInventory.fillText(
            `Health: ${
                game.rocket.health.toString() +
                `/` +
                game.rocket.maxHealth.toString()
            }`,
            inventoryCanvas.width * 0.05,
            inventoryCanvas.height * 0.15
        );
        // show rocket health bar
        ctxInventory.fillStyle = "red";
        ctxInventory.fillRect(
            inventoryCanvas.width * 0.05,
            inventoryCanvas.height * 0.175,
            inventoryCanvas.width * 0.9,
            inventoryCanvas.height * 0.025
        );

        ctxInventory.fillStyle = "green";
        ctxInventory.fillRect(
            inventoryCanvas.width * 0.05,
            inventoryCanvas.height * 0.175,
            (inventoryCanvas.width * 0.9 * game.rocket.health) /
                game.rocket.maxHealth,
            inventoryCanvas.height * 0.025
        );
    }

    // show rocket weapon pack
    showRocketWeaponPack() {
        // show rocket weapon pack
        ctxInventory.font = "1.45vh retro";
        ctxInventory.fillStyle = "white";
        ctxInventory.fillText(
            `Weapon Pack: ${game.rocket.hasWeaponPack ? "Installed" : "None"}`,
            inventoryCanvas.width * 0.05,
            inventoryCanvas.height * 0.3
        );
    }

    // show ammo using inventory
    showBulletAmmunition() {
        if (game.rocket.hasWeaponPack) {
            // show bullet ammunition
            ctxInventory.font = "1.75vh retro";
            ctxInventory.fillStyle = "white";
            if (game.rocket.reloadingBullet) {
                ctxInventory.fillText(
                    `Ammo: Reloading...`,
                    inventoryCanvas.width * 0.05,
                    inventoryCanvas.height * 0.35
                );
            } else {
                ctxInventory.fillText(
                    `Ammo: ${game.rocket.amunitionBullet.toString()}`,
                    inventoryCanvas.width * 0.05,
                    inventoryCanvas.height * 0.35
                );
            }
            // show bullet ammunition bar
            ctxInventory.fillStyle = "gray";
            ctxInventory.fillRect(
                inventoryCanvas.width * 0.05,
                inventoryCanvas.height * 0.375,
                inventoryCanvas.width * 0.9,
                inventoryCanvas.height * 0.025
            );

            ctxInventory.fillStyle = "yellow";
            ctxInventory.fillRect(
                inventoryCanvas.width * 0.05,
                inventoryCanvas.height * 0.375,
                (inventoryCanvas.width * 0.9 * game.rocket.amunitionBullet) /
                    game.rocket.maxAmunitionBullet,
                inventoryCanvas.height * 0.025
            );
        }
    }
    // show missle using inventory
    showMissleAmmunition() {
        if (game.rocket.hasWeaponPack) {
            // show missle ammunition
            ctxInventory.font = "1.75vh retro";
            ctxInventory.fillStyle = "white";
            if (game.rocket.reloadingMissle) {
                ctxInventory.fillText(
                    `Missle: Reloading...`,
                    inventoryCanvas.width * 0.05,
                    inventoryCanvas.height * 0.45
                );
            } else {
                ctxInventory.fillText(
                    `Missle: ${game.rocket.amunitionMissle.toString()}`,
                    inventoryCanvas.width * 0.05,
                    inventoryCanvas.height * 0.45
                );
            }
            // show missle ammunition bar
            ctxInventory.fillStyle = "gray";
            ctxInventory.fillRect(
                inventoryCanvas.width * 0.05,
                inventoryCanvas.height * 0.475,
                inventoryCanvas.width * 0.9,
                inventoryCanvas.height * 0.025
            );

            ctxInventory.fillStyle = "orange";
            ctxInventory.fillRect(
                inventoryCanvas.width * 0.05,
                inventoryCanvas.height * 0.475,
                (inventoryCanvas.width * 0.9 * game.rocket.amunitionMissle) /
                    game.rocket.maxAmunitionMissle,
                inventoryCanvas.height * 0.025
            );
        }
    }

    //render even grid of 3x3 grid with white border and dark gray backgrout im the inventory canvas with items in the grid from game.items array
    renderGrid() {
        // render name
        ctxInventory.font = "1.75vh retro";
        ctxInventory.fillStyle = "white";
        ctxInventory.fillText(
            `Inventory`,
            inventoryCanvas.width * 0.05,
            inventoryCanvas.height * 0.55
        );

        // render grid
        ctxInventory.fillStyle = "gray";
        ctxInventory.fillRect(
            inventoryCanvas.width * 0.05,
            inventoryCanvas.height * 0.6,
            inventoryCanvas.height * 0.275,
            inventoryCanvas.height * 0.275
        );

        // render grid border
        ctxInventory.strokeStyle = "white";
        ctxInventory.lineWidth = 5;
        ctxInventory.strokeRect(
            inventoryCanvas.width * 0.05,
            inventoryCanvas.height * 0.6,
            inventoryCanvas.height * 0.275,
            inventoryCanvas.height * 0.275
        );

        // render inside grid frame border in white
        ctxInventory.strokeStyle = "white";
        ctxInventory.lineWidth = 5;
        ctxInventory.strokeRect(
            inventoryCanvas.width * 0.05,
            inventoryCanvas.height * 0.6,
            (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3
        );
        ctxInventory.strokeRect(
            inventoryCanvas.width * 0.05 + (inventoryCanvas.height * 0.275) / 3,
            inventoryCanvas.height * 0.6,
            (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3
        );
        ctxInventory.strokeRect(
            inventoryCanvas.width * 0.05 +
                ((inventoryCanvas.height * 0.275) / 3) * 2,
            inventoryCanvas.height * 0.6,
            (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3
        );
        ctxInventory.strokeRect(
            inventoryCanvas.width * 0.05,
            inventoryCanvas.height * 0.6 + (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3
        );
        ctxInventory.strokeRect(
            inventoryCanvas.width * 0.05 + (inventoryCanvas.height * 0.275) / 3,
            inventoryCanvas.height * 0.6 + (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3
        );
        ctxInventory.strokeRect(
            inventoryCanvas.width * 0.05 +
                ((inventoryCanvas.height * 0.275) / 3) * 2,
            inventoryCanvas.height * 0.6 + (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3
        );
        ctxInventory.strokeRect(
            inventoryCanvas.width * 0.05,
            inventoryCanvas.height * 0.6 +
                ((inventoryCanvas.height * 0.275) / 3) * 2,
            (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3
        );
        ctxInventory.strokeRect(
            inventoryCanvas.width * 0.05 + (inventoryCanvas.height * 0.275) / 3,
            inventoryCanvas.height * 0.6 +
                ((inventoryCanvas.height * 0.275) / 3) * 2,
            (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3
        );
        ctxInventory.strokeRect(
            inventoryCanvas.width * 0.05 +
                ((inventoryCanvas.height * 0.275) / 3) * 2,
            inventoryCanvas.height * 0.6 +
                ((inventoryCanvas.height * 0.275) / 3) * 2,
            (inventoryCanvas.height * 0.275) / 3,
            (inventoryCanvas.height * 0.275) / 3
        );

        // add small number in the corner of the grid item
        ctxInventory.font = "2vh retro";
        ctxInventory.fillStyle = "white";
        // render grid items numbers using loop
        for (let i = 0; i < 9; i++) {
            ctxInventory.fillText(
                (i + 1).toString(),
                inventoryCanvas.width * 0.05 +
                    ((inventoryCanvas.height * 0.275) / 3) * (i % 3) +
                    5,
                inventoryCanvas.height * 0.6 +
                    ((inventoryCanvas.height * 0.275) / 3) * Math.floor(i / 3) +
                    inventoryCanvas.height * 0.0275
            );
        }

        // render grid items from game.items array in the grid
        for (let i = 0; i < game.items.length; i++) {
            ctxInventory.drawImage(
                game.items[i].texture,
                inventoryCanvas.width * 0.05 +
                    ((inventoryCanvas.height * 0.275) / 3) * (i % 3) +
                    5,
                inventoryCanvas.height * 0.6 +
                    ((inventoryCanvas.height * 0.275) / 3) * Math.floor(i / 3) +
                    5,
                (inventoryCanvas.height * 0.275) / 3 - 10,
                (inventoryCanvas.height * 0.275) / 3 - 10
            );
        }
    }

    // add keyboard number listener to item slot in the inventory
    addListenerToItemSlot() {
        document.addEventListener("keydown", (event) => {
            if (event.key >= 1 && event.key <= 9) {
                if (game.items[event.key - 1]) {
                    game.items[event.key - 1].use();
                    game.items.splice(event.key - 1, 1);
                }
            }
        });
    }
}

class h2CanisterPowerUp {
    constructor() {
        this.texture = textures.h2Canister;
        this.originalWidth = this.texture.width;
        this.originalHeight = this.texture.height;
        this.width = this.originalWidth / 8;
        this.height = this.originalHeight / 8;
        this.x = Math.floor(Math.random() * (canvas.width - this.width));
        this.y = -(this.height + 10 * game.levels.rockSpeed);
        this.yVelocity = game.levels.rockSpeed;
    }
    draw() {
        ctx.drawImage(this.texture, this.x, this.y, this.width, this.height);
    }
    move() {
        this.y += (this.yVelocity * game.deltaTime) / 7.5;
    }
    checkCollision() {
        if (
            game.rocket.x < this.x + this.width &&
            game.rocket.x + game.rocket.width > this.x &&
            game.rocket.y < this.y + this.height &&
            game.rocket.y + game.rocket.height > this.y
        ) {
            if (game.items.length < 9) {
                game.items.push(new h2CanisterPowerUp());
            }
            game.fallingItems.splice(game.fallingItems.indexOf(this), 1);
        }
    }
    checkIfOutOfScreen() {
        if (this.y > canvas.height) {
            return true;
        }
    }

    use() {
        game.rocks = [];
    }
}

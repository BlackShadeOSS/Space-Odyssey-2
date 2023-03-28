const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

var textures = {
    pressEnter: new Image(),
    rocket: new Image(),
    rocketWithWeaponPack: new Image(),
    rock: new Image(),
    missle: new Image(),
    weaponPackItem: new Image(),
};
textures.pressEnter.src = "./Photos/pressEnter.png";
textures.rocket.src = "./Photos/rocket.png";
textures.rocketWithWeaponPack.src = "./Photos/rocket-with-weapon.png";
textures.rock.src = "./Photos/rock.png";
textures.missle.src = "./Photos/missle.png";
textures.weaponPackItem.src = "./Photos/weapon-pack.png";
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
tutorialTextures.before.src = "./Photos/tutorial-L-R/frame-BEFORE.png";
tutorialTextures.neutral.src = "./Photos/tutorial-L-R/frame-N.png";
tutorialTextures.left.src = "./Photos/tutorial-L-R/frame-L.png";
tutorialTextures.right.src = "./Photos/tutorial-L-R/frame-R.png";
tutorialTextures.shiftLeft.src = "./Photos/tutorial-L-R/frame-NL.png";
tutorialTextures.shiftRight.src = "./Photos/tutorial-L-R/frame-NR.png";
tutorialTextures.ready.src = "./Photos/tutorial-L-R/frame-READY.png";
var tutorialTexturesLoaded = false;
var keysActive;
var game;
var tutorial;
var stopwatch;
var levelWatch;
var levelProgressBar;
document.addEventListener("DOMContentLoaded", () => {
    // Set canvas size to 80% window size
    canvas.width = window.innerWidth * 0.725;
    canvas.height = window.innerHeight * 0.8;
    if (window.innerWidth < 1200) {
        canvas.style.visibility = "hidden";
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
    setInterval(() => {
        if (tutorial) return;
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
});

window.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && !game) {
        if (tutorialTexturesLoaded && !tutorial) {
            tutorial = new Tutorial();
            tutorial.moveGif();
        }
    }
    if (e.key == "Enter" && tutorial && tutorial.readyToSkip && !game) {
        tutorial.skipTutorial = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        this.lastTimeFire = 0;
        this.amunition = 15;
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

    fire() {
        if (this.hasWeaponPack) {
            if (Date.now() - this.lastTimeFire > 400) {
                if (this.amunition == 0) {
                    this.reload();
                    return;
                }
                this.lastTimeFire = Date.now();
                this.amunition--;
                game.missles.push(new Missle());
            }
        }
    }

    reload() {
        setTimeout(() => {
            this.amunition = 15;
        }, 2500);
    }

    checkIfFireWeapon() {
        if (keysActive.includes("w") || keysActive.includes("arrowup")) {
            if (this.hasWeaponPack) {
                this.fire();
            }
        }
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
        this.rocketTexture = textures.rocketWithWeaponPack;
        this.hasWeaponPack = true;
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
        this.y = 0;
        this.yVelocity = n;
        if (game.rocks.length > 0)
            while (
                Math.abs(
                    game.rocks[game.rocks.length - 1].x +
                        game.rocks[game.rocks.length - 1].width -
                        (this.x + this.width)
                ) < 400
            ) {
                this.x = Math.floor(
                    Math.random() * (canvas.width - this.width)
                );
            }
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
            game.stop = true;
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
        this.rocks;
        this.meteors;
        this.missles;
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
                    document.querySelector(".warningSign").remove();
                });
        });
    }

    resetListener() {
        // reset game if letter "r" is pressed
        window.addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() == "r") {
                clearInterval(game.rockInterval);
                game.stop = false;
                game.rocks = [];
                game.meteors = [];
                game.time = 0;
                game.rocket = new Rocket();
                game.weaponPackItem = [];
                game.missles = [];
                game.levelProgress = 0;
                game.timeOnThisLevel = 0;
                game.levels = new Levels();
                game.rocket.rocketTexture = textures.rocket;
                game.render();
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
            rock.draw();
            rock.move();
            if (game.godmode == false) rock.checkCollision();
            if (rock.checkIfOutOfScreen()) {
                game.rocks.splice(game.rocks.indexOf(rock), 1);
            }
        }, game);

        // draw missles
        game.missles.forEach(function (missle) {
            missle.draw();
            missle.move();
            missle.checkCollision();
            if (missle.checkIfOutOfScreen()) {
                game.missles.splice(game.missles.indexOf(missle), 1);
            }
        }, game);

        // draw weapon pack item
        game.weaponPackItems.forEach(function (item) {
            item.draw();
            item.move();
            item.checkCollision();
            if (item.checkIfOutOfScreen()) {
                game.weaponPackItems.splice(
                    game.weaponPackItems.indexOf(item),
                    1
                );
            }
        }, game);

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
        if (game.timeOnThisLevel > game.levels.levelTime) {
            //not implemented yet
        }

        // Check if level is completed
        if (
            game.timeOnThisLevel > game.levels.levelTime
            // && game.levels.bossKilled == true
        ) {
            game.levels.setLevel(game.levels.levelNumber + 1);
        }
        // call render function again
        if (!game.stop) requestAnimationFrame(game.render);
    }
}

class Tutorial {
    constructor() {
        this.readyToSkip = false;
        this.skipTutorial = false;
    }
    moveGif() {
        ctx.drawImage(
            tutorialTextures.before,
            canvas.width / 2 - tutorialTextures.before.width / 2,
            canvas.height / 2 - tutorialTextures.before.height / 2
        );
        setTimeout(() => {
            this.readyToSkip = true;
        }, 100);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.drawImage(
                tutorialTextures.neutral,
                canvas.width / 2 - tutorialTextures.neutral.width / 2,
                canvas.height / 2 - tutorialTextures.neutral.height / 2
            );
        }, 3000);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.drawImage(
                tutorialTextures.left,
                canvas.width / 2 - tutorialTextures.left.width / 2,
                canvas.height / 2 - tutorialTextures.left.height / 2
            );
        }, 3750);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.drawImage(
                tutorialTextures.neutral,
                canvas.width / 2 - tutorialTextures.neutral.width / 2,
                canvas.height / 2 - tutorialTextures.neutral.height / 2
            );
        }, 4500);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.drawImage(
                tutorialTextures.right,
                canvas.width / 2 - tutorialTextures.right.width / 2,
                canvas.height / 2 - tutorialTextures.right.height / 2
            );
        }, 5250);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.drawImage(
                tutorialTextures.neutral,
                canvas.width / 2 - tutorialTextures.neutral.width / 2,
                canvas.height / 2 - tutorialTextures.neutral.height / 2
            );
        }, 6000);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.drawImage(
                tutorialTextures.shiftLeft,
                canvas.width / 2 - tutorialTextures.shiftLeft.width / 2,
                canvas.height / 2 - tutorialTextures.shiftLeft.height / 2
            );
        }, 6750);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.drawImage(
                tutorialTextures.neutral,
                canvas.width / 2 - tutorialTextures.neutral.width / 2,
                canvas.height / 2 - tutorialTextures.neutral.height / 2
            );
        }, 7500);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.drawImage(
                tutorialTextures.shiftRight,
                canvas.width / 2 - tutorialTextures.shiftRight.width / 2,
                canvas.height / 2 - tutorialTextures.shiftRight.height / 2
            );
        }, 8250);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.drawImage(
                tutorialTextures.neutral,
                canvas.width / 2 - tutorialTextures.neutral.width / 2,
                canvas.height / 2 - tutorialTextures.neutral.height / 2
            );
        }, 9000);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.drawImage(
                tutorialTextures.ready,
                canvas.width / 2 - tutorialTextures.ready.width / 2,
                canvas.height / 2 - tutorialTextures.ready.height / 2
            );
        }, 9750);
        setTimeout(() => {
            if (this.skipTutorial) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            game = new Game();
            game.newGame();
        }, 11000);
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
        this.yVelocity = 2;
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
        //check collision with boss
        // not implemented yet
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
        this.bossKilled = false;
        this.setLevel(1);
    }
    setLevel(number = 1) {
        if (number == 1) {
            this.level1();
        } else if (number == 2) {
            this.level2();
        } else if (number == 3) {
            this.level3();
        } else if (number == 4) {
            this.level4();
        } else if (number == 5) {
            this.level5();
        }
    }
    level1() {
        this.levelTime = 180000;
        this.rockIntervalTime = 750;
        this.rockSpeed = 2;
        this.levelNumber = 1;
        this.bossNumber = 1;
        game.rocks = [];
        game.meteors = [];
        game.missles = [];
        clearInterval(game.rockInterval);
        game.rockInterval = setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 500)
                if (!game.stop) game.rocks.push(new Rock(this.rockSpeed));
        }, this.rockIntervalTime);
        game.timeOnThisLevel = 0;
    }
    level2() {
        this.levelTime = 300000;
        this.rockIntervalTime = 500;
        this.rockSpeed = 3;
        this.levelNumber = 2;
        this.bossNumber = 2;
        game.rocks = [];
        game.meteors = [];
        game.missles = [];
        clearInterval(game.rockInterval);
        game.rockInterval = setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 500)
                if (!game.stop) game.rocks.push(new Rock(this.rockSpeed));
        }, this.rockIntervalTime);
        game.timeOnThisLevel = 0;
    }
    level3() {
        this.levelTime = 300000;
        this.rockIntervalTime = 400;
        this.rockSpeed = 4;
        this.levelNumber = 3;
        this.bossNumber = 3;
        game.rocks = [];
        game.meteors = [];
        game.missles = [];
        clearInterval(game.rockInterval);
        game.rockInterval = setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 500)
                if (!game.stop) game.rocks.push(new Rock(this.rockSpeed));
        }, this.rockIntervalTime);
        game.timeOnThisLevel = 0;
    }
    level4() {
        this.levelTime = 300000;
        this.rockIntervalTime = 350;
        this.rockSpeed = 5;
        this.levelNumber = 4;
        this.bossNumber = 4;
        game.rocks = [];
        game.meteors = [];
        game.missles = [];
        clearInterval(game.rockInterval);
        game.rockInterval = setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 400)
                if (!game.stop) game.rocks.push(new Rock(this.rockSpeed));
        }, this.rockIntervalTime);
        game.timeOnThisLevel = 0;
    }
    level5() {
        this.levelTime = 450000;
        this.rockIntervalTime = 300;
        this.rockSpeed = 6;
        this.levelNumber = 5;
        this.bossNumber = 5;
        game.rocks = [];
        game.meteors = [];
        game.missles = [];
        clearInterval(game.rockInterval);
        game.rockInterval = setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 400)
                if (!game.stop) game.rocks.push(new Rock(this.rockSpeed));
        }, this.rockIntervalTime);
        game.timeOnThisLevel = 0;
    }
}

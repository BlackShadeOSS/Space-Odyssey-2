const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

var textures = {
    pressEnter: new Image(),
    rocket: new Image(),
    rock: new Image(),
    meteor: new Image(),
};
textures.pressEnter.src = "../Photos/pressEnter.png";
textures.rocket.src = "../Photos/rocket.png";
textures.rock.src = "../Photos/rock.png";
textures.meteor.src = "../Photos/meteor.png";
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
tutorialTextures.before.src = "../Photos/tutorial-L-R/frame-BEFORE.png";
tutorialTextures.neutral.src = "../Photos/tutorial-L-R/frame-N.png";
tutorialTextures.left.src = "../Photos/tutorial-L-R/frame-L.png";
tutorialTextures.right.src = "../Photos/tutorial-L-R/frame-R.png";
tutorialTextures.shiftLeft.src = "../Photos/tutorial-L-R/frame-NL.png";
tutorialTextures.shiftRight.src = "../Photos/tutorial-L-R/frame-NR.png";
tutorialTextures.ready.src = "../Photos/tutorial-L-R/frame-READY.png";
var tutorialTexturesLoaded = false;
var keysActive;
var game;
var tutorial;
var stopwatch;
document.addEventListener("DOMContentLoaded", () => {
    // Set canvas size to 80% window size
    canvas.width = window.innerWidth * 0.75;
    canvas.height = window.innerHeight * 0.8;
    if (window.innerWidth < 1200) {
        canvas.style.visibility = "hidden";
        const h1 = document.createElement("h1");
        h1.innerHTML = "Please open this page on a bigger screen";
        h1.className = "warningSign";
        document.body.appendChild(h1);
    }

    stopwatch = document.getElementById("stopwatch");
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
    if (e.key == "Enter" && tutorial && tutorial.readyToSkip) {
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
}

class Rock {
    constructor() {
        this.rockTexture = textures.rock;
        this.originalWidth = this.rockTexture.width;
        this.originalHeight = this.rockTexture.height;
        this.width = this.originalWidth / 8;
        this.height = this.originalHeight / 8;
        this.x = Math.floor(Math.random() * (canvas.width - this.width));
        this.y = 0;
        this.yVelocity = 2;
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
        if (
            this.x < game.rocket.x + game.rocket.width &&
            this.x + this.width / 1.5 > game.rocket.x &&
            this.y < game.rocket.y + game.rocket.height &&
            this.y + this.height / 2 > game.rocket.y
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

class Meteor {
    constructor() {
        this.meteorTexture = textures.meteor;
        this.originalWidth = this.meteorTexture.width;
        this.originalHeight = this.meteorTexture.height;
        this.width = this.originalWidth / 4;
        this.height = this.originalHeight / 4;
        this.x = Math.floor(Math.random() * (canvas.width - this.width));
        this.y = 0;
        this.Velocity = 5;
    }

    draw() {
        ctx.drawImage(
            this.meteorTexture,
            this.width / 2,
            this.height / 2,
            this.width,
            this.height
        );
    }

    move() {
        this.y += (this.Velocity * game.deltaTime) / 7.5;
    }

    checkCollision() {
        if (
            this.x < game.rocket.x + game.rocket.width &&
            this.x + this.width / 1.5 > game.rocket.x &&
            this.y < game.rocket.y + game.rocket.height &&
            this.y + this.height / 1.5 > game.rocket.y
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
        this.time = 0;
        this.lastTime = Date.now();
        this.deltaTime;
        this.fps;
        this.stop = false;
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
                game.stop = false;
                game.rocks = [];
                game.meteors = [];
                game.time = 0;
                game.rocket = new Rocket();
                game.render();
            }
        });
    }

    detectDefocus() {
        window.addEventListener("blur", () => {
            this.stop = true;
            if (!document.querySelector(".warningSign")) {
                const div = document.createElement("div");
                const h1 =
                    "You have defocused the page, I've stopped the game for you";
                div.innerHTML =
                    h1 + "<br>" + "(click on the text to resume the game)";
                div.className = "warningSign";
                document.body.appendChild(div);
            }
            // resume the game if clicked on the message
            document
                .querySelector(".warningSign")
                .addEventListener("click", function () {
                    document.querySelector(".warningSign").remove();
                    game.stop = false;
                    game.render();
                    keysActive = [];
                });
        });
    }

    showTime() {
        // show time on stopwatch
        stopwatch.innerHTML =
            `T+` +
            Math.floor(this.time / 60000)
                .toString()
                .padStart(2, "0") +
            `:` +
            (Math.floor(this.time / 1000) - Math.floor(this.time / 60000) * 60)
                .toString()
                .padStart(2, "0");
    }

    newGame() {
        // add resize listener
        this.addResizeListener();

        // add reset listener
        this.resetListener();

        // create rocket
        this.rocket = new Rocket();

        // create rocks
        this.rocks = [];

        // create meteors
        this.meteors = [];

        // detect if window is defocused
        this.detectDefocus();

        // create rocks every 0.75 second
        setInterval(() => {
            for (let i = canvas.width; i > 0; i -= 500)
                if (!this.stop) this.rocks.push(new Rock());
        }, 750);

        // create meteors every 15 seconds
        // setInterval(() => {
        //     this.meteors.push(new Meteor());
        // }, 10000);

        // start render loop
        this.render();
    }

    render() {
        // calcutate delta time
        game.deltaTime = Date.now() - game.lastTime;
        game.lastTime = Date.now();

        //add detla time to time
        game.time += game.deltaTime;
        // show time
        game.showTime();
        // caltuclate fps
        game.fps = 1 / game.deltaTime;

        // move rocket
        game.rocket.moveUpdate();

        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw rocket
        game.rocket.draw();

        // draw rocks
        game.rocks.forEach(function (rock) {
            rock.draw();
            rock.move();
            rock.checkCollision();
            if (rock.checkIfOutOfScreen()) {
                game.rocks.splice(game.rocks.indexOf(rock), 1);
            }
        }, game);

        // draw meteors
        game.meteors.forEach(function (meteor) {
            meteor.draw();
            meteor.move();
            meteor.checkCollision();
            if (meteor.checkIfOutOfScreen()) {
                game.meteors.splice(game.meteors.indexOf(meteor), 1);
            }
        }, game);

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

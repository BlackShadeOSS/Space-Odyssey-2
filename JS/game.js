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
var keysActive;
var game;
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
});

textures.rock.addEventListener("load", () => {
    texturesLoaded = true;
    // render press enter for 1 second then clear for 1 second and repeat
    this.originalWidth = textures.pressEnter.width / 1.25;
    this.originalHeight = textures.pressEnter.height / 1.25;
    setInterval(() => {
        if (game) return;
        ctx.drawImage(
            textures.pressEnter,
            canvas.width / 2 - this.originalWidth / 2,
            canvas.height / 2 - this.originalHeight / 2,
            this.originalWidth,
            this.originalHeight
        );
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 750);
    }, 1500);
});

window.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && !game) {
        if (texturesLoaded && !game) {
            game = new Game();
            game.newGame();
        }
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
            if (this.x <= 0) this.x = 0;
            if (this.x >= canvas.width - this.width)
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
            this.x + this.width / 1.9 > game.rocket.x &&
            this.y < game.rocket.y + game.rocket.height &&
            this.y + this.height / 1.75 > game.rocket.y
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
        this.width = this.originalWidth / 6;
        this.height = this.originalHeight / 6;
        this.x = Math.floor(Math.random() * (canvas.width - this.width));
        this.y = 0;
        // random angle between 45 and 135 degrees  (in radians)
        this.angle = 90; //Math.random() * (Math.PI / 4) + Math.PI / 4;
        this.Velocity = 5;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(
            this.meteorTexture,
            this.width / 2,
            this.height / 2,
            this.width,
            this.height
        );
        ctx.restore();
    }

    move() {
        this.x += (this.Velocity * game.deltaTime * Math.cos(this.angle)) / 7.5;
        this.y += (this.Velocity * game.deltaTime * Math.sin(this.angle)) / 7.5;
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
        } else if (this.x >= canvas.width) {
            return true;
        } else if (this.x <= 0) {
            return true;
        } else return false;
    }
}

class Game {
    constructor() {
        this.rocket;
        this.rocks;
        this.meteors;
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
            if (e.key === "r") {
                game.stop = false;
                game.rocks = [];
                game.meteors = [];
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
                    "You have defocused the page, we stopped the game for you";
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

        // create rocks every 1 second
        setInterval(() => {
            this.rocks.push(new Rock());
        }, 750);

        // create meteors every 15 seconds
        setInterval(() => {
            this.meteors.push(new Meteor());
        }, 10000);

        // start render loop
        this.render();
    }

    render() {
        // calcutate delta time
        game.deltaTime = Date.now() - game.lastTime;
        game.lastTime = Date.now();
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

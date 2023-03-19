const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

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

document.addEventListener("DOMContentLoaded", function () {
    const game = new Game();
    game.newGame();
});

class Rocket {
    constructor() {
        this.rocketTexture = new Image();
        this.rocketTexture.src = "Photos/rocket.png";
        this.originalWidth = this.rocketTexture.width;
        this.originalHeight = this.rocketTexture.height;
        this.width = this.originalWidth / 8;
        this.height = this.originalHeight / 8;
        this.x = 0;
        this.y = canvas.height - (this.height + 25);
    }

    draw() {
        ctx.drawImage(
            this.rocketTexture,
            this.x,
            this.y,
            this.width,
            this.height
        );
        console.log(this.x + " " + this.y);
    }

    moveLeft() {
        if (this.x <= 0) {
            this.x = 0;
        } else this.x -= 10;
    }

    moveRight() {
        if (this.x >= canvas.width - this.width) {
            this.x = canvas.width - this.width;
        } else this.x += 10;
    }

    moveLeftMore() {
        if (this.x <= 0) {
            this.x = 0;
        } else this.x -= 25;
    }

    moveRightMore() {
        if (this.x >= canvas.width - this.width) {
            this.x = canvas.width - this.width;
        } else this.x += 25;
    }
}

class Rock {
    constructor() {
        this.rockTexture = new Image();
        this.rockTexture.src = "Photos/rock.png";
        this.originalWidth = this.rockTexture.width;
        this.originalHeight = this.rockTexture.height;
        this.width = this.originalWidth / 8;
        this.height = this.originalHeight / 8;
        this.x = Math.floor(Math.random() * canvas.width);
        this.y = 0;
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
        this.y += 5;
    }

    checkCollision() {
        if (
            this.x < rocket.x + rocket.width &&
            this.x + this.width > rocket.x &&
            this.y < rocket.y + rocket.height &&
            this.y + this.height > rocket.y
        ) {
            console.log("collision");
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
        this.rocks = [];
        this.rocket = new Rocket();
    }

    addRock() {
        this.rocks.push(new Rock());
    }

    checkScreenCompability() {
        if (window.innerWidth < 1200) {
            canvas.style.visibility = "hidden";
            const h1 = document.createElement("h1");
            h1.innerHTML = "Please open this page on a bigger screen";
            h1.className = "warningSign";
            document.body.appendChild(h1);
        }
    }

    render() {
        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw rocket
        rocket.draw();

        // draw rocks
        for (let i = 0; i < rocks.length; i++) {
            rocks[i].draw();
            rocks[i].move();
            rocks[i].checkCollision();
            if (rocks[i].checkIfOutOfScreen()) {
                rocks.splice(i, 1);
            }
        }
    }

    newGame() {
        this.checkScreenCompability();
        // Set canvas size to 80% window size
        canvas.width = window.innerWidth * 0.75;
        canvas.height = window.innerHeight * 0.8;

        // create rocket
        const rocket = new Rocket();

        // create rocks
        const rocks = [];

        // create rock every 1 second
        setInterval(function () {
            rocks.push(new Rock());
        }, 1000);

        // Add event listener for keydown

        document.addEventListener("keydown", function (event) {
            if (event.keyCode === 37 && event.shiftKey) {
                rocket.moveLeftMore();
            } else if (event.keyCode === 39 && event.shiftKey) {
                rocket.moveRightMore();
            } else if (event.keyCode === 37) {
                rocket.moveLeft();
            } else if (event.keyCode === 39) {
                rocket.moveRight();
            }
        });

        // render game
        setInterval(function () {
            game.render();
        }, 1000 / 60);
    }
}
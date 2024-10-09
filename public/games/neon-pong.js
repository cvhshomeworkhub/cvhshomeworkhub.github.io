class Paddle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.dy = 0;
        this.speed = 5;
    }

    move() {
        this.y += this.dy;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > game.canvas.height) this.y = game.canvas.height - this.height;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = 5;
        this.dy = 5;
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;

        // Top and bottom collision
        if (this.y - this.radius < 0 || this.y + this.radius > game.canvas.height) {
            this.dy *= -1;
        }

        // Paddle collision
        if (
            (this.x - this.radius < game.paddle1.x + game.paddle1.width && 
             this.y > game.paddle1.y && 
             this.y < game.paddle1.y + game.paddle1.height && 
             this.dx < 0) ||
            (this.x + this.radius > game.paddle2.x && 
             this.y > game.paddle2.y && 
             this.y < game.paddle2.y + game.paddle2.height && 
             this.dx > 0)
        ) {
            this.dx *= -1.1; // Increase speed slightly on each hit
            this.dy += (Math.random() - 0.5) * 4; // Add some randomness to y direction
        }

        // Score
        if (this.x - this.radius < 0) {
            game.score2++;
            this.reset();
        } else if (this.x + this.radius > game.canvas.width) {
            game.score1++;
            this.reset();
        }
    }

    reset() {
        this.x = game.canvas.width / 2;
        this.y = game.canvas.height / 2;
        this.dx = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.paddle1 = new Paddle(10, this.canvas.height / 2 - 50, 10, 100, '#00ffff');
        this.paddle2 = new Paddle(this.canvas.width - 20, this.canvas.height / 2 - 50, 10, 100, '#ff00ff');
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, 10, '#ffff00');
        this.score1 = 0;
        this.score2 = 0;
        this.gameOver = false;
        this.init();
    }

    init() {
        this.setupControls();
        this.animate();
    }

    setupControls() {
    document.addEventListener('keydown', (e) => {
        console.log(`Key down: ${e.key}`);
        if (e.key === 'w') this.paddle1.dy = -this.paddle1.speed;
        if (e.key === 's') this.paddle1.dy = this.paddle1.speed;
        if (e.key === 'ArrowUp') this.paddle2.dy = -this.paddle2.speed;
        if (e.key === 'ArrowDown') this.paddle2.dy = this.paddle2.speed;
    });

    document.addEventListener('keyup', (e) => {
        console.log(`Key up: ${e.key}`);
        if (e.key === 'w' || e.key === 's') this.paddle1.dy = 0;
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') this.paddle2.dy = 0;
    });
}


    update() {
        if (this.gameOver) return;

        this.paddle1.move();
        this.paddle2.move();
        this.ball.move();

        if (this.score1 >= 10 || this.score2 >= 10) {
            this.endGame();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center line
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw paddles and ball
        this.paddle1.draw(this.ctx);
        this.paddle2.draw(this.ctx);
        this.ball.draw(this.ctx);

        // Draw scores
        this.ctx.font = '32px Orbitron';
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillText(this.score1, this.canvas.width / 4, 50);
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.fillText(this.score2, 3 * this.canvas.width / 4, 50);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    endGame() {
        this.gameOver = true;
        const winner = this.score1 > this.score2 ? 'Player 1' : 'Player 2';
        document.getElementById('winner').textContent = winner;
        document.getElementById('gameOver').style.display = 'block';
    }

    restart() {
        this.gameOver = false;
        this.score1 = 0;
        this.score2 = 0;
        this.ball.reset();
        this.paddle1 = new Paddle(10, this.canvas.height / 2 - 50, 10, 100, '#00ffff');
        this.paddle2 = new Paddle(this.canvas.width - 20, this.canvas.height / 2 - 50, 10, 100, '#ff00ff');
        document.getElementById('gameOver').style.display = 'none';
    }
}

let game;

function startGame() {
    game = new Game();
}

function restartGame() {
    game.restart();
}

window.onload = startGame;

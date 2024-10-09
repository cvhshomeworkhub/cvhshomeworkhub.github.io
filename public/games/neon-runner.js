class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.size = 30;
        this.x = 50;
        this.y = canvas.height - this.size - 10;
        this.dy = 0;
        this.jumpForce = -15;
        this.gravity = 0.8;
        this.grounded = true;
    }

    jump() {
        if (this.grounded) {
            this.dy = this.jumpForce;
            this.grounded = false;
        }
    }

    update() {
        this.dy += this.gravity;
        this.y += this.dy;

        if (this.y > this.canvas.height - this.size - 10) {
            this.y = this.canvas.height - this.size - 10;
            this.dy = 0;
            this.grounded = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;
    }
}

class Obstacle {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 20;
        this.height = Math.random() * 100;
        this.x = canvas.width;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
    }

    update() {
        this.x -= this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(this.canvas);
        this.obstacles = [];
        this.score = 0;
        this.highScore = localStorage.getItem('neonRunnerHighScore') || 0;
        this.gameOver = false;
        this.obstacleTimer = 0;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameOver) {
                    this.restart();
                } else {
                    this.player.jump();
                }
            }
        });

        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameOver) {
                this.restart();
            } else {
                this.player.jump();
            }
        });

        this.animate();
    }

    spawnObstacle() {
        this.obstacles.push(new Obstacle(this.canvas));
    }

    checkCollision(player, obstacle) {
        return player.x < obstacle.x + obstacle.width &&
               player.x + player.size > obstacle.x &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.size > obstacle.y;
    }

    update() {
        if (this.gameOver) return;

        this.player.update();

        this.obstacleTimer++;
        if (this.obstacleTimer > 100) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }

        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.update();
            if (this.checkCollision(this.player, obstacle)) {
                this.endGame();
            }
            return obstacle.x > -obstacle.width;
        });

        this.score++;
        document.getElementById('score').textContent = Math.floor(this.score/10);
    }

    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ground line with glow
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 10);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 10);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        this.player.draw(this.ctx);
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    endGame() {
        this.gameOver = true;
        const finalScore = Math.floor(this.score/10);
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem('neonRunnerHighScore', this.highScore);
            document.getElementById('highScore').textContent = this.highScore;
        }
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('gameOver').style.display = 'block';
    }

    restart() {
        this.gameOver = false;
        this.score = 0;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.player = new Player(this.canvas);
        document.getElementById('gameOver').style.display = 'none';
    }
}

window.onload = () => {
    new Game();
};

function restartGame() {
    window.game = new Game();
}

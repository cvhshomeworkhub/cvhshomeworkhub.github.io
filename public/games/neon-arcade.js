class Player {
    constructor(game) {
        this.game = game;
        this.size = 20;
        this.x = game.canvas.width / 2 - this.size / 2;
        this.y = game.canvas.height - this.size - 10;
        this.dx = 0;
        this.dy = 0;
        this.speed = 5;
        this.hasShield = false;
        this.shieldDuration = 0;
    }

    move(direction) {
        switch(direction) {
            case 'left':
                this.dx = -this.speed;
                this.dy = 0;
                break;
            case 'right':
                this.dx = this.speed;
                this.dy = 0;
                break;
            case 'up':
                this.dx = 0;
                this.dy = -this.speed;
                break;
            case 'down':
                this.dx = 0;
                this.dy = this.speed;
                break;
        }
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        // Boundary checks
        this.x = Math.max(0, Math.min(this.x, this.game.canvas.width - this.size));
        this.y = Math.max(0, Math.min(this.y, this.game.canvas.height - this.size));

        // Update shield
        if (this.hasShield) {
            this.shieldDuration--;
            if (this.shieldDuration <= 0) {
                this.hasShield = false;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.hasShield ? '#00ffff' : '#ff00ff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.hasShield ? '#00ffff' : '#ff00ff';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;
    }
}

class Obstacle {
    constructor(game, x, y, width, height, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'wall', 'shield', 'moving'
        this.dx = type === 'moving' ? 2 : 0;
    }

    update() {
        if (this.type === 'moving') {
            this.x += this.dx;
            if (this.x <= 0 || this.x + this.width >= this.game.canvas.width) {
                this.dx *= -1;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.type === 'shield' ? '#00ff00' : '#ffffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.type === 'shield' ? '#00ff00' : '#ffffff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(this);
        this.obstacles = [];
        this.lavaHeight = 0;
        this.lavaSpeed = 0.5;
        this.score = 0;
        this.gameOver = false;
        this.init();
    }

    init() {
        this.generateLevel();
        this.setupControls();
        this.animate();
    }

    generateLevel() {
        // Generate walls
        for (let i = 0; i < 10; i++) {
            this.obstacles.push(new Obstacle(
                this,
                Math.random() * (this.canvas.width - 50),
                Math.random() * (this.canvas.height - 50),
                50,
                10,
                'wall'
            ));
        }

        // Generate shield power-ups
        for (let i = 0; i < 3; i++) {
            this.obstacles.push(new Obstacle(
                this,
                Math.random() * (this.canvas.width - 20),
                Math.random() * (this.canvas.height - 20),
                20,
                20,
                'shield'
            ));
        }

        // Generate moving platforms
        for (let i = 0; i < 5; i++) {
            this.obstacles.push(new Obstacle(
                this,
                Math.random() * (this.canvas.width - 80),
                Math.random() * (this.canvas.height - 20),
                80,
                10,
                'moving'
            ));
        }
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.player.move('left');
                    break;
                case 'ArrowRight':
                    this.player.move('right');
                    break;
                case 'ArrowUp':
                    this.player.move('up');
                    break;
                case 'ArrowDown':
                    this.player.move('down');
                    break;
            }
        });

        document.addEventListener('keyup', () => {
            this.player.dx = 0;
            this.player.dy = 0;
        });
    }

    update() {
        if (this.gameOver) return;

        this.player.update();
        this.obstacles.forEach(obstacle => obstacle.update());

        // Collision detection
        this.obstacles.forEach(obstacle => {
            if (this.checkCollision(this.player, obstacle)) {
                if (obstacle.type === 'shield') {
                    this.player.hasShield = true;
                    this.player.shieldDuration = 300; // 5 seconds at 60 FPS
                    this.obstacles = this.obstacles.filter(obs => obs !== obstacle);
                } else if (obstacle.type === 'wall' || obstacle.type === 'moving') {
                    // Push the player back
                    this.player.x -= this.player.dx;
                    this.player.y -= this.player.dy;
                }
            }
        });

        // Update lava
        this.lavaHeight += this.lavaSpeed;
        if (this.player.y + this.player.size > this.canvas.height - this.lavaHeight) {
            if (this.player.hasShield) {
                this.player.hasShield = false;
                this.player.y = this.canvas.height - this.lavaHeight - this.player.size;
            } else {
                this.endGame();
            }
        }

        // Update score
        this.score++;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw obstacles
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));

        // Draw player
        this.player.draw(this.ctx);

        // Draw lava
        this.ctx.fillStyle = '#ff3300';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ff3300';
        this.ctx.fillRect(0, this.canvas.height - this.lavaHeight, this.canvas.width, this.lavaHeight);
        this.ctx.shadowBlur = 0;

        // Draw score
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${Math.floor(this.score / 60)}`, 10, 30);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    checkCollision(player, obstacle) {
        return player.x < obstacle.x + obstacle.width &&
               player.x + player.size > obstacle.x &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.size > obstacle.y;
    }

    endGame() {
        this.gameOver = true;
        const finalScore = Math.floor(this.score / 60);
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('gameOver').style.display = 'block';
    }

    restart() {
        this.gameOver = false;
        this.score = 0;
        this.lavaHeight = 0;
        this.player = new Player(this);
        this.obstacles = [];
        this.generateLevel();
        document.getElementById('gameOver').style.display = 'none';
    }
}

function startGame() {
    window.game = new Game();
}

function restartGame() {
    window.game.restart();
}

window.onload = startGame;

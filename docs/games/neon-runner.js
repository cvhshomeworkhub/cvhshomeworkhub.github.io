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
        this.color = '#00ffff';
        this.jumpsRemaining = 1;
        this.powerUp = null;
        this.powerUpTimer = 0;
        this.ironManCounter = 0;
    }

    jump() {
        if (this.jumpsRemaining > 0) {
            this.dy = this.jumpForce;
            this.jumpsRemaining--;
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
            this.jumpsRemaining = this.powerUp === 'superS' || this.powerUp === 'ironMan' ? 2 : 1;
        }

        if (this.powerUp) {
            this.powerUpTimer--;
            if (this.powerUpTimer <= 0) {
                if (this.powerUp !== 'ironMan' || this.ironManCounter === 0) {
                    this.powerUp = null;
                    this.color = '#00ffff';
                }
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowBlur = 0;

        if (this.powerUp === 'capShield') {
            this.drawShield(ctx);
        } else if (this.powerUp === 'ironMan') {
            this.drawIronManFace(ctx);
        }
    }

    drawShield(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size * 0.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawIronManFace(ctx) {
        // Simple Iron Man face representation
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + 5, this.y + 5, 8, 4);
        ctx.fillRect(this.x + 17, this.y + 5, 8, 4);
        ctx.fillRect(this.x + 10, this.y + 15, 10, 5);
    }

    activatePowerUp(type) {
        this.powerUp = type;
        switch(type) {
            case 'superS':
                this.color = 'red';
                this.powerUpTimer = 11 * 60; // 11 seconds
                this.jumpsRemaining = 2;
                break;
            case 'capShield':
                this.powerUpTimer = 13 * 60; // 13 seconds
                break;
            case 'ironMan':
                this.color = 'red';
                this.powerUpTimer = 11 * 60; // 11 seconds for double jump
                this.ironManCounter = 4;
                this.jumpsRemaining = 2;
                break;
            case 'flash':
                this.color = 'yellow';
                this.powerUpTimer = 11 * 60; // 11 seconds
                this.jumpForce *= 2;
                break;
        }
    }
}

class Obstacle {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 20;
        this.height = Math.random() * 100 + 20; // Ensures a minimum height
        this.x = canvas.width;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
        this.type = Math.random() > 0.5 ? 'normal' : 'spike'; // Different types of obstacles
    }

    update() {
        this.x -= this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.type === 'normal' ? '#ff00ff' : '#ff4500'; // Different colors for different types
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.fillStyle;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class PowerUp {
    constructor(canvas, type) {
        this.canvas = canvas;
        this.size = 30;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.size - 20) + 10;
        this.speed = 5;
        this.type = type || this.getRandomType();
    }

    getRandomType() {
        const types = ['superS', 'capShield', 'ironMan', 'flash'];
        return types[Math.floor(Math.random() * types.length)];
    }

    update() {
        this.x -= this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        switch(this.type) {
            case 'superS':
                this.drawSuperS(ctx);
                break;
            case 'capShield':
                this.drawStar(ctx);
                break;
            case 'ironMan':
                this.drawTriangle(ctx);
                break;
            case 'flash':
                this.drawLightning(ctx);
                break;
        }
        
        ctx.restore();
    }

    drawSuperS(ctx) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(30, 10);
        ctx.lineTo(25, 30);
        ctx.lineTo(15, 25);
        ctx.lineTo(5, 30);
        ctx.lineTo(0, 10);
        ctx.closePath();
        ctx.fill();
    }

    drawStar(ctx) {
        ctx.fillStyle = 'silver';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 15 + 15,
                       Math.sin((18 + i * 72) * Math.PI / 180) * 15 + 15);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 7 + 15,
                       Math.sin((54 + i * 72) * Math.PI / 180) * 7 + 15);
        }
        ctx.closePath();
        ctx.fill();
    }

    drawTriangle(ctx) {
        ctx.fillStyle = '#00BFFF';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(30, 30);
        ctx.lineTo(0, 30);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, 20);
        ctx.lineTo(20, 20);
        ctx.lineTo(15, 10);
        ctx.closePath();
        ctx.stroke();
    }

    drawLightning(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(25, 12);
        ctx.lineTo(20, 12);
        ctx.lineTo(30, 30);
        ctx.lineTo(20, 18);
        ctx.lineTo(25, 18);
        ctx.lineTo(15, 0);
        ctx.closePath();
        ctx.fill();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(this.canvas);
        this.obstacles = [];
        this.powerUps = [];
        this.score = 0;
        this.highScore = localStorage.getItem('neonRunnerHighScore') || 0;
        this.gameOver = false;
        this.obstacleTimer = 0;
        this.powerUpTimer = 0;
        this.scoreMultiplier = 1;
        this.gameSpeed = 1;
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

        this.timerDisplay = document.createElement('div');
        this.timerDisplay.style.position = 'absolute';
        this.timerDisplay.style.top = '10px';
        this.timerDisplay.style.right = '10px';
        this.timerDisplay.style.fontFamily = 'Arial, sans-serif';
        this.timerDisplay.style.fontSize = '16px';
        document.body.appendChild(this.timerDisplay);
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

    spawnPowerUp() {
        this.powerUps.push(new PowerUp(this.canvas));
    }

    update() {
        if (this.gameOver) return;

        this.player.update();

        this.obstacleTimer++;
        if (this.obstacleTimer > 100 / this.gameSpeed) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }

        this.powerUpTimer++;
        if (this.powerUpTimer > 2400) { // Spawn power-up every 40 seconds
            this.spawnPowerUp();
            this.powerUpTimer = 0;
        }

        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.update();
            if (this.checkCollision(this.player, obstacle)) {
                if (this.player.powerUp === 'capShield') {
                    return false; // Remove the obstacle on collision with shield
                } else if (this.player.powerUp === 'ironMan' && this.player.ironManCounter > 0) {
                    this.player.ironManCounter--;
                    return false; // Remove the obstacle
                } else {
                    this.endGame();
                }
            }
            return obstacle.x > -obstacle.width;
        });

        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update();
            if (this.checkPowerUpCollision(this.player, powerUp)) {
                this.player.activatePowerUp(powerUp.type);
                return false; // Remove power-up after collection
            }
            return powerUp.x > -powerUp.size;
        });

        if (this.player.powerUp === 'flash') {
            this.gameSpeed = 0.5; // Slow down obstacles
        } else {
            this.gameSpeed = 1;
        }

        this.score += this.scoreMultiplier * this.gameSpeed;
        document.getElementById('score').textContent = Math.floor(this.score / 10);

        this.updateTimerDisplay();
    }

    checkCollision(player, obstacle) {
        return player.x < obstacle.x + obstacle.width &&
               player.x + player.size > obstacle.x &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.size > obstacle.y;
    }

    checkPowerUpCollision(player, powerUp) {
        return player.x < powerUp.x + powerUp.size &&
               player.x + player.size > powerUp.x &&
               player.y < powerUp.y + powerUp.size &&
               player.y + player.size > powerUp.y;
    }

    update() {
        if (this.gameOver) return;

        this.player.update();

        this.obstacleTimer++;
        if (this.obstacleTimer > 100) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }

        this.powerUpTimer++;
        if (this.powerUpTimer > 300) { // Adjust timing for power-ups
            this.spawnPowerUp();
            this.powerUpTimer = 0;
        }

        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.update();
            if (this.checkCollision(this.player, obstacle)) {
                this.endGame();
            }
            return obstacle.x > -obstacle.width;
        });

        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update();
            if (this.checkPowerUpCollision(this.player, powerUp)) {
                this.scoreMultiplier *= 2; // Increase multiplier on power-up collection
                return false; // Remove power-up after collection
            }
            return powerUp.x > -powerUp.size;
        });

        this.score += this.scoreMultiplier;
        document.getElementById('score').textContent = Math.floor(this.score / 10);
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
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
    }

    updateTimerDisplay() {
        let timerText = '';
        if (this.player.powerUp) {
            const seconds = Math.ceil(this.player.powerUpTimer / 60);
            switch(this.player.powerUp) {
                case 'superS':
                    timerText += `<span style="color: red;">S: ${seconds}s</span><br>`;
                    break;
                case 'capShield':
                    timerText += `<span style="color: white;">Shield: ${seconds}s</span><br>`;
                    break;
                case 'ironMan':
                    timerText += `<span style="color: blue;">IM: ${seconds}s (${this.player.ironManCounter})</span><br>`;
                    break;
                case 'flash':
                    timerText += `<span style="color: yellow;">Speed: ${seconds}s</span><br>`;
                    break;
            }
        }
        this.timerDisplay.innerHTML = timerText;
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    endGame() {
        this.gameOver = true;
        const finalScore = Math.floor(this.score / 10);
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
        this.scoreMultiplier = 1; // Reset multiplier
        this.obstacles = [];
        this.powerUps = [];
        this.obstacleTimer = 0;
        this.powerUpTimer = 0;
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

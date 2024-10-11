class Car {
    constructor(x, y, color, controls) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 50;
        this.color = color;
        this.speed = 0;
        this.maxSpeed = 6;
        this.acceleration = 0.2;
        this.deceleration = 0.1;
        this.friction = 0.03;  // Reduced friction for smoother movement
        this.angle = 0;
        this.controls = controls;
        this.lap = 0;
        this.lastAngle = 0;  // For tracking rotation direction
        this.angleAccumulator = 0;  // For lap counting
        this.checkpoints = new Set();
    }

    update(track, otherCar) {
        this.move();
        this.checkCollision(track);
        this.checkCarCollision(otherCar);
        this.updateLap(track);
    }

    move() {
        if (this.controls.up) {
            this.speed += this.acceleration;
        } else if (this.controls.down) {
            this.speed -= this.acceleration;
        }

        // Enhanced friction
        if (!this.controls.up && !this.controls.down) {
            this.speed *= (1 - this.friction);
        }

        // Speed limiting
        this.speed = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.speed));

        // Improved turning that depends on speed
        const turnSpeed = 0.05 * (1 - Math.abs(this.speed) / (this.maxSpeed * 2));
        if (this.controls.left) this.angle -= turnSpeed;
        if (this.controls.right) this.angle += turnSpeed;

        // Update position
        const moveX = Math.cos(this.angle) * this.speed;
        const moveY = Math.sin(this.angle) * this.speed;
        
        this.x += moveX;
        this.y += moveY;
    }

    checkCollision(track) {
        const corners = this.getCorners();
        for (let corner of corners) {
            if (!track.isPointInTrack(corner.x, corner.y)) {
                this.speed *= -0.7; // Stronger bounce
                const overlapX = corner.x < track.centerX ? this.x + 5 : this.x - 5;
                const overlapY = corner.y < track.centerY ? this.y + 5 : this.y - 5;
                this.x = overlapX;
                this.y = overlapY;
                break;
            }
        }
    }

    checkCarCollision(otherCar) {
        if (!otherCar) return;
        
        const dx = this.x - otherCar.x;
        const dy = this.y - otherCar.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (this.width + otherCar.width) / 1.5) {
            // More dramatic bounce effect
            this.speed *= -0.7;
            otherCar.speed *= -0.7;

            // Push cars apart more strongly
            this.x += dx > 0 ? 3 : -3;
            this.y += dy > 0 ? 3 : -3;
            otherCar.x += dx > 0 ? -3 : 3;
            otherCar.y += dy > 0 ? -3 : 3;
        }
    }

    getCorners() {
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        return [
            { x: this.x - this.width / 2 * cos - this.height / 2 * sin, y: this.y - this.width / 2 * sin + this.height / 2 * cos },
            { x: this.x + this.width / 2 * cos - this.height / 2 * sin, y: this.y + this.width / 2 * sin + this.height / 2 * cos },
            { x: this.x - this.width / 2 * cos + this.height / 2 * sin, y: this.y - this.width / 2 * sin - this.height / 2 * cos },
            { x: this.x + this.width / 2 * cos + this.height / 2 * sin, y: this.y + this.width / 2 * sin - this.height / 2 * cos }
        ];
    }

    getCenter() {
        return { x: this.x, y: this.y };
    }

    updateLap(track) {
        // Calculate angle relative to track center
        const dx = this.x - track.centerX;
        const dy = this.y - track.centerY;
        const currentAngle = Math.atan2(dy, dx);
        
        // Calculate angle difference
        let angleDiff = currentAngle - this.lastAngle;
        
        // Normalize angle difference
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Only count clockwise laps
        if (angleDiff < 0) {
            this.angleAccumulator += -angleDiff;
            
            // Check for complete lap
            if (this.angleAccumulator >= 2 * Math.PI) {
                this.lap++;
                this.angleAccumulator = 0;
            }
        }
        
        this.lastAngle = currentAngle;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Enhanced glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        
        // Draw car body
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Additional glow layer
        ctx.shadowBlur = 30;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
        
        ctx.restore();
    }
}

class Track {
    constructor(canvas) {
        this.canvas = canvas;
        this.outerRadius = Math.min(canvas.width, canvas.height) * 0.45;
        this.innerRadius = this.outerRadius * 0.7;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.checkpoints = this.generateCheckpoints();
    }

    isPointInTrack(x, y) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance >= this.innerRadius && distance <= this.outerRadius;
    }

    generateCheckpoints() {
        const checkpoints = [];
        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4;
            const x = this.centerX + this.outerRadius * Math.cos(angle);
            const y = this.centerY + this.outerRadius * Math.sin(angle);
            checkpoints.push({ x, y });
        }
        return checkpoints;
    }

    getCheckpoint(x, y) {
        for (let i = 0; i < this.checkpoints.length; i++) {
            const checkpoint = this.checkpoints[i];
            const dx = x - checkpoint.x;
            const dy = y - checkpoint.y;
            if (Math.sqrt(dx * dx + dy * dy) < 20) {
                return i;
            }
        }
        return null;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.outerRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.innerRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ff';
        ctx.stroke();

        ctx.shadowBlur = 0;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.track = new Track(this.canvas);
        
        // Start positions on outer track
        const startAngle = Math.PI;
        const startRadius = this.track.outerRadius - 40; // Near outer edge
        
        const startX1 = this.track.centerX + startRadius * Math.cos(startAngle) - 20;
        const startY1 = this.track.centerY + startRadius * Math.sin(startAngle);
        const startX2 = this.track.centerX + startRadius * Math.cos(startAngle) + 20;
        const startY2 = this.track.centerY + startRadius * Math.sin(startAngle);

        this.car1 = new Car(startX1, startY1, '#00ffff', {up: false, down: false, left: false, right: false});
        this.car2 = new Car(startX2, startY2, '#ff00ff', {up: false, down: false, left: false, right: false});
        this.winner = null;
        this.init();
    }

    init() {
        this.setupControls();
        this.animate();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'w') this.car1.controls.up = true;
            if (e.key === 's') this.car1.controls.down = true;
            if (e.key === 'a') this.car1.controls.left = true;
            if (e.key === 'd') this.car1.controls.right = true;
            if (e.key === 'ArrowUp') this.car2.controls.up = true;
            if (e.key === 'ArrowDown') this.car2.controls.down = true;
            if (e.key === 'ArrowLeft') this.car2.controls.left = true;
            if (e.key === 'ArrowRight') this.car2.controls.right = true;
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'w') this.car1.controls.up = false;
            if (e.key === 's') this.car1.controls.down = false;
            if (e.key === 'a') this.car1.controls.left = false;
            if (e.key === 'd') this.car1.controls.right = false;
            if (e.key === 'ArrowUp') this.car2.controls.up = false;
            if (e.key === 'ArrowDown') this.car2.controls.down = false;
            if (e.key === 'ArrowLeft') this.car2.controls.left = false;
            if (e.key === 'ArrowRight') this.car2.controls.right = false;
        });
    }

    update() {
        if (this.winner) return;

        this.car1.update(this.track, this.car2);
        this.car2.update(this.track, this.car1);

        if (this.car1.lap >= 5 || this.car2.lap >= 5) {
            this.endGame();
        }
    }

    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.track.draw(this.ctx);
        this.car1.draw(this.ctx);
        this.car2.draw(this.ctx);

        // Draw laps with glow
        this.ctx.font = '24px Orbitron';
        this.ctx.shadowBlur = 20;
        
        this.ctx.shadowColor = this.car1.color;
        this.ctx.fillStyle = this.car1.color;
        this.ctx.fillText(`Player 1 Laps: ${this.car1.lap}`, 10, 30);
        
        this.ctx.shadowColor = this.car2.color;
        this.ctx.fillStyle = this.car2.color;
        this.ctx.fillText(`Player 2 Laps: ${this.car2.lap}`, 10, 60);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    endGame() {
        this.winner = this.car1.lap >= 5 ? 'Player 1' : 'Player 2';
        document.getElementById('winner').textContent = this.winner;
        document.getElementById('gameOver').style.display = 'block';
    }

    restart() {
        const startAngle = Math.PI;
        const startRadius = this.track.outerRadius - 40;
        
        const startX1 = this.track.centerX + startRadius * Math.cos(startAngle) - 20;
        const startY1 = this.track.centerY + startRadius * Math.sin(startAngle);
        const startX2 = this.track.centerX + startRadius * Math.cos(startAngle) + 20;
        const startY2 = this.track.centerY + startRadius * Math.sin(startAngle);

        this.car1 = new Car(startX1, startY1, '#00ffff', {up: false, down: false, left: false, right: false});
        this.car2 = new Car(startX2, startY2, '#ff00ff', {up: false, down: false, left: false, right: false});
        this.winner = null;
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

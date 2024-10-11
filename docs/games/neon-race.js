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
        this.bounce = 0.7;  // Bounce coefficient for collisions
        this.glow = 30;  // Increased glow effect
    }

    update(track, otherCar) {
        this.move(track);
        this.checkCollision(track);
        this.checkCarCollision(otherCar);
        this.updateLapCount(track);
    }

    move(track) {
        // Handle acceleration
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

        // Steering
        const turnSpeed = 0.05 * (1 - Math.abs(this.speed) / (this.maxSpeed * 2));
        if (this.controls.left) this.angle -= turnSpeed;
        if (this.controls.right) this.angle += turnSpeed;

        // Update position
        const moveX = Math.cos(this.angle) * this.speed;
        const moveY = Math.sin(this.angle) * this.speed;

        // Try to move
        const newX = this.x + moveX;
        const newY = this.y + moveY;

        // Check if new position is valid
        const distanceFromCenter = Math.sqrt(
            (newX - track.centerX) ** 2 + 
            (newY - track.centerY) ** 2
        );

        if (distanceFromCenter >= track.innerRadius && 
            distanceFromCenter <= track.outerRadius) {
            this.x = newX;
            this.y = newY;
        } else {
            // Bounce off walls
            this.speed *= -this.bounce;
        }
    }

    checkCarCollision(otherCar) {
        if (!otherCar) return;
        
        const dx = this.x - otherCar.x;
        const dy = this.y - otherCar.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (this.width + otherCar.width) / 1.5;

        if (distance < minDistance) {
            // Calculate collision response
            const angle = Math.atan2(dy, dx);
            const overlap = minDistance - distance;
            
            // Move cars apart
            this.x += Math.cos(angle) * overlap / 2;
            this.y += Math.sin(angle) * overlap / 2;
            otherCar.x -= Math.cos(angle) * overlap / 2;
            otherCar.y -= Math.sin(angle) * overlap / 2;

            // Exchange momentum
            const tempSpeed = this.speed;
            this.speed = otherCar.speed * this.bounce;
            otherCar.speed = tempSpeed * this.bounce;
        }
    }

    updateLapCount(track) {
        // Calculate angle relative to track center
        const dx = this.x - track.centerX;
        const dy = this.y - track.centerY;
        const currentAngle = Math.atan2(dy, dx);
        
        // Calculate angle difference
        let angleDiff = currentAngle - this.lastAngle;
        
        // Normalize angle difference
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Accumulate angle (only for clockwise movement)
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
        ctx.shadowBlur = this.glow;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        
        // Draw car body
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Draw additional glow layers
        ctx.shadowBlur = this.glow * 1.5;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
        
        ctx.restore();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.track = new Track(this.canvas);
        
        // Start positions adjusted to outer track
        const startAngle = Math.PI;
        const startRadius = this.track.outerRadius - 40; // Positioned near outer edge
        
        const startX1 = this.track.centerX + startRadius * Math.cos(startAngle) - 20;
        const startY1 = this.track.centerY + startRadius * Math.sin(startAngle);
        const startX2 = this.track.centerX + startRadius * Math.cos(startAngle) + 20;
        const startY2 = this.track.centerY + startRadius * Math.sin(startAngle);

        this.car1 = new Car(startX1, startY1, '#00ffff', {up: false, down: false, left: false, right: false});
        this.car2 = new Car(startX2, startY2, '#ff00ff', {up: false, down: false, left: false, right: false});
        this.winner = null;
        this.init();
    }

    draw() {
        // Clear with fade effect for motion blur
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.track.draw(this.ctx);
        this.car1.draw(this.ctx);
        this.car2.draw(this.ctx);

        // Enhanced lap counter display
        this.ctx.font = 'bold 24px Orbitron';
        this.ctx.shadowBlur = 10;
        
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
        const startAngle = Math.PI; // Leftmost angle for the cars
        const startX1 = this.track.centerX + this.track.innerRadius * Math.cos(startAngle) - 15; // Car 1
        const startY1 = this.track.centerY + this.track.innerRadius * Math.sin(startAngle); // Car 1
        const startX2 = this.track.centerX + this.track.innerRadius * Math.cos(startAngle) + 15; // Car 2
        const startY2 = this.track.centerY + this.track.innerRadius * Math.sin(startAngle); // Car 2

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

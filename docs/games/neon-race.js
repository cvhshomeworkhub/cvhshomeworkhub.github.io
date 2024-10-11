class Car {
    constructor(x, y, color, controls) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 50;
        this.color = color;
        this.speed = 0;
        this.maxSpeed = 5;
        this.acceleration = 0.2;
        this.deceleration = 0.1;
        this.friction = 0.05;
        this.angle = 0;
        this.controls = controls;
        this.lap = 0;
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

        // Apply friction when not accelerating
        if (!this.controls.up && !this.controls.down) {
            this.speed *= (1 - this.friction);
        }

        this.speed = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.speed));

        if (this.controls.left) this.angle -= 0.05;
        if (this.controls.right) this.angle += 0.05;

        // Update position based on speed and angle
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Keep cars on the track
        const center = { x: track.centerX, y: track.centerY };
        const trackDistance = Math.sqrt(Math.pow(this.x - center.x, 2) + Math.pow(this.y - center.y, 2));
        if (trackDistance < track.innerRadius || trackDistance > track.outerRadius) {
            this.x -= Math.cos(this.angle) * this.speed; // Undo movement
            this.y -= Math.sin(this.angle) * this.speed; // Undo movement
            this.speed *= -0.5; // Bounce back
        }
    }

    checkCollision(track) {
        const corners = this.getCorners();
        for (let corner of corners) {
            if (!track.isPointInTrack(corner.x, corner.y)) {
                // Bounce off the wall
                this.speed *= -0.5; // Reverse speed
                // Adjust position to prevent sticking
                const overlapX = corner.x < track.centerX ? this.x + 5 : this.x - 5;
                const overlapY = corner.y < track.centerY ? this.y + 5 : this.y - 5;
                this.x = overlapX;
                this.y = overlapY;
                break;
            }
        }
    }

    checkCarCollision(otherCar) {
        const dx = this.x - otherCar.x;
        const dy = this.y - otherCar.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (this.width + otherCar.width) / 2) {
            // Bounce off the other car
            this.speed *= -0.5;
            otherCar.speed *= -0.5;

            // Move them apart
            this.x += dx > 0 ? 1 : -1;
            this.y += dy > 0 ? 1 : -1;
        }
    }

    updateLap(track) {
        const center = this.getCenter();
        const checkpoint = track.getCheckpoint(center.x, center.y);
        if (checkpoint !== null) {
            this.checkpoints.add(checkpoint);
            if (checkpoint === 0 && this.checkpoints.size === track.checkpoints.length) {
                this.lap++;
                this.checkpoints.clear();
            }
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

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.shadowBlur = 0;
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
        
        // Set starting positions to the leftmost part of the track
        const startAngle = Math.PI; // Leftmost angle for the cars
        const startX1 = this.track.centerX + this.track.innerRadius * Math.cos(startAngle) - 15; // Car 1
        const startY1 = this.track.centerY + this.track.innerRadius * Math.sin(startAngle); // Car 1
        const startX2 = this.track.centerX + this.track.innerRadius * Math.cos(startAngle) + 15; // Car 2
        const startY2 = this.track.centerY + this.track.innerRadius * Math.sin(startAngle); // Car 2

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

        // Draw laps
        this.ctx.font = '24px Orbitron';
        this.ctx.fillStyle = this.car1.color;
        this.ctx.fillText(`Player 1 Laps: ${this.car1.lap}`, 10, 30);
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

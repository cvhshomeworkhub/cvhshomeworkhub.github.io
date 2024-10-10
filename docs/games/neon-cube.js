class Player {
    constructor(x, y, color, number, team, controls) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.color = color;
        this.number = number;
        this.team = team;
        this.controls = controls;
        this.velocity = { x: 0, y: 0 };
        this.speed = 5;
        this.hasCube = false;
    }

    update(canvas) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Boundary collision
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw player number
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(this.number, this.x + 15, this.y + 25);
        
        ctx.shadowBlur = 0;
    }
}

class Cube {
    constructor() {
        this.size = 30;
        this.x = Math.random() * (800 - this.size);
        this.y = Math.random() * (600 - this.size);
        this.velocity = { x: this.getRandomSpeed(), y: this.getRandomSpeed() };
        this.possessed = false;
        this.isPassing = false;
        this.passingSpeed = 15;
        this.targetX = 0;
        this.targetY = 0;
        this.teleportationTime = 0;
    }

    getRandomSpeed() {
        return (Math.random() * 4 - 2); // Random speed between -2 and 2
    }

    startPass(startX, startY, targetX, targetY) {
        this.isPassing = true;
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;

        // Calculate passing velocity
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.velocity.x = (dx / distance) * this.passingSpeed;
        this.velocity.y = (dy / distance) * this.passingSpeed;
    }

    teleport() {
        this.x = Math.random() * (800 - this.size);
        this.y = Math.random() * (600 - this.size);
        this.velocity = { x: this.getRandomSpeed(), y: this.getRandomSpeed() };
    }

    update(canvas) {
        if (this.isPassing) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            // Check if pass is complete
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
            if (distanceToTarget < 10) {
                this.isPassing = false;
            }
        } else if (!this.possessed) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            // Bounce off walls
            if (this.x <= 0 || this.x + this.size >= canvas.width) {
                this.velocity.x = -this.velocity.x;
            }
            if (this.y <= 0 || this.y + this.size >= canvas.height) {
                this.velocity.y = -this.velocity.y;
            }
        }

        // Handle teleportation every 6 seconds
        this.teleportationTime += 1 / 60; // Assuming 60 FPS
        if (this.teleportationTime >= 6) {
            this.teleport();
            this.teleportationTime = 0;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ffff00';
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        ctx.shadowBlur = 0;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Create teams
        this.team1 = [
            new Player(100, 200, '#00ffff', 1, 1, { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', action: 'KeyE' }),
            new Player(100, 300, '#00ffff', 2, 1, { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', action: 'KeyE' }),
            new Player(100, 400, '#00ffff', 3, 1, { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', action: 'KeyE' })
        ];

        this.team2 = [
            new Player(700, 200, '#ff00ff', 1, 2, { up: 'KeyI', down: 'KeyK', left: 'KeyJ', right: 'KeyL', action: 'KeyO' }),
            new Player(700, 300, '#ff00ff', 2, 2, { up: 'KeyI', down: 'KeyK', left: 'KeyJ', right: 'KeyL', action: 'KeyO' }),
            new Player(700, 400, '#ff00ff', 3, 2, { up: 'KeyI', down: 'KeyK', left: 'KeyJ', right: 'KeyL', action: 'KeyO' })
        ];

        this.cube = new Cube();
        this.keys = new Set();
        this.activePlayer1 = 0;
        this.activePlayer2 = 0;
        this.possessionTime = 0;
        this.possessingTeam = null;
        this.gameOver = false;

        this.setupControls();
        this.animate();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            this.handlePlayerSwitch(e);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }

    handlePlayerSwitch(e) {
        // Team 1 player switching
        if (['Digit1', 'Digit2', 'Digit3'].includes(e.code)) {
            const newActive = parseInt(e.key) - 1;
            if (newActive !== this.activePlayer1) {
                this.handleSwitch(1, newActive);
                this.activePlayer1 = newActive;
            }
        }

        // Team 2 player switching
        if (['Digit8', 'Digit9', 'Digit0'].includes(e.code)) {
            const newActive = e.code === 'Digit0' ? 2 : parseInt(e.key) - 8;
            if (newActive !== this.activePlayer2) {
                this.handleSwitch(2, newActive);
                this.activePlayer2 = newActive;
            }
        }

        // Handle stealing
        this.handleSteal();
    }

    handleSteal() {
        const currentHolder = [...this.team1, ...this.team2].find(player => player.hasCube);
        if (currentHolder) {
            const opposingTeam = currentHolder.team === 1 ? this.team2 : this.team1;
            const stealButton = currentHolder.team === 1 ? 'KeyO' : 'KeyE';

            opposingTeam.forEach(opponent => {
                const dx = (opponent.x + opponent.width / 2) - (currentHolder.x + currentHolder.width / 2);
                const dy = (opponent.y + opponent.height / 2) - (currentHolder.y + currentHolder.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 80 && this.keys.has(stealButton)) {
                    currentHolder.hasCube = false;
                    opponent.hasCube = true;
                    this.cube.possessed = true;
                    this.possessingTeam = opponent.team;
                    this.possessionTime = 0;
                }
            });
        }
    }

    handleSwitch(team, newActive) {
        const players = team === 1 ? this.team1 : this.team2;
        const oldActive = team === 1 ? this.activePlayer1 : this.activePlayer2;

        // Check if old active player had the cube
        if (players[oldActive].hasCube && !this.cube.isPassing) {
            const startX = players[oldActive].x + players[oldActive].width / 2 - this.cube.size / 2;
            const startY = players[oldActive].y + players[oldActive].height / 2 - this.cube.size / 2;
            const targetX = players[newActive].x + players[newActive].width / 2 - this.cube.size / 2;
            const targetY = players[newActive].y + players[newActive].height / 2 - this.cube.size / 2;
            this.cube.startPass(startX, startY, targetX, targetY);
            players[oldActive].hasCube = false;
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw players
        [...this.team1, ...this.team2].forEach(player => {
            player.update(this.canvas);
            player.draw(this.ctx);
        });

        // Update and draw cube
        this.cube.update(this.canvas);
        this.cube.draw(this.ctx);

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the game
const game = new Game();

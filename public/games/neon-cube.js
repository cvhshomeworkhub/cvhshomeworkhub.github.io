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
        this.velocity = {
            x: 0,
            y: 0
        };
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
        this.x = 400;
        this.y = 300;
        this.velocity = {
            x: this.getRandomSpeed(),
            y: this.getRandomSpeed()
        };
        this.possessed = false;
    }

    getRandomSpeed() {
        return (Math.random() * 6 - 3);
    }

    update(canvas) {
        if (!this.possessed) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            // Bounce off walls
            if (this.x <= 0 || this.x + this.size >= canvas.width) {
                this.velocity.x = -this.velocity.x;
                this.velocity.x += this.getRandomSpeed() * 0.2;
            }
            if (this.y <= 0 || this.y + this.size >= canvas.height) {
                this.velocity.y = -this.velocity.y;
                this.velocity.y += this.getRandomSpeed() * 0.2;
            }
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

            // Team 1 player switching
            if (e.code === 'Digit1') this.activePlayer1 = 0;
            if (e.code === 'Digit2') this.activePlayer1 = 1;
            if (e.code === 'Digit3') this.activePlayer1 = 2;

            // Team 2 player switching
            if (e.code === 'Digit8') this.activePlayer2 = 0;
            if (e.code === 'Digit9') this.activePlayer2 = 1;
            if (e.code === 'Digit0') this.activePlayer2 = 2;
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }

    handleInput() {
        // Team 1 active player
        let player1 = this.team1[this.activePlayer1];
        player1.velocity.x = 0;
        player1.velocity.y = 0;

        if (this.keys.has('KeyW')) player1.velocity.y = -player1.speed;
        if (this.keys.has('KeyS')) player1.velocity.y = player1.speed;
        if (this.keys.has('KeyA')) player1.velocity.x = -player1.speed;
        if (this.keys.has('KeyD')) player1.velocity.x = player1.speed;

        // Team 2 active player
        let player2 = this.team2[this.activePlayer2];
        player2.velocity.x = 0;
        player2.velocity.y = 0;

        if (this.keys.has('KeyI')) player2.velocity.y = -player2.speed;
        if (this.keys.has('KeyK')) player2.velocity.y = player2.speed;
        if (this.keys.has('KeyJ')) player2.velocity.x = -player2.speed;
        if (this.keys.has('KeyL')) player2.velocity.x = player2.speed;
    }

    checkCubeInteraction() {
        const checkDistance = (player) => {
            const dx = (player.x + player.width/2) - (this.cube.x + this.cube.size/2);
            const dy = (player.y + player.height/2) - (this.cube.y + this.cube.size/2);
            return Math.sqrt(dx*dx + dy*dy) < 60;
        };

        // Check for cube possession
        [...this.team1, ...this.team2].forEach(player => {
            if (checkDistance(player)) {
                if (!this.cube.possessed && 
                    ((player.team === 1 && this.keys.has('KeyE')) || 
                     (player.team === 2 && this.keys.has('KeyO')))) {
                    this.cube.possessed = true;
                    player.hasCube = true;
                    this.possessingTeam = player.team;
                }
            }
        });

        // Update cube position if possessed
        [...this.team1, ...this.team2].forEach(player => {
            if (player.hasCube) {
                this.cube.x = player.x + player.width/2 - this.cube.size/2;
                this.cube.y = player.y + player.height/2 - this.cube.size/2;
            }
        });
    }

    update() {
        if (this.gameOver) return;

        this.handleInput();
        
        [...this.team1, ...this.team2].forEach(player => player.update(this.canvas));
        this.cube.update(this.canvas);
        
        this.checkCubeInteraction();

        // Update possession time
        if (this.cube.possessed) {
            this.possessionTime += 1/60; // Assuming 60 FPS
            if (this.possessionTime >= 14) {
                this.endGame(this.possessingTeam);
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw possession timer
        if (this.cube.possessed) {
            const width = (this.possessionTime / 14) * this.canvas.width;
            this.ctx.fillStyle = this.possessingTeam === 1 ? '#00ffff' : '#ff00ff';
            this.ctx.fillRect(0, 0, width, 5);
        }

        // Draw all game objects
        [...this.team1, ...this.team2].forEach(player => player.draw(this.ctx));
        this.cube.draw(this.ctx);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    endGame(winner) {
        this.gameOver = true;
        document.getElementById('winner').textContent = `Team ${winner} Wins!`;
        document.getElementById('gameOver').style.display = 'block';
    }
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    window.game = new Game();
}

window.onload = () => {
    window.game = new Game();
};

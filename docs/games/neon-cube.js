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
        this.passingSpeed = 15;
        this.isPassing = false;
        this.targetX = 0;
        this.targetY = 0;
    }

    getRandomSpeed() {
        return (Math.random() * 6 - 3);
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

    update(canvas) {
        if (this.isPassing) {
            // Update position during pass
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
        
        // Draw passing trail if cube is being passed
        if (this.isPassing) {
            ctx.beginPath();
            ctx.strokeStyle = '#ffff00';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffff00';
            ctx.moveTo(this.x + this.size/2, this.y + this.size/2);
            ctx.lineTo(this.targetX + this.size/2, this.targetY + this.size/2);
            ctx.stroke();
        }
        
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
        this.lastActivePlayer1 = 0;
        this.lastActivePlayer2 = 0;

        this.setupControls();
        this.animate();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);

            // Team 1 player switching
            if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') {
                const newActive = parseInt(e.key) - 1;
                if (newActive !== this.activePlayer1) {
                    this.handlePlayerSwitch(1, newActive);
                    this.activePlayer1 = newActive;
                }
            }

            // Team 2 player switching
            if (e.code === 'Digit8' || e.code === 'Digit9' || e.code === 'Digit0') {
                const newActive = e.code === 'Digit0' ? 2 : parseInt(e.key) - 8;
                if (newActive !== this.activePlayer2) {
                    this.handlePlayerSwitch(2, newActive);
                    this.activePlayer2 = newActive;
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }

    handlePlayerSwitch(team, newActive) {
        const players = team === 1 ? this.team1 : this.team2;
        const oldActive = team === 1 ? this.activePlayer1 : this.activePlayer2;
        
        // Check if old active player had the cube
        if (players[oldActive].hasCube && !this.cube.isPassing) {
            // Start pass to new active player
            const startX = players[oldActive].x + players[oldActive].width/2 - this.cube.size/2;
            const startY = players[oldActive].y + players[oldActive].height/2 - this.cube.size/2;
            const targetX = players[newActive].x + players[newActive].width/2 - this.cube.size/2;
            const targetY = players[newActive].y + players[newActive].height/2 - this.cube.size/2;
            
            players[oldActive].hasCube = false;
            this.cube.startPass(startX, startY, targetX, targetY);
            
            // After a short delay, give the cube to the new player
            setTimeout(() => {
                if (!this.gameOver) {
                    this.cube.isPassing = false;
                    players[newActive].hasCube = true;
                    this.cube.possessed = true;
                }
            }, 200);
        }
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
        if (this.cube.isPassing) return;

        const checkDistance = (player) => {
            const dx = (player.x + player.width/2) - (this.cube.x + this.cube.size/2);
            const dy = (player.y + player.height/2) - (this.cube.y + this.cube.size/2);
            return Math.sqrt(dx*dx + dy*dy) < 60;
        };

        // Check for stealing
        if (this.cube.possessed) {
            const currentHolder = [...this.team1, ...this.team2].find(player => player.hasCube);
            const opposingTeam = currentHolder.team === 1 ? this.team2 : this.team1;
            const stealButton = currentHolder.team === 1 ? 'KeyO' : 'KeyE';
            
            // Check if any opposing player is close enough to steal
            opposingTeam.forEach(opponent => {
                const dx = (opponent.x + opponent.width/2) - (currentHolder.x + currentHolder.width/2);
                const dy = (opponent.y + opponent.height/2) - (currentHolder.y + currentHolder.height/2);
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 80 && this.keys.has(stealButton)) {  // Slightly larger radius for stealing
                    // Steal the cube
                    currentHolder.hasCube = false;
                    opponent.hasCube = true;
                    this.possessingTeam = opponent.team;
                    this.possessionTime = 0;  // Reset possession timer
                    
                    // Add visual effect for stealing
                    this.createStealEffect(opponent.x, opponent.y);
                }
            });
        }

        // Check for initial cube possession
        if (!this.cube.possessed) {
            [...this.team1, ...this.team2].forEach(player => {
                if (checkDistance(player)) {
                    if ((player.team === 1 && this.keys.has('KeyE')) || 
                        (player.team === 2 && this.keys.has('KeyO'))) {
                        this.cube.possessed = true;
                        player.hasCube = true;
                        this.possessingTeam = player.team;
                        this.possessionTime = 0;
                    }
                }
            });
        }

        // Update cube position if possessed
        [...this.team1, ...this.team2].forEach(player => {
            if (player.hasCube) {
                this.cube.x = player.x + player.width/2 - this.cube.size/2;
                this.cube.y = player.y + player.height/2 - this.cube.size/2;
            }
        });
    }

    // Add visual effect when stealing occurs
    createStealEffect(x, y) {
        const effect = {
            x: x,
            y: y,
            radius: 0,
            opacity: 1,
            maxRadius: 60
        };
        
        this.stealEffects = this.stealEffects || [];
        this.stealEffects.push(effect);
    }

    update() {
        if (this.gameOver) return;

        this.handleInput();
        
        [...this.team1, ...this.team2].forEach(player => player.update(this.canvas));
        this.cube.update(this.canvas);
        
        this.checkCubeInteraction();

        // Update possession time
        if (this.cube.possessed && !this.cube.isPassing) {
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

        // Draw steal effects
        if (this.stealEffects) {
            this.stealEffects.forEach((effect, index) => {
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(255, 255, 0, ${effect.opacity})`;
                this.ctx.lineWidth = 2;
                this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Update effect
                effect.radius += 3;
                effect.opacity -= 0.05;
                
                // Remove completed effects
                if (effect.radius >= effect.maxRadius) {
                    this.stealEffects.splice(index, 1);
                }
            });
        }
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

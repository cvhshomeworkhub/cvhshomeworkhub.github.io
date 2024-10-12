// Constants
const GRID_SIZE = 32;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Game objects
class GameObject {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Player extends GameObject {
    constructor(x, y) {
        super(x, y, GRID_SIZE, GRID_SIZE, '#00ffff');
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.invincible = false;
        this.ironSkinHits = 0;
        this.canFly = false;
        this.speedBoost = 1;
    }

    update(gameObjects) {
        // Apply gravity
        if (!this.canFly) {
            this.velocityY += 0.5;
        }

        // Apply movement
        this.x += this.velocityX * this.speedBoost;
        this.y += this.velocityY;

        // Check collisions
        this.checkCollisions(gameObjects);
    }

    checkCollisions(gameObjects) {
        for (let obj of gameObjects) {
            if (obj instanceof Platform) {
                if (this.x < obj.x + obj.width &&
                    this.x + this.width > obj.x &&
                    this.y < obj.y + obj.height &&
                    this.y + this.height > obj.y) {
                    // Collision detected
                    if (this.velocityY > 0) {
                        // Landing on platform
                        this.y = obj.y - this.height;
                        this.velocityY = 0;
                        this.isJumping = false;
                    } else if (this.velocityY < 0) {
                        // Hitting platform from below
                        this.y = obj.y + obj.height;
                        this.velocityY = 0;
                    }
                }
            } else if (obj instanceof Hazard && !this.invincible) {
                if (this.x < obj.x + obj.width &&
                    this.x + this.width > obj.x &&
                    this.y < obj.y + obj.height &&
                    this.y + this.height > obj.y) {
                    // Collision with hazard
                    if (this.ironSkinHits > 0) {
                        this.ironSkinHits--;
                    } else {
                        // Player dies
                        return true;
                    }
                }
            }
        }
        return false;
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = -10;
            this.isJumping = true;
        }
    }
}

class Platform extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height, '#ff00ff');
    }
}

class Hazard extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height, '#ff4500');
    }
}

class Coin extends GameObject {
    constructor(x, y) {
        super(x, y, GRID_SIZE / 2, GRID_SIZE / 2, '#ffd700');
    }
}

class Checkpoint extends GameObject {
    constructor(x, y) {
        super(x, y, GRID_SIZE, GRID_SIZE * 2, '#00ff00');
    }
}

class EndFlag extends GameObject {
    constructor(x, y) {
        super(x, y, GRID_SIZE, GRID_SIZE * 2, '#ffffff');
    }
}

class PowerUp extends GameObject {
    constructor(x, y, type) {
        super(x, y, GRID_SIZE, GRID_SIZE, '#ffffff');
        this.type = type;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        switch (this.type) {
            case 'invincibility':
                ctx.fillStyle = '#c0c0c0';
                ctx.arc(this.x + GRID_SIZE/2, this.y + GRID_SIZE/2, GRID_SIZE/2, 0, Math.PI * 2);
                break;
            case 'ironSkin':
                ctx.fillStyle = '#0000ff';
                ctx.moveTo(this.x, this.y + GRID_SIZE);
                ctx.lineTo(this.x + GRID_SIZE/2, this.y);
                ctx.lineTo(this.x + GRID_SIZE, this.y + GRID_SIZE);
                break;
            case 'fly':
                ctx.fillStyle = '#ff0000';
                ctx.font = `${GRID_SIZE}px Arial`;
                ctx.fillText('S', this.x, this.y + GRID_SIZE);
                break;
            case 'speed':
                ctx.fillStyle = '#ffff00';
                ctx.moveTo(this.x, this.y + GRID_SIZE/2);
                ctx.lineTo(this.x + GRID_SIZE, this.y + GRID_SIZE/2);
                ctx.lineTo(this.x + GRID_SIZE/2, this.y + GRID_SIZE);
                break;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Game class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.gameObjects = [];
        this.player = new Player(GRID_SIZE, CANVAS_HEIGHT - GRID_SIZE * 2);
        this.gameMode = 'create'; // 'play' or 'create'
        this.currentTool = 'platform';
        this.score = 0;
        this.coinsCollected = 0;
        this.totalCoins = 0;
        this.addInitialObjects();
        this.initEventListeners();
    }

    initEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    handleKeyDown(e) {
        if (this.gameMode === 'play') {
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    this.player.velocityX = -5;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.player.velocityX = 5;
                    break;
                case 'ArrowUp':
                case 'w':
                    this.player.jump();
                    break;
                case 'ArrowDown':
                case 's':
                    // Implement crouching if needed
                    break;
            }
        }
    }

    handleKeyUp(e) {
        if (this.gameMode === 'play') {
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'a':
                case 'd':
                    this.player.velocityX = 0;
                    break;
            }
        }
    }

    handleCanvasClick(e) {
        if (this.gameMode === 'create') {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
            const y = Math.floor((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE;

            switch (this.currentTool) {
                case 'platform':
                    this.gameObjects.push(new Platform(x, y, GRID_SIZE, GRID_SIZE));
                    break;
                case 'hazard':
                    this.gameObjects.push(new Hazard(x, y, GRID_SIZE, GRID_SIZE));
                    break;
                case 'coin':
                    this.gameObjects.push(new Coin(x, y));
                    this.totalCoins++;
                    break;
                case 'checkpoint':
                    this.gameObjects.push(new Checkpoint(x, y));
                    break;
                case 'endFlag':
                    this.gameObjects.push(new EndFlag(x, y));
                    break;
                case 'powerUp':
                    const powerUpTypes = ['invincibility', 'ironSkin', 'fly', 'speed'];
                    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                    this.gameObjects.push(new PowerUp(x, y, randomType));
                    break;
            }
        }
    }

    addInitialObjects() {
        // Add a floor
        this.gameObjects.push(new Platform(0, CANVAS_HEIGHT - GRID_SIZE, CANVAS_WIDTH, GRID_SIZE));
        
        // Add some platforms
        this.gameObjects.push(new Platform(GRID_SIZE * 5, CANVAS_HEIGHT - GRID_SIZE * 5, GRID_SIZE * 3, GRID_SIZE));
        this.gameObjects.push(new Platform(GRID_SIZE * 10, CANVAS_HEIGHT - GRID_SIZE * 8, GRID_SIZE * 3, GRID_SIZE));
        
        // Add a coin
        this.gameObjects.push(new Coin(GRID_SIZE * 6, CANVAS_HEIGHT - GRID_SIZE * 6));
        this.totalCoins++;
        
        // Add an end flag
        this.gameObjects.push(new EndFlag(CANVAS_WIDTH - GRID_SIZE * 2, CANVAS_HEIGHT - GRID_SIZE * 3));
    }
    
    update() {
        if (this.gameMode === 'play') {
            this.player.update(this.gameObjects);

            // Check for coin collection
            this.gameObjects = this.gameObjects.filter(obj => {
                if (obj instanceof Coin) {
                    if (this.player.x < obj.x + obj.width &&
                        this.player.x + this.player.width > obj.x &&
                        this.player.y < obj.y + obj.height &&
                        this.player.y + this.player.height > obj.y) {
                        this.score += 100;
                        this.coinsCollected++;
                        return false;
                    }
                }
                return true;
            });

            // Check for power-up collection
            this.gameObjects = this.gameObjects.filter(obj => {
                if (obj instanceof PowerUp) {
                    if (this.player.x < obj.x + obj.width &&
                        this.player.x + this.player.width > obj.x &&
                        this.player.y < obj.y + obj.height &&
                        this.player.y + this.player.height > obj.y) {
                        this.applyPowerUp(obj.type);
                        return false;
                    }
                }
                return true;
            });

            // Check for level completion
            const endFlag = this.gameObjects.find(obj => obj instanceof EndFlag);
            if (endFlag) {
                if (this.player.x < endFlag.x + endFlag.width &&
                    this.player.x + this.player.width > endFlag.x &&
                    this.player.y < endFlag.y + endFlag.height &&
                    this.player.y + this.player.height > endFlag.y) {
                    if (this.coinsCollected === this.totalCoins) {
                        this.levelComplete();
                    }
                }
            }
        }
    }

    applyPowerUp(type) {
        switch (type) {
            case 'invincibility':
                this.player.invincible = true;
                setTimeout(() => { this.player.invincible = false; }, 6000);
                break;
            case 'ironSkin':
                this.player.ironSkinHits = 4;
                break;
            case 'fly':
                this.player.canFly = true;
                setTimeout(() => { this.player.canFly = false; }, 10000);
                break;
            case 'speed':
                this.player.speedBoost = 3;
                setTimeout(() => { this.player.speedBoost = 1; }, 5000);
                break;
        }
    }

    levelComplete() {
        alert('Level Complete!');
        // Implement level completion logic (e.g., load next level, return to menu)
    }

    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let obj of this.gameObjects) {
            obj.draw(this.ctx);
        }

        // Always draw the player, even in create mode
        this.player.draw(this.ctx);

        // Draw score and coin count
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Coins: ${this.coinsCollected}/${this.totalCoins}`, 10, 60);
        
        // Draw current mode
        this.ctx.fillText(`Mode: ${this.gameMode}`, 10, 90);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.gameLoop();
    }

    function setGameMode(mode) {
    // Call the instance method directly
    game.setGameMode(mode);

    // Update the UI based on the game mode
    document.getElementById('creatorTools').style.display = mode === 'create' ? 'block' : 'none';
    
    // Update button styles
    document.querySelector(`button[onclick="setGameMode('play')"]`).classList.toggle('active', mode === 'play');
    document.querySelector(`button[onclick="setGameMode('create')"]`).classList.toggle('active', mode === 'create');
}


    setCurrentTool(tool) {
        this.currentTool = tool;
    }

    exportLevel() {
        const levelData = this.gameObjects.map(obj => ({
            type: obj.constructor.name,
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
            color: obj.color,
            powerUpType: obj instanceof PowerUp ? obj.type : undefined
        }));
        return btoa(JSON.stringify(levelData));
    }

    importLevel(code) {
        try {
            const levelData = JSON.parse(atob(code));
            this.gameObjects = levelData.map(obj => {
                switch (obj.type) {
                    case 'Platform':
                        return new Platform(obj.x, obj.y, obj.width, obj.height);
                    case 'Hazard':
                        return new Hazard(obj.x, obj.y, obj.width, obj.height);
                    case 'Coin':
                        this.totalCoins++;
                        return new Coin(obj.x, obj.y);
                    case 'Checkpoint':
                        return new Checkpoint(obj.x, obj.y);
                    case 'EndFlag':
                        return new EndFlag(obj.x, obj.y);
                    case 'PowerUp':
                        return new PowerUp(obj.x, obj.y, obj.powerUpType);
                }
            });
            this.coinsCollected = 0;
            this.score = 0;
        } catch (error) {
            console.error('Invalid level code');
        }
    }
}

// Initialize the game
const game = new Game();
game.start();

// Expose functions for UI interaction
window.setGameMode = (mode) => game.setGameMode(mode);
window.setCurrentTool = (tool) => game.setCurrentTool(tool);
window.exportLevel = () => game.exportLevel();
window.importLevel = (code) => game.importLevel(code);
</antArtifact>

// Initialize the game
const game = new Game();
game.start();

// Expose functions for UI interaction
window.setGameMode = (mode) => game.setGameMode(mode);
window.setCurrentTool = (tool) => game.setCurrentTool(tool);
window.exportLevel = () => game.exportLevel();
window.importLevel = (code) => game.importLevel(code);

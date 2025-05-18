import { Scene } from '../core/Scene';
import { Tetromino } from '../entities/Tetromino';
import { InputManager } from '../core/InputManager';
import { Game } from '../core/Game';

interface GridCell {
    color: string;
    filled: boolean;
}

export class TetrisScene extends Scene {
    private currentPiece: Tetromino | null = null;
    private nextPiece: Tetromino | null = null;
    private grid: GridCell[][] = [];
    private score: number = 0;
    private level: number = 1;
    private gameOver: boolean = false;
    private inputManager: InputManager;
    private game: Game;
    private dropTimer: number = 0;
    private dropInterval: number = 1.0; // Tiempo en segundos entre caídas
    private gridWidth: number = 10;
    private gridHeight: number = 20;
    private gridSize: number = 30;
    private pieceTypes: string[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    private moveTimers: { [key: string]: number } = { left: 0, right: 0, down: 0 };
    private moveDelay: number = 0.15; // segundos entre movimientos repetidos
    private moveInitialDelay: number = 0.2; // retardo inicial
    private moveHeld: { [key: string]: boolean } = { left: false, right: false, down: false };

    constructor(game: Game) {
        super();
        this.game = game;
        this.inputManager = InputManager.getInstance();
        this.initializeGrid();
    }

    private initializeGrid(): void {
        this.grid = Array(this.gridHeight).fill(null).map(() =>
            Array(this.gridWidth).fill(null).map(() => ({
                color: '#000',
                filled: false
            }))
        );
    }

    public init(): void {
        this.spawnNewPiece();
    }

    public update(deltaTime: number): void {
        // Volver al menú con Escape
        if (this.inputManager.isKeyPressed('Escape')) {
            this.game.returnToMainMenu();
            return;
        }
        if (this.gameOver) {
            if (this.inputManager.isKeyPressed('Enter')) {
                this.game.returnToMainMenu();
            }
            return;
        }

        // Manejar entrada del usuario con retardo
        this.handleInputWithDelay(deltaTime);

        // Actualizar la caída de la pieza
        this.dropTimer += deltaTime;
        if (this.dropTimer >= this.dropInterval) {
            this.dropTimer = 0;
            this.moveDown();
        }

        // Actualizar la pieza actual
        if (this.currentPiece) {
            this.currentPiece.update(deltaTime);
        }
    }

    private handleInputWithDelay(deltaTime: number): void {
        // Flecha izquierda
        if (this.inputManager.isKeyPressed('ArrowLeft')) {
            if (!this.moveHeld.left) {
                this.moveLeft();
                this.moveTimers.left = this.moveInitialDelay;
                this.moveHeld.left = true;
            } else {
                this.moveTimers.left -= deltaTime;
                if (this.moveTimers.left <= 0) {
                    this.moveLeft();
                    this.moveTimers.left = this.moveDelay;
                }
            }
        } else {
            this.moveHeld.left = false;
        }
        // Flecha derecha
        if (this.inputManager.isKeyPressed('ArrowRight')) {
            if (!this.moveHeld.right) {
                this.moveRight();
                this.moveTimers.right = this.moveInitialDelay;
                this.moveHeld.right = true;
            } else {
                this.moveTimers.right -= deltaTime;
                if (this.moveTimers.right <= 0) {
                    this.moveRight();
                    this.moveTimers.right = this.moveDelay;
                }
            }
        } else {
            this.moveHeld.right = false;
        }
        // Flecha abajo
        if (this.inputManager.isKeyPressed('ArrowDown')) {
            if (!this.moveHeld.down) {
                this.moveDown();
                this.moveTimers.down = this.moveInitialDelay;
                this.moveHeld.down = true;
            } else {
                this.moveTimers.down -= deltaTime;
                if (this.moveTimers.down <= 0) {
                    this.moveDown();
                    this.moveTimers.down = this.moveDelay;
                }
            }
        } else {
            this.moveHeld.down = false;
        }
        // Rotación y hard drop siguen igual
        if (this.inputManager.isKeyPressed('ArrowUp')) {
            this.rotate();
        }
        if (this.inputManager.isKeyPressed(' ')) {
            this.hardDrop();
        }
    }

    private moveLeft(): void {
        if (!this.currentPiece) return;
        this.currentPiece.move(-1, 0);
        if (this.checkCollision()) {
            this.currentPiece.move(1, 0);
        }
    }

    private moveRight(): void {
        if (!this.currentPiece) return;
        this.currentPiece.move(1, 0);
        if (this.checkCollision()) {
            this.currentPiece.move(-1, 0);
        }
    }

    private moveDown(): void {
        if (!this.currentPiece) return;
        this.currentPiece.move(0, 1);
        if (this.checkCollision()) {
            this.currentPiece.move(0, -1);
            this.lockPiece();
            this.clearLines();
            this.spawnNewPiece();
        }
    }

    private rotate(): void {
        if (!this.currentPiece) return;
        this.currentPiece.rotate();
        if (this.checkCollision()) {
            // Intentar wall kick
            this.currentPiece.move(-1, 0);
            if (this.checkCollision()) {
                this.currentPiece.move(2, 0);
                if (this.checkCollision()) {
                    this.currentPiece.move(-1, 0);
                    this.currentPiece.rotate();
                    this.currentPiece.rotate();
                    this.currentPiece.rotate();
                }
            }
        }
    }

    private hardDrop(): void {
        if (!this.currentPiece) return;
        while (!this.checkCollision()) {
            this.currentPiece.move(0, 1);
        }
        this.currentPiece.move(0, -1);
        this.lockPiece();
        this.clearLines();
        this.spawnNewPiece();
    }

    private checkCollision(): boolean {
        if (!this.currentPiece) return true;

        const blocks = this.currentPiece.getBlocks();
        return blocks.some(block => {
            const gridX = Math.floor(block.x);
            const gridY = Math.floor(block.y);

            return gridX < 0 || 
                   gridX >= this.gridWidth || 
                   gridY >= this.gridHeight ||
                   (gridY >= 0 && this.grid[gridY][gridX].filled);
        });
    }

    private lockPiece(): void {
        if (!this.currentPiece) return;

        const blocks = this.currentPiece.getBlocks();
        // Obtener el color real de la pieza
        // @ts-ignore
        const color = (this.currentPiece as any).colors[this.currentPiece.getType()];
        blocks.forEach(block => {
            const gridX = Math.floor(block.x);
            const gridY = Math.floor(block.y);
            if (gridY >= 0) {
                this.grid[gridY][gridX] = {
                    color: color,
                    filled: true
                };
            }
        });
    }

    private clearLines(): void {
        let linesCleared = 0;

        for (let y = this.gridHeight - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell.filled)) {
                // Eliminar la línea
                this.grid.splice(y, 1);
                // Añadir una nueva línea vacía al principio
                this.grid.unshift(Array(this.gridWidth).fill(null).map(() => ({
                    color: '#000',
                    filled: false
                })));
                linesCleared++;
                y++; // Revisar la misma línea de nuevo
            }
        }

        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }
    }

    private updateScore(linesCleared: number): void {
        const points = [0, 100, 300, 500, 800];
        this.score += points[linesCleared] * this.level;
        
        // Aumentar nivel cada 10 líneas
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(0.1, 1.0 - (this.level - 1) * 0.1);
        }
    }

    private spawnNewPiece(): void {
        const types = this.pieceTypes;
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        this.currentPiece = this.nextPiece || new Tetromino(randomType, 3, 0);
        this.nextPiece = new Tetromino(types[Math.floor(Math.random() * types.length)], 3, 0);

        if (this.checkCollision()) {
            this.gameOver = true;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Limpiar el canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 800, 600);

        // Dibujar la cuadrícula
        this.drawGrid(ctx);

        // Dibujar la pieza actual
        if (this.currentPiece) {
            this.currentPiece.draw(ctx);
        }

        // Dibujar la siguiente pieza y la información a la derecha
        ctx.save();
        ctx.translate(500, 100);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Siguiente:', 100, 0);
        ctx.translate(70, 30);
        if (this.nextPiece) {
            this.nextPiece.draw(ctx);
        }
        ctx.restore();

        // Puntaje y nivel ordenados debajo del bloque siguiente
        ctx.save();
        ctx.translate(500, 200);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Puntaje: ${this.score}`, 0, 0);
        ctx.fillText(`Nivel: ${this.level}`, 0, 40);
        ctx.restore();

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, 800, 600);
            ctx.fillStyle = '#fff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('¡Game Over!', 400, 250);
            ctx.font = '24px Arial';
            ctx.fillText(`Puntaje final: ${this.score}`, 400, 300);
            ctx.fillText('Presiona Enter para volver al menú', 400, 350);
        }

        // Instrucción ESC en la esquina inferior derecha
        ctx.font = '18px Arial';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'right';
        ctx.fillText('ESC: Volver al menú', 780, 580);
    }

    private drawGrid(ctx: CanvasRenderingContext2D): void {
        // Dibujar el fondo de la cuadrícula
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, this.gridWidth * this.gridSize, this.gridHeight * this.gridSize);

        // Dibujar las líneas de la cuadrícula
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        // Líneas verticales
        for (let x = 0; x <= this.gridWidth; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.gridSize, 0);
            ctx.lineTo(x * this.gridSize, this.gridHeight * this.gridSize);
            ctx.stroke();
        }

        // Líneas horizontales
        for (let y = 0; y <= this.gridHeight; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.gridSize);
            ctx.lineTo(this.gridWidth * this.gridSize, y * this.gridSize);
            ctx.stroke();
        }

        // Dibujar los bloques fijos
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x].filled) {
                    const color = this.grid[y][x].color;
                    const blockX = x * this.gridSize;
                    const blockY = y * this.gridSize;

                    // Gradiente para el bloque
                    const gradient = ctx.createLinearGradient(
                        blockX, blockY,
                        blockX + this.gridSize,
                        blockY + this.gridSize
                    );
                    gradient.addColorStop(0, color);
                    gradient.addColorStop(1, this.darkenColor(color, 30));

                    ctx.fillStyle = gradient;
                    ctx.fillRect(blockX, blockY, this.gridSize, this.gridSize);

                    // Borde
                    ctx.strokeStyle = this.darkenColor(color, 50);
                    ctx.lineWidth = 2;
                    ctx.strokeRect(blockX, blockY, this.gridSize, this.gridSize);

                    // Brillo
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.fillRect(blockX + 2, blockY + 2, this.gridSize - 4, 4);
                }
            }
        }
    }

    private darkenColor(color: string, amount: number): string {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
} 
import { Scene } from '../core/Scene';
import { Snake } from '../entities/Snake';
import { Apple } from '../entities/Apple';
import { InputManager } from '../core/InputManager';
import { Game } from '../core/Game';
import { MainMenu } from './MainMenu';

export class SnakeScene extends Scene {
    private snake: Snake;
    private apple: Apple;
    private score: number = 0;
    private gameOver: boolean = false;
    private inputManager: InputManager;
    private game: Game;

    constructor(game: Game) {
        super();
        this.game = game;
        this.inputManager = InputManager.getInstance();
        this.snake = new Snake(400, 300);
        this.apple = new Apple(0, 0);
        this.spawnApple();
    }

    public init(): void {
        this.addEntity(this.snake);
        this.addEntity(this.apple);
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

        // Actualizar la serpiente
        this.snake.update(deltaTime);

        // Verificar colisión con la manzana
        if (this.checkAppleCollision()) {
            this.snake.grow();
            this.score += 10;
            this.spawnApple();
        }

        // Verificar colisión con la serpiente misma
        if (this.snake.checkSelfCollision() || this.snake.checkWallCollision()) {
            this.gameOver = true;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Limpiar el canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 800, 600);

        // Dibujar el puntaje
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Puntaje: ${this.score}`, 20, 40);

        // Instrucción ESC
        ctx.font = '18px Arial';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'right';
        ctx.fillText('ESC: Volver al menú', 780, 580);

        // Dibujar las entidades
        super.draw(ctx);

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
    }

    private checkAppleCollision(): boolean {
        return this.snake.checkCollision(this.apple.x, this.apple.y);
    }

    private spawnApple(): void {
        let newX: number;
        let newY: number;
        let validPosition: boolean;

        do {
            validPosition = true;
            newX = Math.floor(Math.random() * 40) * 20;
            newY = Math.floor(Math.random() * 30) * 20;

            // Verificar que la manzana no aparezca sobre la serpiente
            if (this.snake.checkCollision(newX, newY)) {
                validPosition = false;
            }
        } while (!validPosition);

        this.apple.setPosition(newX, newY);
    }
} 
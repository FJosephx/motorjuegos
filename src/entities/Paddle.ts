import { Entity } from '../core/Entity';
import { InputManager } from '../core/InputManager';

export class Paddle extends Entity {
    private speed: number = 400; // píxeles por segundo
    private inputManager: InputManager;

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height);
        this.inputManager = InputManager.getInstance();
    }

    public update(deltaTime: number): void {
        // Mover la paleta con las teclas W y S
        if (this.inputManager.isKeyPressed('ArrowUp')) {
            this.velocityY = -this.speed;
        } else if (this.inputManager.isKeyPressed('ArrowDown')) {
            this.velocityY = this.speed;
        } else {
            this.velocityY = 0;
        }

        super.update(deltaTime);

        // Limitar la paleta dentro del canvas
        if (this.y < 0) {
            this.y = 0;
        } else if (this.y + this.height > 600) {
            this.y = 600 - this.height;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
} 
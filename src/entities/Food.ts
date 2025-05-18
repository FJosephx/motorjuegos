import { Entity } from '../core/Entity';

export class Food extends Entity {
    private gridSize: number = 20;

    constructor() {
        super(0, 0, 20, 20);
        this.randomizePosition();
    }

    public randomizePosition(): void {
        // Generar posición aleatoria en la cuadrícula
        this.x = Math.floor(Math.random() * (780 / this.gridSize)) * this.gridSize;
        this.y = Math.floor(Math.random() * (580 / this.gridSize)) * this.gridSize;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
} 
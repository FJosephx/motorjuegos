import { Entity } from '../core/Entity';

export class Apple extends Entity {
    private rotation: number = 0;
    private rotationSpeed: number = 0.5;

    constructor(x: number, y: number) {
        super(x, y, 20, 20);
    }

    public setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public update(deltaTime: number): void {
        // Hacer que la manzana rote suavemente
        this.rotation += this.rotationSpeed * deltaTime;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const radius = this.width / 2 - 2;

        // Guardar el estado actual del contexto
        ctx.save();
        
        // Rotar la manzana
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        ctx.translate(-centerX, -centerY);

        // Dibujar la manzana con gradiente
        const gradient = ctx.createRadialGradient(
            centerX - radius / 3,
            centerY - radius / 3,
            0,
            centerX,
            centerY,
            radius
        );
        gradient.addColorStop(0, '#ff3333');
        gradient.addColorStop(1, '#cc0000');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar el tallo
        ctx.strokeStyle = '#663300';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius);
        ctx.quadraticCurveTo(
            centerX + 5,
            centerY - radius - 5,
            centerX + 5,
            centerY - radius - 10
        );
        ctx.stroke();

        // Dibujar el brillo
        const highlightGradient = ctx.createRadialGradient(
            centerX - radius / 3,
            centerY - radius / 3,
            0,
            centerX - radius / 3,
            centerY - radius / 3,
            radius / 3
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(
            centerX - radius / 3,
            centerY - radius / 3,
            radius / 3,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Dibujar la hoja con gradiente
        const leafGradient = ctx.createLinearGradient(
            centerX + radius / 2,
            centerY - radius / 2,
            centerX + radius,
            centerY - radius
        );
        leafGradient.addColorStop(0, '#00ff00');
        leafGradient.addColorStop(1, '#006600');

        ctx.fillStyle = leafGradient;
        ctx.beginPath();
        ctx.ellipse(
            centerX + radius / 2,
            centerY - radius / 2,
            radius / 3,
            radius / 6,
            Math.PI / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Restaurar el estado del contexto
        ctx.restore();
    }
} 
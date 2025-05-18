import { Entity } from '../core/Entity';

export class Ball extends Entity {
    private speed: number = 300; // píxeles por segundo
    private initialSpeed: number = 300;
    private maxSpeed: number = 500;
    private speedIncrease: number = 20;

    constructor(x: number, y: number, size: number) {
        super(x, y, size, size);
        this.reset();
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);

        // Rebotar en los bordes superior e inferior
        if (this.y <= 0 || this.y + this.height >= 600) {
            this.velocityY *= -1;
            // Asegurar que la pelota no se quede pegada al borde
            this.y = this.y <= 0 ? 0 : 600 - this.height;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    public reset(): void {
        this.x = 400 - this.width / 2;
        this.y = 300 - this.height / 2;
        this.speed = this.initialSpeed;
        
        // Dirección aleatoria pero con un ángulo mínimo para evitar movimientos muy verticales
        const angle = (Math.random() * Math.PI / 2 + Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1);
        this.velocityX = Math.cos(angle) * this.speed;
        this.velocityY = Math.sin(angle) * this.speed;
    }

    public increaseSpeed(): void {
        if (this.speed < this.maxSpeed) {
            this.speed += this.speedIncrease;
            const currentAngle = Math.atan2(this.velocityY, this.velocityX);
            this.velocityX = Math.cos(currentAngle) * this.speed;
            this.velocityY = Math.sin(currentAngle) * this.speed;
        }
    }

    public bounce(angle: number): void {
        // Ajustar la velocidad basada en dónde golpea la paleta
        const newAngle = angle * (Math.PI / 4); // Convertir a radianes y limitar el ángulo
        this.velocityX = Math.cos(newAngle) * this.speed * (this.velocityX > 0 ? -1 : 1);
        this.velocityY = Math.sin(newAngle) * this.speed;
    }
} 
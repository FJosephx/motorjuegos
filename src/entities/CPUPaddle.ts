import { Entity } from '../core/Entity';
import { Ball } from './Ball';

export class CPUPaddle extends Entity {
    private speed: number = 300; // píxeles por segundo
    private reactionDelay: number = 0.1; // Tiempo de reacción en segundos
    private reactionTimer: number = 0;
    private targetY: number = 0;

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height);
    }

    public update(deltaTime: number): void {
        // La lógica de actualización se manejará en la escena de Pong
    }

    public updateWithBall(deltaTime: number, ball: Ball): void {
        // Predecir la posición futura de la pelota
        const predictedY = this.predictBallPosition(ball);

        // Actualizar el temporizador de reacción
        this.reactionTimer += deltaTime;
        if (this.reactionTimer >= this.reactionDelay) {
            this.targetY = predictedY;
            this.reactionTimer = 0;
        }

        // Mover la paleta hacia la posición objetivo
        const direction = this.targetY - this.y;
        if (Math.abs(direction) > 5) {
            this.y += Math.sign(direction) * this.speed * deltaTime;
        }

        // Mantener la paleta dentro de los límites
        this.y = Math.max(0, Math.min(600 - this.height, this.y));
    }

    private predictBallPosition(ball: Ball): number {
        if (ball.velocityX <= 0) {
            // Si la pelota se está moviendo hacia la izquierda, volver al centro
            return 300 - this.height / 2;
        }

        // Calcular cuánto tiempo tardará la pelota en llegar a la paleta
        const distanceToPaddle = this.x - ball.x;
        const timeToReachPaddle = distanceToPaddle / ball.velocityX;

        // Predecir la posición Y de la pelota cuando llegue a la paleta
        let predictedY = ball.y + ball.velocityY * timeToReachPaddle;

        // Ajustar la predicción para los rebotes en los bordes superior e inferior
        while (predictedY < 0 || predictedY > 600) {
            if (predictedY < 0) {
                predictedY = -predictedY;
            } else {
                predictedY = 1200 - predictedY;
            }
        }

        // Ajustar para centrar la paleta en la pelota
        return predictedY - this.height / 2;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
} 
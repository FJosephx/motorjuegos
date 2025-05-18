import { Scene } from '../core/Scene';
import { Paddle } from '../entities/Paddle';
import { CPUPaddle } from '../entities/CPUPaddle';
import { Ball } from '../entities/Ball';
import { InputManager } from '../core/InputManager';
import { Game } from '../core/Game';

export class PongScene extends Scene {
    private playerPaddle: Paddle;
    private cpuPaddle: CPUPaddle;
    private ball: Ball;
    private playerScore: number = 0;
    private cpuScore: number = 0;
    private gameOver: boolean = false;
    private inputManager: InputManager;
    private game: Game;

    constructor(game: Game) {
        super();
        this.game = game;
        this.inputManager = InputManager.getInstance();
        this.playerPaddle = new Paddle(50, 250, 20, 100);
        this.cpuPaddle = new CPUPaddle(730, 250, 20, 100);
        this.ball = new Ball(400, 300, 20);
    }

    public init(): void {
        this.addEntity(this.playerPaddle);
        this.addEntity(this.cpuPaddle);
        this.addEntity(this.ball);
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

        // Actualizar la paleta de la CPU
        this.cpuPaddle.updateWithBall(deltaTime, this.ball);

        // Actualizar el resto de entidades
        this.playerPaddle.update(deltaTime);
        this.ball.update(deltaTime);

        // Detectar colisiones con las paletas
        if (this.checkCollision(this.ball, this.playerPaddle)) {
            const hitPosition = (this.ball.y - this.playerPaddle.y) / this.playerPaddle.height;
            this.ball.bounce(hitPosition * 2 - 1);
            this.ball.increaseSpeed();
        } else if (this.checkCollision(this.ball, this.cpuPaddle)) {
            const hitPosition = (this.ball.y - this.cpuPaddle.y) / this.cpuPaddle.height;
            this.ball.bounce(hitPosition * 2 - 1);
            this.ball.increaseSpeed();
        }

        // Verificar si la pelota sale por los lados
        if (this.ball.x + this.ball.width < 0) {
            this.cpuScore++;
            this.resetBall();
        } else if (this.ball.x > 800) {
            this.playerScore++;
            this.resetBall();
        }

        // Verificar si alguien ganó
        if (this.playerScore >= 5 || this.cpuScore >= 5) {
            this.gameOver = true;
        }
    }

    private resetBall(): void {
        this.ball.reset();
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Limpiar el canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 800, 600);

        // Dibujar la línea central
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(400, 0);
        ctx.lineTo(400, 600);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dibujar el marcador
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.playerScore} - ${this.cpuScore}`, 400, 40);

        // Instrucción ESC
        ctx.font = '18px Arial';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'left';
        ctx.fillText('ESC: Volver al menú', 20, 40);

        // Dibujar las entidades
        super.draw(ctx);

        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(0, 0, 800, 600);
            
            ctx.fillStyle = '#fff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                this.playerScore > this.cpuScore ? '¡Ganaste!' : '¡Perdiste!',
                400,
                250
            );
            ctx.font = '24px Arial';
            ctx.fillText('Presiona Enter para volver al menú', 400, 300);
        }
    }

    private checkCollision(ball: Ball, paddle: Paddle | CPUPaddle): boolean {
        return ball.x < paddle.x + paddle.width &&
               ball.x + ball.width > paddle.x &&
               ball.y < paddle.y + paddle.height &&
               ball.y + ball.height > paddle.y;
    }
} 
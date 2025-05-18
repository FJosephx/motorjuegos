import { Scene } from '../core/Scene';
import { InputManager } from '../core/InputManager';
import { Game } from '../core/Game';
import { PongScene } from './PongScene';
import { SnakeScene } from './SnakeScene';
import { TetrisScene } from './TetrisScene';
import { FightScene } from './FightScene';

export class MainMenu extends Scene {
    private selectedOption: number = 0;
    private options: string[] = ['Pong', 'Snake', 'Tetris', 'Combate'];
    private inputManager: InputManager;
    private game: Game;
    private lastInput: { [key: string]: boolean } = {};

    constructor(game: Game) {
        super();
        this.game = game;
        this.inputManager = InputManager.getInstance();
    }

    public init(): void {
        // No necesitamos inicializar nada en el menú principal
    }

    public update(deltaTime: number): void {
        this.handleMenuInput();
    }

    private handleMenuInput(): void {
        const up = this.inputManager.isKeyPressed('ArrowUp');
        const down = this.inputManager.isKeyPressed('ArrowDown');
        const enter = this.inputManager.isKeyPressed('Enter');

        if (up && !this.lastInput['ArrowUp']) {
            this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
        }
        if (down && !this.lastInput['ArrowDown']) {
            this.selectedOption = (this.selectedOption + 1) % this.options.length;
        }
        if (enter && !this.lastInput['Enter']) {
            this.selectOption();
        }

        this.lastInput['ArrowUp'] = up;
        this.lastInput['ArrowDown'] = down;
        this.lastInput['Enter'] = enter;
    }

    private selectOption(): void {
        switch (this.selectedOption) {
            case 0:
                this.game.setScene(new PongScene(this.game));
                break;
            case 1:
                this.game.setScene(new SnakeScene(this.game));
                break;
            case 2:
                this.game.setScene(new TetrisScene(this.game));
                break;
            case 3:
                this.game.setScene(new FightScene(this.game));
                break;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Fondo con degradado
        const gradient = ctx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#232526');
        gradient.addColorStop(1, '#414345');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        // Título con sombra y efecto
        ctx.save();
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#fff';
        ctx.fillText('Motor de Juegos', 400, 130);
        ctx.restore();

        // Opciones
        ctx.font = '32px Arial';
        this.options.forEach((option, index) => {
            if (index === this.selectedOption) {
                ctx.save();
                ctx.font = 'bold 36px Arial';
                ctx.shadowColor = '#0f0';
                ctx.shadowBlur = 16;
                ctx.fillStyle = '#0f0';
                ctx.fillText(`> ${option} <`, 400, 300 + index * 60);
                ctx.restore();
            } else {
                ctx.fillStyle = '#fff';
                ctx.fillText(option, 400, 300 + index * 60);
            }
        });

        // Instrucciones
        ctx.font = '22px Arial';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'center';
        ctx.fillText('Usa las flechas para navegar y Enter para seleccionar', 400, 520);
        ctx.font = '18px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText('Hecho con TypeScript y HTML5 Canvas', 400, 570);
    }
} 
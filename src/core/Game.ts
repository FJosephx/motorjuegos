import { Scene } from './Scene';
import { InputManager } from './InputManager';
import { MainMenu } from '../scenes';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private currentScene: Scene | null = null;
    private lastTime: number = 0;
    private inputManager: InputManager;
    private mainMenu: MainMenu;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.inputManager = InputManager.getInstance();
        this.mainMenu = new MainMenu(this);
        
        // Configurar el tamaño del canvas
        this.canvas.width = 800;
        this.canvas.height = 600;
    }

    public setScene(scene: Scene): void {
        this.currentScene = scene;
        scene.init();
    }

    public returnToMainMenu(): void {
        this.setScene(this.mainMenu);
    }

    private gameLoop(currentTime: number): void {
        if (!this.lastTime) {
            this.lastTime = currentTime;
        }

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Limpiar el canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Actualizar y dibujar la escena actual
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
            this.currentScene.draw(this.ctx);
        }

        // Solicitar el siguiente frame
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    public start(): void {
        requestAnimationFrame(this.gameLoop.bind(this));
    }
} 
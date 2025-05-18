import { Scene } from './Scene';

export interface MenuOption {
    text: string;
    action: () => void;
}

export abstract class Menu extends Scene {
    protected options: MenuOption[] = [];
    protected selectedIndex: number = 0;
    protected title: string = '';

    constructor() {
        super();
    }

    public update(deltaTime: number): void {
        // La lógica de actualización se manejará en las clases hijas
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Fondo
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 800, 600);

        // Título
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.title, 400, 100);

        // Opciones del menú
        ctx.font = '32px Arial';
        this.options.forEach((option, index) => {
            ctx.fillStyle = index === this.selectedIndex ? '#ff0' : '#fff';
            ctx.fillText(option.text, 400, 250 + index * 60);
        });
    }

    protected selectNext(): void {
        this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
    }

    protected selectPrevious(): void {
        this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
    }

    protected executeSelected(): void {
        this.options[this.selectedIndex].action();
    }
} 
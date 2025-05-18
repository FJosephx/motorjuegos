import { Entity } from '../core/Entity';

interface Block {
    x: number;
    y: number;
}

export class Tetromino extends Entity {
    private blocks: Block[] = [];
    private type: string;
    private rotation: number = 0;
    private gridSize: number = 30;
    private colors: { [key: string]: string } = {
        'I': '#00f0f0',
        'O': '#f0f000',
        'T': '#a000f0',
        'S': '#00f000',
        'Z': '#f00000',
        'J': '#0000f0',
        'L': '#f0a000'
    };

    constructor(type: string, x: number, y: number) {
        super(x, y, 0, 0);
        this.type = type;
        this.initializeBlocks();
    }

    private initializeBlocks(): void {
        switch (this.type) {
            case 'I':
                this.blocks = [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                    { x: 2, y: 0 },
                    { x: 3, y: 0 }
                ];
                break;
            case 'O':
                this.blocks = [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                    { x: 0, y: 1 },
                    { x: 1, y: 1 }
                ];
                break;
            case 'T':
                this.blocks = [
                    { x: 1, y: 0 },
                    { x: 0, y: 1 },
                    { x: 1, y: 1 },
                    { x: 2, y: 1 }
                ];
                break;
            case 'S':
                this.blocks = [
                    { x: 1, y: 0 },
                    { x: 2, y: 0 },
                    { x: 0, y: 1 },
                    { x: 1, y: 1 }
                ];
                break;
            case 'Z':
                this.blocks = [
                    { x: 0, y: 0 },
                    { x: 1, y: 0 },
                    { x: 1, y: 1 },
                    { x: 2, y: 1 }
                ];
                break;
            case 'J':
                this.blocks = [
                    { x: 0, y: 0 },
                    { x: 0, y: 1 },
                    { x: 1, y: 1 },
                    { x: 2, y: 1 }
                ];
                break;
            case 'L':
                this.blocks = [
                    { x: 2, y: 0 },
                    { x: 0, y: 1 },
                    { x: 1, y: 1 },
                    { x: 2, y: 1 }
                ];
                break;
        }
    }

    public move(dx: number, dy: number): void {
        this.x += dx * this.gridSize;
        this.y += dy * this.gridSize;
    }

    public rotate(): void {
        if (this.type === 'O') return; // La pieza O no rota

        const centerX = this.blocks[1].x;
        const centerY = this.blocks[1].y;

        this.blocks = this.blocks.map(block => {
            const dx = block.x - centerX;
            const dy = block.y - centerY;
            return {
                x: centerX - dy,
                y: centerY + dx
            };
        });
    }

    public getBlocks(): Block[] {
        return this.blocks.map(block => ({
            x: block.x + this.x / this.gridSize,
            y: block.y + this.y / this.gridSize
        }));
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const color = this.colors[this.type];
        
        this.blocks.forEach(block => {
            const x = this.x + block.x * this.gridSize;
            const y = this.y + block.y * this.gridSize;

            // Dibujar el bloque con gradiente
            const gradient = ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, this.darkenColor(color, 30));

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, this.gridSize, this.gridSize);

            // Borde
            ctx.strokeStyle = this.darkenColor(color, 50);
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, this.gridSize, this.gridSize);

            // Brillo
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x + 2, y + 2, this.gridSize - 4, 4);
        });
    }

    private darkenColor(color: string, amount: number): string {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    public getType(): string {
        return this.type;
    }
} 
import { SpriteSheet } from './SpriteSheet';

export type FighterState = 'idle' | 'walk' | 'attack' | 'hit' | 'dead';

export class Fighter {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private spriteSheets: { [state: string]: SpriteSheet } = {};
    private currentState: string = 'idle';
    private life: number = 100;
    private name: string;

    constructor(name: string, x: number, y: number, width: number, height: number) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public addSpriteSheet(state: string, sheet: SpriteSheet) {
        this.spriteSheets[state] = sheet;
    }

    public setState(state: string) {
        if (this.currentState !== state) {
            this.currentState = state;
            this.spriteSheets[state]?.reset();
        }
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        // Actualizar posición de todos los sprites
        for (const sprite of Object.values(this.spriteSheets)) {

        }
    }

    public update(deltaTime: number) {
        this.spriteSheets[this.currentState]?.update(deltaTime);
    }
    

    public draw(ctx: CanvasRenderingContext2D) {
        const sheet = this.spriteSheets[this.currentState];
        if (sheet) {
            sheet.draw(ctx, this.x, this.y, this.width, this.height);
        }
    }
    

    public getLife(): number {
        return this.life;
    }

    public setLife(life: number) {
        this.life = life;
    }

    public getName(): string {
        return this.name;
    }
} 
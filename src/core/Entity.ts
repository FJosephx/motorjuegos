export class Entity {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public velocityX: number;
    public velocityY: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    public update(deltaTime: number): void {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
} 
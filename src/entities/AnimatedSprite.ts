export class AnimatedSprite {
    private image: HTMLImageElement;
    private x: number;
    private y: number;
    private width: number;
    private height: number;

    constructor(imageSrc: string, x: number, y: number, width: number, height: number) {
        this.image = new window.Image();
        this.image.src = imageSrc;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        if (!this.image.complete || this.image.naturalWidth === 0) return;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

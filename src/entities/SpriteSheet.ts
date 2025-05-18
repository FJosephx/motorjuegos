export class SpriteSheet {
    private image: HTMLImageElement;
    private frameWidth: number;
    private frameHeight: number;
    private frameCount: number;
    private frameIndex: number = 0;
    private frameTime: number = 0;
    private frameDuration: number; // en segundos

    constructor(imageSrc: string, frameWidth: number, frameHeight: number, frameCount: number, frameDuration: number = 0.12) {
        this.image = new window.Image();
        this.image.src = imageSrc;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.frameDuration = frameDuration;
    }

    public update(deltaTime: number) {
        this.frameTime += deltaTime;
        if (this.frameTime >= this.frameDuration) {
            this.frameTime = 0;
            this.frameIndex = (this.frameIndex + 1) % this.frameCount;
        }
    }

    public draw(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
        if (!this.image.complete || this.image.naturalWidth === 0) return;

        ctx.drawImage(
            this.image,
            this.frameIndex * this.frameWidth, 0,               // Corte desde la imagen: origen X, Y
            this.frameWidth, this.frameHeight,                  // Tamaño del recorte
            x, y,                                                // Posición en canvas
            width, height                                        // Tamaño que se dibuja
        );
    }

    public reset() {
        this.frameIndex = 0;
        this.frameTime = 0;
    }
}

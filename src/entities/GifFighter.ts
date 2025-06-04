interface AnimationData {
    name: string;
    frame_width: number;
    frame_height: number;
    frame_count: number;
    spritesheet_width: number;
    spritesheet_height: number;
    spritesheet_file: string;
}

export class GifFighter {
    private currentAnimation: AnimationData;
    private currentFrame: number = 0;
    private frameDelay: number = 70; // ms entre frames (más fluido)
    private lastFrameTime: number = 0;
    private x: number;
    private y: number;
    private vy: number = 0; // velocidad vertical para salto
    private isJumping: boolean = false;
    private groundY: number; // posición Y del suelo
    private name: string;
    private life: number;
    private animations: Map<string, AnimationData>;
    private spritesheets: Map<string, HTMLImageElement>;
    private isPlaying: boolean = true;
    private baseHeight: number;
    private attackQueue: string | null = null;
    private readonly FLOOR_Y = 400;
    private readonly CEIL_Y = 80;
    private facing: 'left' | 'right' = 'right';
    private hasHit: boolean = false;
    private impactTimer: number = 0;
    private dyingTimer: number = 0;
    private idleAnimationName: string;

    constructor(
        animations: AnimationData[],
        x: number,
        y: number,
        _width: number, // ignorado, usamos el tamaño real del frame
        _height: number, // ignorado, usamos el tamaño real del frame
        name: string,
        life: number
    ) {
        this.x = x;
        this.y = this.FLOOR_Y;
        this.groundY = this.FLOOR_Y;
        this.name = name;
        this.life = life;
        this.animations = new Map();
        this.spritesheets = new Map();
        // Cargar spritesheets y animaciones
        animations.forEach(anim => {
            this.animations.set(anim.name, anim);
            const img = new Image();
            img.src = 'assets/' + anim.spritesheet_file;
            this.spritesheets.set(anim.name, img);
        });
        const inpeaceAnim = animations.find(anim => anim.name.includes('inpeace'));
        if (inpeaceAnim) {
            this.currentAnimation = inpeaceAnim;
            this.baseHeight = inpeaceAnim.frame_height;
            this.idleAnimationName = inpeaceAnim.name;
        } else {
            this.currentAnimation = animations[0];
            this.baseHeight = animations[0].frame_height;
            this.idleAnimationName = animations[0].name;
        }
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.groundY = this.FLOOR_Y;
    }

    public playAnimation(animationName: string, once: boolean = false) {
        const animation = this.animations.get(animationName);
        if (!animation) return;
        // Solo cambiar si es diferente
        if (this.currentAnimation !== animation) {
            this.currentAnimation = animation;
            this.currentFrame = 0;
            this.isPlaying = true;
            if (once) {
                this.attackQueue = animationName;
            } else {
                this.attackQueue = null;
            }
        }
    }

    public stopAnimation() {
        this.isPlaying = false;
    }

    public jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.vy = -12; // velocidad inicial de salto
            // Usar la animación de salto real
            if (this.name === 'Capitán América') {
                this.playAnimation('cap-jump-attack', true);
            } else if (this.name === 'Ironman') {
                this.playAnimation('iron-inpeace', true); // Animación neutral durante el salto
            } else {
                this.playAnimation(this.idleAnimationName);
            }
        }
    }

    public attack(animationName: string) {
        this.playAnimation(animationName, true);
    }

    public updatePhysics() {
        // Salto y gravedad
        if (this.isJumping) {
            this.y += this.vy;
            this.vy += 1.2; // gravedad
            // Limitar altura máxima (techo)
            if (this.y < this.CEIL_Y) {
                this.y = this.CEIL_Y;
                this.vy = Math.abs(this.vy); // invertir para que baje
            }
            // Suelo
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.vy = 0;
                this.isJumping = false;
                this.playAnimation(this.idleAnimationName);
            }
        }
        // Reducir el temporizador de impacto
        if (this.impactTimer > 0) this.impactTimer -= 16;
        // Reducir el temporizador de dying
        if (this.dyingTimer > 0) {
            this.dyingTimer -= 16;
            if (this.dyingTimer <= 0) {
                this.playAnimation(this.idleAnimationName);
            }
        }
    }

    public setFacing(dir: 'left' | 'right') {
        this.facing = dir;
    }

    public getAttackHitbox(): {x: number, y: number, width: number, height: number} | null {
        // Solo si está atacando y en el frame correcto
        if (this.attackQueue && this.currentAnimation.name.includes('attack')) {
            // Ejemplo simple: hitbox delante del personaje
            const width = 40;
            const height = this.currentAnimation.frame_height / 2;
            const y = this.y + this.currentAnimation.frame_height / 4;
            let x = this.x;
            if (this.facing === 'right') {
                x += this.currentAnimation.frame_width - 10;
            } else {
                x -= width - 10;
            }
            return {x, y, width, height};
        }
        return null;
    }

    public resetAttack() {
        this.hasHit = false;
    }

    public draw(ctx: CanvasRenderingContext2D, currentTime: number) {
        const sheet = this.spritesheets.get(this.currentAnimation.name);
        if (!sheet || !sheet.complete || sheet.naturalWidth === 0) return;

        // Actualizar frame si es necesario
        if (this.isPlaying && currentTime - this.lastFrameTime > this.frameDelay) {
            this.currentFrame++;
            if (this.currentFrame >= this.currentAnimation.frame_count) {
                if (this.attackQueue) {
                    this.playAnimation(this.idleAnimationName);
                    this.attackQueue = null;
                    this.hasHit = false; // Limpiar flag de golpe
                }
                this.currentFrame = 0;
            }
            this.lastFrameTime = currentTime;
        }

        // Calcular la posición del frame actual en el spritesheet
        const framesPerRow = Math.floor(this.currentAnimation.spritesheet_width / this.currentAnimation.frame_width);
        const frameX = (this.currentFrame % framesPerRow) * this.currentAnimation.frame_width;
        const frameY = Math.floor(this.currentFrame / framesPerRow) * this.currentAnimation.frame_height;

        // Ajustar la posición Y para que los pies siempre estén en el mismo lugar
        const yOffset = this.baseHeight - this.currentAnimation.frame_height;
        const drawY = this.y + yOffset;

        ctx.save();
        if (this.impactTimer > 0) {
            ctx.globalAlpha = 0.5;
            ctx.filter = 'brightness(2)';
        }
        if (this.facing === 'left') {
            ctx.translate(this.x + this.currentAnimation.frame_width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(
                sheet,
                frameX,
                frameY,
                this.currentAnimation.frame_width,
                this.currentAnimation.frame_height,
                -this.currentAnimation.frame_width,
                drawY,
                this.currentAnimation.frame_width,
                this.currentAnimation.frame_height
            );
        } else {
            ctx.drawImage(
                sheet,
                frameX,
                frameY,
                this.currentAnimation.frame_width,
                this.currentAnimation.frame_height,
                this.x,
                drawY,
                this.currentAnimation.frame_width,
                this.currentAnimation.frame_height
            );
        }
        ctx.globalAlpha = 1;
        ctx.filter = 'none';
        ctx.restore();
    }

    public getName(): string {
        return this.name;
    }

    public getLife(): number {
        return this.life;
    }

    public moveX(dx: number) {
        // Limitar el movimiento horizontal a los bordes del canvas
        const minX = 0;
        const maxX = 800 - this.currentAnimation.frame_width;
        this.x = Math.max(minX, Math.min(maxX, this.x + dx));
    }

    public setLife(life: number) {
        this.life = Math.max(0, life);
    }

    public impact(): void {
        this.impactTimer = 300; // ms de parpadeo
    }

    public dyingFlash(): void {
        this.dyingTimer = 300; // ms
        if (this.name === 'Capitán América') {
            this.playAnimation('cap-dying', true);
        } else if (this.name === 'Ironman') {
            this.playAnimation('iron-dying', true);
        }
    }
}

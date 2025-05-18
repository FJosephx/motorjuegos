import { Scene } from '../core/Scene';
import { Game } from '../core/Game';
import { InputManager } from '../core/InputManager';
import { GifFighter } from '../entities/GifFighter';

const capAnimations = [
    {
        "name": "cap-inpeace",
        "frame_width": 103,
        "frame_height": 126,
        "frame_count": 4,
        "spritesheet_width": 412,
        "spritesheet_height": 126,
        "spritesheet_file": "cap-inpeace_spritesheet.png"
    },
    {
        "name": "cap-jump-attack",
        "frame_width": 258,
        "frame_height": 210,
        "frame_count": 16,
        "spritesheet_width": 4128,
        "spritesheet_height": 210,
        "spritesheet_file": "cap-jump-attack_spritesheet.png"
    },
    {
        "name": "cap-kick-attack",
        "frame_width": 237,
        "frame_height": 122,
        "frame_count": 5,
        "spritesheet_width": 1185,
        "spritesheet_height": 122,
        "spritesheet_file": "cap-kick-attack_spritesheet.png"
    },
    {
        "name": "cap-shield-attack",
        "frame_width": 167,
        "frame_height": 142,
        "frame_count": 14,
        "spritesheet_width": 2338,
        "spritesheet_height": 142,
        "spritesheet_file": "cap-shield-attack_spritesheet.png"
    },
    {
        "name": "cap-shthrow-attack",
        "frame_width": 350,
        "frame_height": 210,
        "frame_count": 15,
        "spritesheet_width": 5250,
        "spritesheet_height": 210,
        "spritesheet_file": "cap-shthrow-attack_spritesheet.png"
    },
    {
        "name": "cap-dying",
        "frame_width": 103,
        "frame_height": 126,
        "frame_count": 10,
        "spritesheet_width": 1030,
        "spritesheet_height": 126,
        "spritesheet_file": "cap-dying_spritesheet.png"
    }
];

const ironAnimations = [
    {
        "name": "iron-chestlight-attack",
        "frame_width": 282,
        "frame_height": 224,
        "frame_count": 51,
        "spritesheet_width": 14382,
        "spritesheet_height": 224,
        "spritesheet_file": "iron-chestlight-attack_spritesheet.png"
    },
    {
        "name": "iron-dying",
        "frame_width": 282,
        "frame_height": 224,
        "frame_count": 4,
        "spritesheet_width": 1128,
        "spritesheet_height": 224,
        "spritesheet_file": "iron-dying_spritesheet.png"
    },
    {
        "name": "iron-handlight-attack",
        "frame_width": 224,
        "frame_height": 131,
        "frame_count": 21,
        "spritesheet_width": 4704,
        "spritesheet_height": 131,
        "spritesheet_file": "iron-handlight-attack_spritesheet.png"
    },
    {
        "name": "iron-hbuster-attack",
        "frame_width": 171,
        "frame_height": 162,
        "frame_count": 30,
        "spritesheet_width": 5130,
        "spritesheet_height": 162,
        "spritesheet_file": "iron-hbuster-attack_spritesheet.png"
    },
    {
        "name": "iron-inpeace",
        "frame_width": 88,
        "frame_height": 216,
        "frame_count": 12,
        "spritesheet_width": 1056,
        "spritesheet_height": 216,
        "spritesheet_file": "iron-inpeace_spritesheet.png"
    },
    {
        "name": "iron-kick-attack",
        "frame_width": 265,
        "frame_height": 138,
        "frame_count": 14,
        "spritesheet_width": 3710,
        "spritesheet_height": 138,
        "spritesheet_file": "iron-kick-attack_spritesheet.png"
    }
];

export class FightScene extends Scene {
    private game: Game;
    private cap: GifFighter;
    private iron: GifFighter;
    private inputManager: InputManager;
    private capX = 100;
    private ironX = 600;
    private readonly minX = 0;
    private readonly maxX = 800 - 128;
    private capAttackCooldown = 0;
    private ironAttackCooldown = 0;
    private readonly ATTACK_COOLDOWN = 1000; // 1 segundo entre ataques
    private lastInput: { [key: string]: boolean } = {};
    private winner: string | null = null;

    constructor(game: Game) {
        super();
        this.game = game;
        this.inputManager = InputManager.getInstance();
        
        // Crear los luchadores con sus spritesheets y animaciones
        this.cap = new GifFighter(
            capAnimations,
            this.capX,
            400,
            128,
            126,
            'Capitán América',
            200
        );
        
        this.iron = new GifFighter(
            ironAnimations,
            this.ironX,
            400,
            131,
            124,
            'Ironman',
            200
        );
    }

    public init(): void {
        // Iniciar con la animación de idle
        this.cap.playAnimation('cap-inpeace');
        this.iron.playAnimation('iron-inpeace');
    }

    public update(deltaTime: number): void {
        if (this.winner) {
            if (this.inputManager.isKeyPressed('Enter')) {
                this.game.returnToMainMenu();
            }
            return;
        }
        // Actualizar física de salto
        this.cap.updatePhysics();
        this.iron.updatePhysics();

        const input = this.inputManager;

        // Volver al menú con Escape
        if (input.isKeyPressed('Escape')) {
            this.game.returnToMainMenu();
            return;
        }

        // Movimiento Capitán América (A/D)
        let capMoved = false;
        if (input.isKeyPressed('a')) {
            this.cap.moveX(-3);
            this.cap.setFacing('left');
            capMoved = true;
        }
        if (input.isKeyPressed('d')) {
            this.cap.moveX(3);
            this.cap.setFacing('right');
            capMoved = true;
        }

        // Movimiento Ironman (Flechas)
        let ironMoved = false;
        if (input.isKeyPressed('ArrowLeft')) {
            this.iron.moveX(-3);
            this.iron.setFacing('left');
            ironMoved = true;
        }
        if (input.isKeyPressed('ArrowRight')) {
            this.iron.moveX(3);
            this.iron.setFacing('right');
            ironMoved = true;
        }

        // Salto Capitán América (solo flanco de subida)
        if (input.isKeyPressed('w') && !this.lastInput['w'] && !this.cap['isJumping']) {
            this.cap.jump();
        }
        // Ataques Capitán América
        if (input.isKeyPressed('f')) {
            this.cap.attack('cap-kick-attack');
        }
        if (input.isKeyPressed('g')) {
            this.cap.attack('cap-shield-attack');
        }
        if (!capMoved && !this.cap['isJumping'] && !this.cap['attackQueue'] && this.cap['currentAnimation'].name !== 'cap-inpeace') {
            this.cap.playAnimation('cap-inpeace');
        }

        // Salto Ironman (solo flanco de subida)
        if (input.isKeyPressed('ArrowUp') && !this.lastInput['ArrowUp'] && !this.iron['isJumping']) {
            this.iron.jump();
        }
        // Ataques Ironman
        if (input.isKeyPressed('l')) {
            this.iron.attack('iron-kick-attack');
        }
        if (input.isKeyPressed('k')) {
            this.iron.attack('iron-chestlight-attack');
        }
        if (!ironMoved && !this.iron['isJumping'] && !this.iron['attackQueue'] && this.iron['currentAnimation'].name !== 'iron-inpeace') {
            this.iron.playAnimation('iron-inpeace');
        }

        // Sistema de colisiones y daño
        const capHitbox = this.cap.getAttackHitbox();
        const ironHitbox = this.iron.getAttackHitbox();
        function rectsCollide(a: {x: number, y: number, width: number, height: number}, b: {x: number, y: number, width: number, height: number}) {
            return a && b &&
                a.x < b.x + b.width &&
                a.x + a.width > b.x &&
                a.y < b.y + b.height &&
                a.y + a.height > b.y;
        }
        function getAttackDamage(animName: string): number {
            if (
                animName.includes('shield') ||
                animName.includes('buster') ||
                animName.includes('chestlight') ||
                animName.includes('shthrow')
            ) {
                return 20;
            }
            return 10;
        }
        // Si Cap ataca a Ironman
        if (capHitbox && rectsCollide(capHitbox, {x: this.iron['x'], y: this.iron['y'], width: this.iron['currentAnimation'].frame_width, height: this.iron['currentAnimation'].frame_height})) {
            if (!this.cap['hasHit']) {
                this.iron.setLife(this.iron.getLife() - getAttackDamage(this.cap['currentAnimation'].name));
                this.iron.impact();
                this.iron.dyingFlash();
                this.cap['hasHit'] = true;
            }
        }
        // Si Ironman ataca a Cap
        if (ironHitbox && rectsCollide(ironHitbox, {x: this.cap['x'], y: this.cap['y'], width: this.cap['currentAnimation'].frame_width, height: this.cap['currentAnimation'].frame_height})) {
            if (!this.iron['hasHit']) {
                this.cap.setLife(this.cap.getLife() - getAttackDamage(this.iron['currentAnimation'].name));
                this.cap.impact();
                this.cap.dyingFlash();
                this.iron['hasHit'] = true;
            }
        }

        // Verificar victoria y animación de dying
        if (this.cap.getLife() <= 0 && this.cap['currentAnimation'].name !== 'cap-dying') {
            this.cap.playAnimation('cap-dying');
            this.winner = 'Ironman';
        } else if (this.iron.getLife() <= 0 && this.iron['currentAnimation'].name !== 'iron-dying') {
            this.iron.playAnimation('iron-dying');
            this.winner = 'Capitán América';
        }

        // Guardar estado de teclas para el próximo frame
        this.lastInput['w'] = input.isKeyPressed('w');
        this.lastInput['ArrowUp'] = input.isKeyPressed('ArrowUp');
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, 800, 600);

        // Dibujar barras de vida
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${this.cap.getName()}`, 40, 40);
        ctx.fillRect(40, 50, 200, 20);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(40, 50, Math.max(0, 200 * (this.cap.getLife() / 200)), 20);

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(`${this.iron.getName()}`, 760, 40);
        ctx.fillRect(560, 50, 200, 20);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(560, 50, Math.max(0, 200 * (this.iron.getLife() / 200)), 20);

        // Dibujar luchadores
        this.cap.draw(ctx, performance.now());
        this.iron.draw(ctx, performance.now());
        // Pantalla de victoria
        if (this.winner) {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, 800, 600);
            ctx.fillStyle = '#fff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`¡${this.winner} gana!`, 400, 300);
            ctx.font = '24px Arial';
            ctx.fillText('Presiona Enter para volver al menú', 400, 350);
            ctx.restore();
        }
    }
}

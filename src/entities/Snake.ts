import { Entity } from '../core/Entity';
import { InputManager } from '../core/InputManager';

interface SnakeSegment {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
}

export class Snake extends Entity {
    private segments: SnakeSegment[] = [];
    private direction: string = 'right';
    private nextDirection: string = 'right';
    private moveTimer: number = 0;
    private moveInterval: number = 0.15; // Más lento para mejor control
    private gridSize: number = 20;
    private inputManager: InputManager;
    private isGrowing: boolean = false;
    private hasCollided: boolean = false;
    private moveProgress: number = 0;
    private moveSpeed: number = 6; // Más lento para movimiento más suave
    private lastMoveTime: number = 0;
    private pendingDirection: string | null = null;

    constructor(x: number, y: number) {
        super(x, y, 20, 20);
        this.inputManager = InputManager.getInstance();
        this.segments = [
            { x, y, targetX: x, targetY: y },
            { x: x - this.gridSize, y, targetX: x - this.gridSize, targetY: y }
        ];
    }

    public update(deltaTime: number): void {
        if (this.hasCollided) return;

        // Actualizar la dirección basada en la entrada
        this.updateDirection();

        // Actualizar el temporizador de movimiento
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.move();
            this.lastMoveTime = performance.now();
        }

        // Actualizar la interpolación de movimiento
        this.updateMovement(deltaTime);
    }

    private updateMovement(deltaTime: number): void {
        const currentTime = performance.now();
        const timeSinceLastMove = currentTime - this.lastMoveTime;
        const moveProgress = Math.min(timeSinceLastMove / (this.moveInterval * 1000), 1);

        // Interpolar la posición de cada segmento
        this.segments.forEach((segment, index) => {
            if (index === 0) {
                // La cabeza se mueve con interpolación suave
                const prevSegment = this.segments[1] || segment;
                segment.x = this.lerp(prevSegment.targetX, segment.targetX, this.easeInOutQuad(moveProgress));
                segment.y = this.lerp(prevSegment.targetY, segment.targetY, this.easeInOutQuad(moveProgress));
            } else {
                // Los segmentos siguen al segmento anterior con interpolación
                const prevSegment = this.segments[index - 1];
                segment.x = this.lerp(segment.targetX, prevSegment.targetX, this.easeInOutQuad(moveProgress));
                segment.y = this.lerp(segment.targetY, prevSegment.targetY, this.easeInOutQuad(moveProgress));
            }
        });
    }

    private easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    private lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    private updateDirection(): void {
        // Almacenar la dirección pendiente
        if (this.inputManager.isKeyPressed('ArrowUp') && this.direction !== 'down') {
            this.pendingDirection = 'up';
        } else if (this.inputManager.isKeyPressed('ArrowDown') && this.direction !== 'up') {
            this.pendingDirection = 'down';
        } else if (this.inputManager.isKeyPressed('ArrowLeft') && this.direction !== 'right') {
            this.pendingDirection = 'left';
        } else if (this.inputManager.isKeyPressed('ArrowRight') && this.direction !== 'left') {
            this.pendingDirection = 'right';
        }
    }

    private move(): void {
        // Aplicar la dirección pendiente si existe
        if (this.pendingDirection) {
            this.nextDirection = this.pendingDirection;
            this.pendingDirection = null;
        }

        // Actualizar la dirección actual
        this.direction = this.nextDirection;

        // Calcular la nueva posición de la cabeza
        const head = { ...this.segments[0] };
        switch (this.direction) {
            case 'up':
                head.targetY -= this.gridSize;
                break;
            case 'down':
                head.targetY += this.gridSize;
                break;
            case 'left':
                head.targetX -= this.gridSize;
                break;
            case 'right':
                head.targetX += this.gridSize;
                break;
        }

        // Verificar colisión con los bordes
        if (head.targetX < 0 || head.targetX >= 800 || head.targetY < 0 || head.targetY >= 600) {
            this.hasCollided = true;
            return;
        }

        // Actualizar las posiciones objetivo de todos los segmentos
        for (let i = this.segments.length - 1; i > 0; i--) {
            this.segments[i].targetX = this.segments[i - 1].targetX;
            this.segments[i].targetY = this.segments[i - 1].targetY;
        }

        // Añadir la nueva cabeza
        this.segments.unshift(head);

        // Si no está creciendo, eliminar la cola
        if (!this.isGrowing) {
            this.segments.pop();
        } else {
            this.isGrowing = false;
        }

        // Actualizar la posición de la entidad
        this.x = head.targetX;
        this.y = head.targetY;
    }

    public grow(): void {
        this.isGrowing = true;
    }

    public checkCollision(x: number, y: number): boolean {
        // Solo verificar colisión con la cabeza usando las posiciones objetivo
        const head = this.segments[0];
        return Math.abs(head.targetX - x) < this.gridSize / 2 && 
               Math.abs(head.targetY - y) < this.gridSize / 2;
    }

    public checkSelfCollision(): boolean {
        const head = this.segments[0];
        // Verificar colisión con el cuerpo usando las posiciones objetivo
        return this.segments.slice(1).some(segment => 
            Math.abs(segment.targetX - head.targetX) < this.gridSize / 2 && 
            Math.abs(segment.targetY - head.targetY) < this.gridSize / 2
        );
    }

    public checkWallCollision(): boolean {
        return this.hasCollided;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Dibujar cada segmento de la serpiente
        this.segments.forEach((segment, index) => {
            // Ocultar el segundo segmento al inicio
            if (index === 1 && this.segments.length === 2 && !this.isGrowing) return;
            const isHead = index === 0;
            const isLast = index === this.segments.length - 1;
            
            // Dibujar el cuerpo con gradiente
            const gradient = ctx.createRadialGradient(
                segment.x + this.gridSize / 2,
                segment.y + this.gridSize / 2,
                0,
                segment.x + this.gridSize / 2,
                segment.y + this.gridSize / 2,
                this.gridSize / 2
            );

            if (isHead) {
                gradient.addColorStop(0, '#00ff00');
                gradient.addColorStop(1, '#006400');
            } else {
                gradient.addColorStop(0, '#00ff00');
                gradient.addColorStop(1, '#008000');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                segment.x + this.gridSize / 2,
                segment.y + this.gridSize / 2,
                this.gridSize / 2 - 2,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Dibujar los ojos en la cabeza
            if (isHead) {
                // Ojos
                ctx.fillStyle = '#fff';
                const eyeSize = 4;
                const eyeOffset = 5;
                
                // Posicionar los ojos según la dirección
                let leftEyeX = segment.x + this.gridSize / 2;
                let leftEyeY = segment.y + this.gridSize / 2;
                let rightEyeX = segment.x + this.gridSize / 2;
                let rightEyeY = segment.y + this.gridSize / 2;

                switch (this.direction) {
                    case 'up':
                        leftEyeX -= eyeOffset;
                        rightEyeX += eyeOffset;
                        leftEyeY -= eyeOffset;
                        rightEyeY -= eyeOffset;
                        break;
                    case 'down':
                        leftEyeX -= eyeOffset;
                        rightEyeX += eyeOffset;
                        leftEyeY += eyeOffset;
                        rightEyeY += eyeOffset;
                        break;
                    case 'left':
                        leftEyeX -= eyeOffset;
                        rightEyeX -= eyeOffset;
                        leftEyeY -= eyeOffset;
                        rightEyeY += eyeOffset;
                        break;
                    case 'right':
                        leftEyeX += eyeOffset;
                        rightEyeX += eyeOffset;
                        leftEyeY -= eyeOffset;
                        rightEyeY += eyeOffset;
                        break;
                }

                // Pupilas
                ctx.beginPath();
                ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
                ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
                ctx.fill();

                // Pupilas negras
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(leftEyeX, leftEyeY, eyeSize / 2, 0, Math.PI * 2);
                ctx.arc(rightEyeX, rightEyeY, eyeSize / 2, 0, Math.PI * 2);
                ctx.fill();

                // Lengua
                if (this.hasCollided) {
                    ctx.strokeStyle = '#ff0000';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(segment.x + this.gridSize / 2, segment.y + this.gridSize / 2);
                    switch (this.direction) {
                        case 'up':
                            ctx.lineTo(segment.x + this.gridSize / 2, segment.y - 10);
                            break;
                        case 'down':
                            ctx.lineTo(segment.x + this.gridSize / 2, segment.y + this.gridSize + 10);
                            break;
                        case 'left':
                            ctx.lineTo(segment.x - 10, segment.y + this.gridSize / 2);
                            break;
                        case 'right':
                            ctx.lineTo(segment.x + this.gridSize + 10, segment.y + this.gridSize / 2);
                            break;
                    }
                    ctx.stroke();
                }
            }

            // Conectar los segmentos con un gradiente
            if (!isLast) {
                const nextSegment = this.segments[index + 1];
                const gradient = ctx.createLinearGradient(
                    segment.x + this.gridSize / 2,
                    segment.y + this.gridSize / 2,
                    nextSegment.x + this.gridSize / 2,
                    nextSegment.y + this.gridSize / 2
                );
                gradient.addColorStop(0, '#00ff00');
                gradient.addColorStop(1, '#008000');

                ctx.beginPath();
                ctx.moveTo(segment.x + this.gridSize / 2, segment.y + this.gridSize / 2);
                ctx.lineTo(nextSegment.x + this.gridSize / 2, nextSegment.y + this.gridSize / 2);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = this.gridSize - 4;
                ctx.stroke();
            }
        });
    }

    public getSegments(): SnakeSegment[] {
        return this.segments;
    }
} 
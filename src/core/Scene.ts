import { Entity } from './Entity';

export abstract class Scene {
    protected entities: Entity[] = [];

    constructor() {}

    public addEntity(entity: Entity): void {
        this.entities.push(entity);
    }

    public removeEntity(entity: Entity): void {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }

    public update(deltaTime: number): void {
        this.entities.forEach(entity => entity.update(deltaTime));
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.entities.forEach(entity => entity.draw(ctx));
    }

    public abstract init(): void;
} 
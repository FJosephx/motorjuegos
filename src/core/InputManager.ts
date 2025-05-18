export class InputManager {
    private static instance: InputManager;
    private keys: { [key: string]: boolean } = {};

    private constructor() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }

    private handleKeyDown(event: KeyboardEvent): void {
        this.keys[event.key] = true;
    }

    private handleKeyUp(event: KeyboardEvent): void {
        this.keys[event.key] = false;
    }

    public isKeyPressed(key: string): boolean {
        return this.keys[key] || false;
    }
} 
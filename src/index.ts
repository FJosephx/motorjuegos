import { Game } from './core/Game';
import { MainMenu } from './scenes';

// Inicializar el juego
window.addEventListener('load', () => {
    const game = new Game('gameCanvas');
    const mainMenu = new MainMenu(game);
    game.setScene(mainMenu);
    game.start();
}); 
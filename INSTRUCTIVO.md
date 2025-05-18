# Motor de Juegos

Este proyecto es un motor de juegos simple que incluye varios minijuegos como Pong, Tetris, Snake y un juego de combate entre Capitán América e Ironman.

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

## Ejecución

Instalar las dependencias y luego ejecutar con npm start

5. **Abre tu navegador:**
   Navega a tu host local para ver el juego.

## Estructura del Proyecto

- `src/`: Contiene el código fuente del motor y los juegos.
  - `core/`: Clases base como `Game`, `Scene`, `InputManager`, etc.
  - `entities/`: Entidades de los juegos (Pong, Snake, Tetris, GifFighter).
  - `scenes/`: Escenas de los juegos (PongScene, SnakeScene, PacmanScene, FightScene).


## Juegos Incluidos

- **Pong**: Un clásico juego de tenis de mesa.
- **Snake**: El clásico juego de la serpiente.
- **Tetris**: Un clon del famoso juego de bloques.
- **Combate**: Un juego de pelea entre Capitán América e Ironman.

## Controles

- **Pong**: Usa las teclas `↑` y `↓` para mover la paleta izquierda.
- **Snake**: Usa las flechas para mover la serpiente.
- **Tetros**: Usa las flechas para mover a el bloque, usa `↑` para cambiar la posición de este.
- **Combate**:
  - **Capitán América**: `A` y `D` para moverse, `W` para saltar, `F` y `G` para atacar.
  - **Ironman**: Flechas `←` y `→` para moverse, `↑` para saltar, `L` y `K` para atacar.

## Notas

- todos los archivos de spritesheets están en la carpeta `public/assets/`.
- Se debe corregir la hitbox de los personajes de combate para mejorar la fluidez y dinámica del juego.

## Licencia

Motor desarrollado por Franco Unda, estudiante de último año de Ingeniería en Informática, Duoc UC. 
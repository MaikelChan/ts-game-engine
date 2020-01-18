import { Example1Game } from "./Example1Game";

let canvas: HTMLCanvasElement = document.getElementById("mainCanvas") as HTMLCanvasElement;
let game: Example1Game = new Example1Game(canvas);

window.addEventListener("resize", UpdateRendererResolution, false);

UpdateRendererResolution();

function UpdateRendererResolution(): void {
    let width: number = window.innerWidth;
    let height: number = window.innerHeight;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    game.Resize(width, height);
}
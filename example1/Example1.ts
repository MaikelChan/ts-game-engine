import { Example1Game } from "./Example1Game";
import * as dat from "dat.gui";

let canvas: HTMLCanvasElement = document.getElementById("mainCanvas") as HTMLCanvasElement;
let game: Example1Game = new Example1Game(canvas);

window.addEventListener("load", Load, false);
window.addEventListener("resize", UpdateRendererResolution, false);
window.addEventListener("unload", Unload, false);

UpdateRendererResolution();

interface ISettings {
    showBounds: boolean;
}

function Load(): void {
    const gui = new dat.GUI();
    const settings: ISettings = { showBounds: false };

    let showBounds: dat.GUIController = gui.add(settings, "showBounds").name("Show Bounds");

    showBounds.onChange(function (value) {
        game.Settings.ShowBounds = value;
    });
}

function UpdateRendererResolution(): void {
    let width: number = window.innerWidth;
    let height: number = window.innerHeight;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    game.Resize(width, height);
}

function Unload(): void {
    console.log("Unloading resources.");
    game.Dispose();
}
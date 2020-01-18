import { Game } from "ts-game-engine";
import { Example1Scene } from "./Example1Scene";

export class Example1Game extends Game {

    private myScene: Example1Scene;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.myScene = new Example1Scene(this);
        this.LoadScene(this.myScene);
    }

    public Dispose(): void {
        super.Dispose();
        this.myScene.Dispose();
    }
}
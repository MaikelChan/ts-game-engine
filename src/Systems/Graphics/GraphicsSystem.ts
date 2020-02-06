import { BaseSystem } from "../BaseSystem";
import { PipelineState } from "./PipelineState";

export class GraphicsSystem extends BaseSystem {

    private canvas: HTMLCanvasElement;
    get Canvas(): HTMLCanvasElement { return this.canvas; }

    private context: WebGL2RenderingContext;
    get Context(): WebGL2RenderingContext { return this.context; }

    private pipelineState: PipelineState;
    get PipelineState(): PipelineState { return this.pipelineState; }

    private width: number;
    get Width(): number { return this.width; }

    private height: number;
    get Height(): number { return this.height; }

    private aspectRatio: number;
    get AspectRatio(): number { return this.aspectRatio; }

    constructor(canvas: HTMLCanvasElement) {
        super();

        this.canvas = canvas;

        // Get the context
        let context: WebGL2RenderingContext | null = this.canvas.getContext("webgl2", { antialias: true });
        if (context === null) throw new Error("WebGL context not supported.");

        this.context = context;

        this.pipelineState = new PipelineState(this.context);

        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        this.aspectRatio = this.width / this.height;
    }

    public Resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.aspectRatio = width / height;

        const widthWithPixelRation: number = width * window.devicePixelRatio;
        const heightWithPixelRation: number = height * window.devicePixelRatio;

        this.canvas.width = widthWithPixelRation;
        this.canvas.height = heightWithPixelRation;

        this.context.viewport(0, 0, widthWithPixelRation, heightWithPixelRation);
    }

    public Dispose(): void {

    }
}
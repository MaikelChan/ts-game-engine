import { BaseSystem } from "../BaseSystem";
import { PipelineState } from "./PipelineState";

export class GraphicsSystem extends BaseSystem {

    private canvas: HTMLCanvasElement;
    get Canvas(): HTMLCanvasElement { return this.canvas; }

    private context: WebGLRenderingContext;
    get Context(): WebGLRenderingContext { return this.context; }

    private pipelineState: PipelineState;
    get PipelineState(): PipelineState { return this.pipelineState; }

    private width: number;
    get Width(): number { return this.width; }

    private height: number;
    get Height(): number { return this.height; }

    private aspectRatio: number;
    get AspectRatio(): number { return this.aspectRatio; }

    // Extensions
    private ext_VAO: OES_vertex_array_object;
    get Ext_VAO(): OES_vertex_array_object { return this.ext_VAO; }
    //private ext_inst: ANGLE_instanced_arrays;
    //get Ext_Inst(): ANGLE_instanced_arrays { return this.ext_inst; }

    constructor(canvas: HTMLCanvasElement) {
        super();

        this.canvas = canvas;

        // Get the context
        let context: WebGLRenderingContext | null = this.canvas.getContext("webgl", { antialias: true });
        if (context === null) throw new Error("WebGL context not supported.");

        // Check required extensions
        let ext_vao: OES_vertex_array_object | null = context.getExtension("OES_vertex_array_object");
        if (ext_vao === null) throw new Error("Extension OES_vertex_array_object not supported.");
        //let ext_inst: ANGLE_instanced_arrays | null = context.getExtension("ANGLE_instanced_arrays");
        //if (ext_inst === null) throw new Error("Extension ANGLE_instanced_arrays not supported.");

        this.context = context;
        this.ext_VAO = ext_vao;
        //this.ext_inst = ext_inst;

        this.pipelineState = new PipelineState(this, this.context);

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
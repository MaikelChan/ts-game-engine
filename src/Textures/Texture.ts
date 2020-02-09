import { IDisposable } from "../Interfaces";
import { Scene } from "../Scene";
import { PipelineState } from "../Systems/Graphics/PipelineState";

export const enum TextureTypes { Texture2D = 0x0DE1, TextureCubeMap = 0x8513 }

export class Texture implements IDisposable {

    protected context: WebGL2RenderingContext;
    protected pipelineState: PipelineState;

    protected texture: WebGLTexture;
    get Texture(): WebGLTexture { return this.texture; }

    protected constructor(scene: Scene) {
        this.context = scene.Game.GraphicsSystem.Context;
        this.pipelineState = scene.Game.GraphicsSystem.PipelineState;

        const texture: WebGLTexture | null = this.context.createTexture();
        if (texture === null) {
            throw new Error("Unable to create Texture object.");
        }

        this.texture = texture;
    }

    public Dispose(): void {
        this.context.deleteTexture(this.texture);
    }

    protected IsPowerOf2(value: number): boolean {
        return (value & (value - 1)) === 0;
    }

    // Texture Manager --------------------------------------------------------------------------------------------------------

    protected static readonly textures: Map<string, Texture> = new Map<string, Texture>();

    public static DisposeAll(): void {
        for (let texture of this.textures.values()) {
            texture.Dispose();
        }

        this.textures.clear();
    }
}
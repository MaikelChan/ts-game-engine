import { IDisposable } from "../../Interfaces";
import { Scene } from "../..";

export const TEMPORARY_TEXTURE_NAME: string = "_TEMPORARY_TEXTURE_";

export class Texture2D implements IDisposable {

    private context: WebGL2RenderingContext;

    private texture: WebGLTexture;
    get Texture(): WebGLTexture { return this.texture; }

    private image: HTMLImageElement | undefined;
    // get Image(): HTMLImageElement | undefined { return this.image; }

    // private pixelData: Uint8Array | undefined;
    // get PixelData(): Uint8Array | undefined { return this.pixelData; }

    private constructor(scene: Scene, url: string | undefined, pixelData: Uint8Array | undefined) {
        this.context = scene.Game.GraphicsSystem.Context;

        const texture: WebGLTexture | null = this.context.createTexture();
        if (texture === null) {
            throw new Error("Unable to create Texture object.");
        }

        this.texture = texture;

        this.context.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.texture);

        if (pixelData !== undefined) {
            this.context.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, 1, 1, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, pixelData);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
        }
        else if (url !== undefined) {
            // Get temporary texture while loading
            this.context.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, 1, 1, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

            this.image = new Image();
            this.image.addEventListener("load", this.FinishedLoadingTexture);
            this.image.src = url;
        }
        else {
            throw new Error("Both url and pixelData parameters can't be undefined.");
        }
    }

    public Dispose(): void {
        this.context.deleteTexture(this.texture);
    }

    private FinishedLoadingTexture = (ev: Event): void => {

        this.context.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.texture);
        this.context.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.image!);

        if (this.IsPowerOf2(this.image!.width) && this.IsPowerOf2(this.image!.height)) {
            this.context.generateMipmap(WebGL2RenderingContext.TEXTURE_2D);
        } else {
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
        }
    }

    private IsPowerOf2(value: number): boolean {
        return (value & (value - 1)) === 0;
    }

    // Texture Manager --------------------------------------------------------------------------------------------------------

    private static readonly textures: Map<string, Texture2D> = new Map<string, Texture2D>();

    public static Get(scene: Scene, url: string): Texture2D {
        let key: string = url;

        let texture: Texture2D | undefined = this.textures.get(key);

        if (texture === undefined) {
            texture = new Texture2D(scene, url, undefined);
            this.textures.set(key, texture);
        }

        return texture;
    }

    public static GetBlank(scene: Scene): Texture2D {
        let key: string = TEMPORARY_TEXTURE_NAME;

        let texture: Texture2D | undefined = this.textures.get(key);

        if (texture === undefined) {
            texture = new Texture2D(scene, undefined, new Uint8Array([255, 255, 255, 255]));
            this.textures.set(key, texture);
        }

        return texture;
    }

    public static DisposeAll(): void {
        for (let texture of this.textures.values()) {
            texture.Dispose();
        }

        this.textures.clear();
    }
}
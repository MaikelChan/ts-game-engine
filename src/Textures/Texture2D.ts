import { Scene } from "../Scene";
import { Texture, TextureTypes } from "./Texture";

const TEMPORARY_TEXTURE_2D_NAME: string = "_TEMPORARY_TEXTURE_2D_";

export class Texture2D extends Texture {

    private constructor(scene: Scene, url: string | undefined, pixelData: Uint8Array | undefined) {
        super(scene);

        this.pipelineState.BindTexture(TextureTypes.Texture2D, this, 0);

        if (pixelData !== undefined) {
            this.context.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, 1, 1, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, pixelData);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
        }
        else if (url !== undefined) {
            // Get temporary texture while loading
            this.context.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, 1, 1, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

            const image: HTMLImageElement = new Image();

            image.addEventListener("load", (ev: Event) => {
                this.pipelineState.BindTexture(TextureTypes.Texture2D, this, 0);
                this.context.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, image);

                if (this.IsPowerOf2(image.width) && this.IsPowerOf2(image.height)) {
                    this.context.generateMipmap(WebGL2RenderingContext.TEXTURE_2D);
                } else {
                    this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
                    this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
                    this.context.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
                }
            });

            image.src = url;
        }
        else {
            throw new Error("Both url and pixelData parameters can't be undefined.");
        }
    }

    // Texture Manager --------------------------------------------------------------------------------------------------------

    public static Get(scene: Scene, url: string): Texture2D {
        let key: string = url;

        let texture: Texture | undefined = this.textures.get(key);

        if (texture === undefined) {
            texture = new Texture2D(scene, url, undefined);
            this.textures.set(key, texture);
        }

        return texture as Texture2D;
    }

    public static GetBlank(scene: Scene): Texture2D {
        let key: string = TEMPORARY_TEXTURE_2D_NAME;

        let texture: Texture | undefined = this.textures.get(key);

        if (texture === undefined) {
            texture = new Texture2D(scene, undefined, new Uint8Array([255, 255, 255, 255]));
            this.textures.set(key, texture);
        }

        return texture as Texture2D;
    }
}
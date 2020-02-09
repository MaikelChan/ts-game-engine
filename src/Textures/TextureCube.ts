import { ITextureCubeImageURLs } from "../Interfaces";
import { Scene } from "../Scene";
import { Texture, TextureTypes } from "./Texture";

const TEMPORARY_TEXTURE_CUBE_NAME: string = "_TEMPORARY_TEXTURE_CUBE_";
const CUBE_TEXTURES: number = 6;
const CUBE_MAP_FACES: number[] = [
    WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X,
    WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y, WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z, WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z
];

export class TextureCube extends Texture {

    private constructor(scene: Scene, urls: ITextureCubeImageURLs | undefined, pixelData: Uint8Array | undefined) {
        super(scene);

        this.pipelineState.BindTexture(TextureTypes.TextureCubeMap, this, 0);

        if (pixelData !== undefined) {
            for (let f: number = 0; f < CUBE_TEXTURES; f++) {
                this.context.texImage2D(CUBE_MAP_FACES[f], 0, WebGL2RenderingContext.RGBA, 1, 1, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, pixelData);
            }

            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_CUBE_MAP, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_CUBE_MAP, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_CUBE_MAP, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_CUBE_MAP, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
        }
        else if (urls !== undefined) {
            const u: string[] = [urls.positiveX, urls.negativeX, urls.positiveY, urls.negativeY, urls.positiveZ, urls.negativeZ];

            for (let f: number = 0; f < CUBE_TEXTURES; f++) {
                this.context.texImage2D(CUBE_MAP_FACES[f], 0, WebGL2RenderingContext.RGBA, 1, 1, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]));

                const image: HTMLImageElement = new Image();

                image.addEventListener("load", (ev: Event) => {
                    this.pipelineState.BindTexture(TextureTypes.TextureCubeMap, this, 0);
                    this.context.texImage2D(CUBE_MAP_FACES[f], 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, image);
                    //this.context.generateMipmap(WebGL2RenderingContext.TEXTURE_CUBE_MAP);
                });

                image.src = u[f];
            }

            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_CUBE_MAP, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_CUBE_MAP, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_CUBE_MAP, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
            this.context.texParameteri(WebGL2RenderingContext.TEXTURE_CUBE_MAP, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.LINEAR);
        }
        else {
            throw new Error("Both urls and pixelData parameters can't be undefined.");
        }
    }

    // Texture Manager --------------------------------------------------------------------------------------------------------

    public static Get(scene: Scene, urls: ITextureCubeImageURLs): TextureCube {
        let key: string = urls.positiveX + urls.negativeX + urls.positiveY + urls.negativeY + urls.positiveZ + urls.negativeZ;

        let texture: Texture | undefined = this.textures.get(key);

        if (texture === undefined) {
            texture = new TextureCube(scene, urls, undefined);
            this.textures.set(key, texture);
        }

        return texture as TextureCube;
    }

    public static GetBlank(scene: Scene): TextureCube {
        let key: string = TEMPORARY_TEXTURE_CUBE_NAME;

        let texture: Texture | undefined = this.textures.get(key);

        if (texture === undefined) {
            texture = new TextureCube(scene, undefined, new Uint8Array([255, 255, 255, 255]));
            this.textures.set(key, texture);
        }

        return texture as TextureCube;
    }
}
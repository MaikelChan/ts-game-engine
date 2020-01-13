import { Mesh, MeshTopology, VertexFormat, VERTEX_POSITION_SIZE, VERTEX_COLOR_SIZE, VERTEX_NORMAL_SIZE, VERTEX_UV_SIZE, IndexFormat } from "./Mesh";
import { vec3 } from "gl-matrix";
import { FLOAT_SIZE } from "../Constants";
import { Scene } from "../Scene";

export class MDLMesh extends Mesh {

    private readonly MAGIC: number = 0x4C444D20; // " MDL"
    private readonly FORMAT_VERSION: number = 1;

    private onFinishCallback: () => void;

    constructor(scene: Scene, mdlFileURL: string, onFinishCallback: () => void) {
        super(scene);

        this.onFinishCallback = onFinishCallback;

        let request = new XMLHttpRequest();
        request.addEventListener("load", this.FinishLoading);
        request.open("GET", mdlFileURL, true);
        request.responseType = "blob";
        request.send(null);
    }

    private FinishLoading = (evt: ProgressEvent<XMLHttpRequestEventTarget>): void => {
        const request: XMLHttpRequest = evt.target as XMLHttpRequest;
        if (request.readyState !== request.DONE) return;
        if (request.status !== 200) return;

        const blob: Blob = request.response;

        const reader: FileReader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.addEventListener("loadend", this.FinishReading);
    }

    private FinishReading = (evt: ProgressEvent<FileReader>): void => {
        const reader = evt.target as FileReader;

        if (reader.readyState !== reader.DONE) {
            throw new Error(`Loading MDL Error: ${evt}`);
        }

        const buffer: ArrayBuffer = reader.result as ArrayBuffer;
        const view: DataView = new DataView(buffer);

        // Start reading the file data ----------------------------------------------------------------------------------------

        let o: number = 0;

        let magic: number = view.getUint32(o, true); o += 4;
        if (magic !== this.MAGIC) {
            throw new Error("Invalid MDL file.");
        }

        let version: number = view.getUint32(o, true);
        if (version !== this.FORMAT_VERSION) {
            throw new Error("Invalid MDL file version.");
        }

        o = 0x10;

        const boundsMin: vec3 = vec3.create();
        boundsMin[0] = view.getFloat32(o, true); o += 4;
        boundsMin[1] = view.getFloat32(o, true); o += 4;
        boundsMin[2] = view.getFloat32(o, true); o += 4;

        const boundsMax: vec3 = vec3.create();
        boundsMax[0] = view.getFloat32(o, true); o += 4;
        boundsMax[1] = view.getFloat32(o, true); o += 4;
        boundsMax[2] = view.getFloat32(o, true); o += 4;

        const center: vec3 = vec3.create();
        center[0] = view.getFloat32(o, true); o += 4;
        center[1] = view.getFloat32(o, true); o += 4;
        center[2] = view.getFloat32(o, true); o += 4;

        const radius: number = view.getFloat32(o, true); o += 4;

        const vertexCount: number = view.getInt32(o, true); o += 4;
        const indexCount: number = view.getInt32(o, true); o += 4;
        const vertexFormat: VertexFormat = view.getUint32(o, true); o += 4;
        const indexFormat: IndexFormat = view.getUint8(o); o += 4;

        if (indexFormat !== IndexFormat.UInt16) {
            throw new Error("16bit indices in MDL are currently not supported.");
        }

        let vertexDataSize: number = 0;
        if ((vertexFormat & VertexFormat.Position) !== 0) vertexDataSize += VERTEX_POSITION_SIZE;
        if ((vertexFormat & VertexFormat.Color) !== 0) vertexDataSize += VERTEX_COLOR_SIZE;
        if ((vertexFormat & VertexFormat.Normal) !== 0) vertexDataSize += VERTEX_NORMAL_SIZE;
        if ((vertexFormat & VertexFormat.UV0) !== 0) vertexDataSize += VERTEX_UV_SIZE;
        if ((vertexFormat & VertexFormat.UV1) !== 0) vertexDataSize += VERTEX_UV_SIZE;

        const vertexData: Float32Array = new Float32Array(buffer, o, vertexDataSize * vertexCount);
        this.SetVertexData(vertexFormat, MeshTopology.Triangles, vertexCount, vertexData);

        o += vertexDataSize * vertexCount * FLOAT_SIZE;
        const indexData: Uint16Array = new Uint16Array(buffer, o, indexCount);
        this.SetIndexData(indexData);

        this.isLoaded = true;

        this.onFinishCallback?.();
    }
}
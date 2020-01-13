
export class Utils {
    public static DebugName(object: WebGLObject, objectName: string): void {
        (object as any).__SPECTOR_Metadata = { name: objectName };
    }
}
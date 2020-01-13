import { Component } from "./Component";
import { vec3, quat, mat4, mat3 } from "gl-matrix";

export class Transform extends Component {

    private position: vec3;
    get Position(): vec3 { return this.position; }
    set Position(position: vec3) { if (vec3.equals(position, this.position)) return; this.position = position; this.UpdateTransform(); }

    private rotation: quat;
    get Rotation(): quat { return this.rotation; }
    set Rotation(rotation: quat) { if (quat.equals(rotation, this.rotation)) return; this.rotation = rotation; this.UpdateTransform(); }

    private scale: vec3;
    get Scale(): vec3 { return this.scale; }
    set Scale(scale: vec3) { if (vec3.equals(scale, this.scale)) return; this.scale = scale; this.UpdateTransform(); }

    private modelMatrix: mat4;
    get ModelMatrix(): mat4 { return this.modelMatrix; }

    private normalMatrix: mat3;
    get NormalMatrix(): mat3 { return this.normalMatrix; }

    private right: vec3;
    get Right(): vec3 { return this.right; }

    private up: vec3;
    get Up(): vec3 { return this.up; }

    private forward: vec3;
    get Forward(): vec3 { return this.forward; }

    public OnTransformChange?: () => void;

    constructor() {
        super();

        this.position = vec3.create();
        this.rotation = quat.create();
        this.scale = vec3.fromValues(1, 1, 1);

        this.modelMatrix = mat4.create();
        this.normalMatrix = mat3.create();

        this.right = vec3.fromValues(1, 0, 0);
        this.up = vec3.fromValues(0, 1, 0);
        this.forward = vec3.fromValues(0, 0, -1);

        this.UpdateTransform();
    }

    private UpdateTransform(): void {
        mat4.fromRotationTranslationScale(this.modelMatrix, this.rotation, this.position, this.scale);

        if (this.scale[0] === this.scale[1] && this.scale[0] === this.scale[2]) {
            mat3.fromMat4(this.normalMatrix, this.modelMatrix);
        }
        else {
            let tempMatrix = mat4.create();
            mat4.invert(tempMatrix, this.modelMatrix);
            mat4.transpose(tempMatrix, tempMatrix);
            mat3.fromMat4(this.normalMatrix, tempMatrix);
        }

        this.right[0] = this.modelMatrix[0];
        this.right[1] = this.modelMatrix[1];
        this.right[2] = this.modelMatrix[2];

        this.up[0] = this.modelMatrix[4];
        this.up[1] = this.modelMatrix[5];
        this.up[2] = this.modelMatrix[6];

        this.forward[0] = -this.modelMatrix[8];
        this.forward[1] = -this.modelMatrix[9];
        this.forward[2] = -this.modelMatrix[10];

        this.OnTransformChange?.();
    }
}
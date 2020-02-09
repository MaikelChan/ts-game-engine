import { Entity } from "./Entity";
import { mat4, vec3, glMatrix } from "gl-matrix";
import { Scene } from "../Scene";
import { Frustum } from "../Math/Frustum";

export class Camera extends Entity {

    private fov: number;
    get FOV(): number { return this.fov; }
    set FOV(fov: number) { if (this.fov === fov) return; this.fov = fov; this.isProjectionMatrixDirty = true; }

    private near: number;
    get Near(): number { return this.near; }
    set Near(near: number) { if (this.near === near) return; this.near = near; this.isProjectionMatrixDirty = true; }

    private far: number;
    get Far(): number { return this.far; }
    set Far(far: number) { if (this.far === far) return; this.far = far; this.isProjectionMatrixDirty = true; }

    private viewMatrix: mat4;
    get ViewMatrix(): mat4 { return this.viewMatrix; }

    private projectionMatrix: mat4;
    get ProjectionMatrix(): mat4 { return this.projectionMatrix; }

    private viewDirectionProjectionInverseMatrix: mat4;
    get ViewDirectionProjectionInverseMatrix(): mat4 { return this.viewDirectionProjectionInverseMatrix; }

    private frustum: Frustum;
    get Frustum(): Frustum { return this.frustum; }

    private isViewMatrixDirty: boolean;
    private isProjectionMatrixDirty: boolean;
    private isViewDirectionProjectionDirty: boolean;
    private isFrustumDirty: boolean;

    constructor(scene: Scene, name: string) {
        super(scene, name);

        this.fov = 45;
        this.near = 0.1;
        this.far = 1000;

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        this.viewDirectionProjectionInverseMatrix = mat4.create();

        this.frustum = new Frustum();

        this.isViewMatrixDirty = true;
        this.isProjectionMatrixDirty = true;
        this.isViewDirectionProjectionDirty = true;
        this.isFrustumDirty = true;

        this.Transform.OnTransformChange = () => this.isViewMatrixDirty = true;
    }

    public Update(deltaTime: number): void {
        super.Update(deltaTime);

        if (this.isViewMatrixDirty) this.UpdateViewMatrix();
        if (this.isProjectionMatrixDirty) this.UpdateProjectionMatrix();
        if (this.isViewDirectionProjectionDirty) this.UpdateViewDirectionProjectionMatrices();
        if (this.isFrustumDirty) this.UpdateFrustum();
    }

    public Resize(width: number, height: number): void {
        this.isProjectionMatrixDirty = true;
    }

    private UpdateViewMatrix(): void {
        let position: vec3 = this.Transform.Position;
        let target: vec3 = vec3.create();
        vec3.add(target, position, this.Transform.Forward);
        mat4.lookAt(this.viewMatrix, position, target, this.Transform.Up);

        this.isViewDirectionProjectionDirty = true;
        this.isFrustumDirty = true;
        this.isViewMatrixDirty = false;
    }

    private UpdateProjectionMatrix(): void {
        mat4.perspective(this.projectionMatrix, glMatrix.toRadian(this.fov), this.Scene.Game.GraphicsSystem.AspectRatio, this.near, this.far);

        this.isViewDirectionProjectionDirty = true;
        this.isFrustumDirty = true;
        this.isProjectionMatrixDirty = false;
    }

    private UpdateViewDirectionProjectionMatrices(): void {
        mat4.copy(this.viewDirectionProjectionInverseMatrix, this.viewMatrix);
        this.viewDirectionProjectionInverseMatrix[12] = 0;
        this.viewDirectionProjectionInverseMatrix[13] = 0;
        this.viewDirectionProjectionInverseMatrix[14] = 0;

        mat4.multiply(this.viewDirectionProjectionInverseMatrix, this.projectionMatrix, this.viewDirectionProjectionInverseMatrix);
        mat4.invert(this.viewDirectionProjectionInverseMatrix, this.viewDirectionProjectionInverseMatrix);

        this.isViewDirectionProjectionDirty = false;
    }

    private UpdateFrustum(): void {
        let t: number = 2 * Math.tan(glMatrix.toRadian(this.fov) / 2);

        const aspectRatio: number = this.Scene.Game.GraphicsSystem.AspectRatio;

        let Hnear = t * this.near;
        let Wnear = Hnear * aspectRatio;
        let Hfar = t * this.far;
        let Wfar = Hfar * aspectRatio;

        let fc: vec3 = vec3.create();
        vec3.scaleAndAdd(fc, this.Transform.Position, this.Transform.Forward, this.far);

        let temp1: vec3 = vec3.create();
        let temp2: vec3 = vec3.create();

        let ftl: vec3 = vec3.create();
        vec3.add(ftl, fc, vec3.subtract(ftl, vec3.scale(temp1, this.Transform.Up, Hfar / 2), vec3.scale(temp2, this.Transform.Right, Wfar / 2)));
        let ftr: vec3 = vec3.create();
        vec3.scaleAndAdd(ftr, ftl, this.Transform.Right, Wfar);
        let fbl: vec3 = vec3.create();
        vec3.subtract(fbl, ftl, vec3.scale(fbl, this.Transform.Up, Hfar));
        let fbr: vec3 = vec3.create();
        vec3.subtract(fbr, ftr, vec3.scale(fbr, this.Transform.Up, Hfar));

        let nc: vec3 = vec3.create();
        vec3.scaleAndAdd(nc, this.Transform.Position, this.Transform.Forward, this.near);

        let ntl: vec3 = vec3.create();
        vec3.add(ntl, nc, vec3.subtract(ntl, vec3.scale(temp1, this.Transform.Up, Hnear / 2), vec3.scale(temp2, this.Transform.Right, Wnear / 2)));
        let ntr: vec3 = vec3.create();
        vec3.scaleAndAdd(ntr, ntl, this.Transform.Right, Wnear);
        let nbl: vec3 = vec3.create();
        vec3.subtract(nbl, ntl, vec3.scale(nbl, this.Transform.Up, Hnear));
        let nbr: vec3 = vec3.create();
        vec3.subtract(nbr, ntr, vec3.scale(nbr, this.Transform.Up, Hnear));

        this.frustum.Planes[0].SetPoints(ntr, ntl, ftl); //Top
        this.frustum.Planes[1].SetPoints(nbl, nbr, fbr); //Bottom
        this.frustum.Planes[2].SetPoints(ntl, nbl, fbl); //Left
        this.frustum.Planes[3].SetPoints(nbr, ntr, fbr); //Right
        this.frustum.Planes[4].SetPoints(ntl, ntr, nbr); //Near
        this.frustum.Planes[5].SetPoints(ftr, ftl, fbl); //Far

        this.isFrustumDirty = false;
    }
}
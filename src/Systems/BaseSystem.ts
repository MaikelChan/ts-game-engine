import { IDisposable } from "../Interfaces";

export abstract class BaseSystem implements IDisposable {
    public abstract Dispose(): void;
}
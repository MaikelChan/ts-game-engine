
export class Settings {
    private showBounds: boolean = false;
    get ShowBounds(): boolean { return this.showBounds; }
    set ShowBounds(value: boolean) { this.showBounds = value; }
}
import { BaseSystem } from "../BaseSystem";
import { Keys } from "./Keys";
import { vec2 } from "gl-matrix";

enum KeyState { Up, Down, Held, Released };

export class InputSystem extends BaseSystem {

    private readonly currentKeyStates: KeyState[];
    private readonly previousKeyStates: KeyState[];

    private readonly currentMouseStates: KeyState[];
    private readonly previousMouseStates: KeyState[];

    private readonly currentMousePosition: vec2;
    private readonly previousMousePosition: vec2;
    private readonly mouseDeltaMovement: vec2;
    get MousePosition(): vec2 { return this.currentMousePosition; }
    get MouseDeltaMovement(): vec2 { return this.mouseDeltaMovement; }

    constructor() {
        super();

        this.currentKeyStates = new Array<KeyState>(Keys.COUNT);
        this.previousKeyStates = new Array<KeyState>(Keys.COUNT);

        for (let k: number = 0; k < Keys.COUNT; k++) {
            this.currentKeyStates[k] = KeyState.Up;
            this.previousKeyStates[k] = KeyState.Up;
        }

        this.currentMouseStates = new Array<KeyState>(Keys.MOUSE_BUTTON_COUNT);
        this.previousMouseStates = new Array<KeyState>(Keys.MOUSE_BUTTON_COUNT);

        for (let m: number = 0; m < Keys.MOUSE_BUTTON_COUNT; m++) {
            this.currentMouseStates[m] = KeyState.Up;
            this.previousMouseStates[m] = KeyState.Up;
        }

        this.currentMousePosition = vec2.create();
        this.previousMousePosition = vec2.create();
        this.mouseDeltaMovement = vec2.create();

        document.addEventListener("keydown", this.OnKeyDown, false);
        document.addEventListener("keyup", this.OnKeyUp, false);

        document.addEventListener("mousedown", this.OnMouseDown, false);
        document.addEventListener("mouseup", this.OnMouseUp, false);
        document.addEventListener("mousemove", this.OnMouseMove, false);
    }

    public Dispose(): void {
        document.removeEventListener("keydown", this.OnKeyDown, false);
        document.removeEventListener("keyup", this.OnKeyUp, false);

        document.removeEventListener("mousedown", this.OnMouseDown, false);
        document.removeEventListener("mouseup", this.OnMouseUp, false);
        document.removeEventListener("mousemove", this.OnMouseMove, false);
    }

    public Update(): void {
        for (let k: number = 0; k < Keys.COUNT; k++) {
            if (this.currentKeyStates[k] === KeyState.Down && this.previousKeyStates[k] === KeyState.Down) this.currentKeyStates[k] = KeyState.Held;
            if (this.currentKeyStates[k] === KeyState.Released && this.previousKeyStates[k] === KeyState.Released) this.currentKeyStates[k] = KeyState.Up;
            this.previousKeyStates[k] = this.currentKeyStates[k];
        }

        for (let m: number = 0; m < Keys.MOUSE_BUTTON_COUNT; m++) {
            if (this.currentMouseStates[m] === KeyState.Down && this.previousMouseStates[m] === KeyState.Down) this.currentMouseStates[m] = KeyState.Held;
            if (this.currentMouseStates[m] === KeyState.Released && this.previousMouseStates[m] === KeyState.Released) this.currentMouseStates[m] = KeyState.Up;
            this.previousMouseStates[m] = this.currentMouseStates[m];
        }

        vec2.subtract(this.mouseDeltaMovement, this.currentMousePosition, this.previousMousePosition);
        vec2.copy(this.previousMousePosition, this.currentMousePosition);
    }

    public GetKeyDown(key: string): boolean {
        return this.currentKeyStates[this.KeyToIndex(key)] === KeyState.Down;
    }

    public GetKeyUp(key: string): boolean {
        return this.currentKeyStates[this.KeyToIndex(key)] === KeyState.Released;
    }

    public GetKey(key: string): boolean {
        return this.currentKeyStates[this.KeyToIndex(key)] === KeyState.Down || this.currentKeyStates[this.KeyToIndex(key)] === KeyState.Held;
    }

    public GetMouseButtonDown(button: number): boolean {
        return this.currentMouseStates[button] === KeyState.Down;
    }

    public GetMouseButtonUp(button: number): boolean {
        return this.currentMouseStates[button] === KeyState.Released;
    }

    public GetMouseButton(button: number): boolean {
        return this.currentMouseStates[button] === KeyState.Down || this.currentMouseStates[button] === KeyState.Held;
    }

    private OnKeyDown = (ev: KeyboardEvent): void => {
        const index: number = this.KeyToIndex(ev.code);

        if (index < 0) {
            console.warn(`Key "${ev.code} is not implemented.`);
            return;
        }

        if (this.currentKeyStates[index] === KeyState.Held) return;
        this.currentKeyStates[index] = KeyState.Down;
    }

    private OnKeyUp = (ev: KeyboardEvent): void => {
        const index: number = this.KeyToIndex(ev.code);

        if (index < 0) {
            console.warn(`Key "${ev.code} is not implemented.`);
            return;
        }

        this.currentKeyStates[index] = KeyState.Released;
    }

    private OnMouseDown = (ev: MouseEvent): void => {
        const index: number = ev.button;

        if (index < 0 || index >= Keys.MOUSE_BUTTON_COUNT) {
            console.warn(`Mouse button "${index} is not implemented.`);
            return;
        }

        if (this.currentMouseStates[index] === KeyState.Held) return;
        this.currentMouseStates[index] = KeyState.Down;
    }

    private OnMouseUp = (ev: MouseEvent): void => {
        const index: number = ev.button;

        if (index < 0 || index >= Keys.MOUSE_BUTTON_COUNT) {
            console.warn(`Mouse button "${index} is not implemented.`);
            return;
        }

        this.currentMouseStates[index] = KeyState.Released;
    }

    private OnMouseMove = (ev: MouseEvent): void => {
        this.currentMousePosition[0] = ev.x;
        this.currentMousePosition[1] = ev.y;
    }

    private KeyToIndex(key: string): number {
        switch (key) {
            default: return -1;

            case Keys.KEY_ESCAPE: return 0;

            case Keys.KEY_F1: return 1;
            case Keys.KEY_F2: return 2;
            case Keys.KEY_F3: return 3;
            case Keys.KEY_F4: return 4;
            case Keys.KEY_F5: return 5;
            case Keys.KEY_F6: return 6;
            case Keys.KEY_F7: return 7;
            case Keys.KEY_F8: return 8;
            case Keys.KEY_F9: return 9;
            case Keys.KEY_F10: return 10;
            case Keys.KEY_F11: return 11;
            case Keys.KEY_F12: return 12;

            case Keys.KEY_DIGIT_0: return 13;
            case Keys.KEY_DIGIT_1: return 14;
            case Keys.KEY_DIGIT_2: return 15;
            case Keys.KEY_DIGIT_3: return 16;
            case Keys.KEY_DIGIT_4: return 17;
            case Keys.KEY_DIGIT_5: return 18;
            case Keys.KEY_DIGIT_6: return 19;
            case Keys.KEY_DIGIT_7: return 20;
            case Keys.KEY_DIGIT_8: return 21;
            case Keys.KEY_DIGIT_9: return 22;

            case Keys.KEY_Q: return 23;
            case Keys.KEY_W: return 24;
            case Keys.KEY_E: return 25;
            case Keys.KEY_R: return 26;
            case Keys.KEY_T: return 27;
            case Keys.KEY_Y: return 28;
            case Keys.KEY_U: return 29;
            case Keys.KEY_I: return 30;
            case Keys.KEY_O: return 31;
            case Keys.KEY_P: return 32;

            case Keys.KEY_A: return 33;
            case Keys.KEY_S: return 34;
            case Keys.KEY_D: return 35;
            case Keys.KEY_F: return 36;
            case Keys.KEY_G: return 37;
            case Keys.KEY_H: return 38;
            case Keys.KEY_J: return 39;
            case Keys.KEY_K: return 40;
            case Keys.KEY_L: return 41;

            case Keys.KEY_Z: return 42;
            case Keys.KEY_X: return 43;
            case Keys.KEY_C: return 44;
            case Keys.KEY_V: return 45;
            case Keys.KEY_B: return 46;
            case Keys.KEY_N: return 47;
            case Keys.KEY_M: return 48;

            case Keys.KEY_MINUS: return 49;
            case Keys.KEY_EQUAL: return 50;
            case Keys.KEY_BACKSPACE: return 51;
            case Keys.KEY_TAB: return 52;
            case Keys.KEY_BRACKET_LEFT: return 53;
            case Keys.KEY_BRACKET_RIGHT: return 54;
            case Keys.KEY_ENTER: return 55;
            case Keys.KEY_CONTROL_LEFT: return 56;
            case Keys.KEY_CONTROL_RIGHT: return 57;
            case Keys.KEY_SEMICOLON: return 58;
            case Keys.KEY_QUOTE: return 59;
            case Keys.KEY_BACK_QUOTE: return 60;
            case Keys.KEY_SHIFT_LEFT: return 61;
            case Keys.KEY_SHIFT_RIGHT: return 62;
            case Keys.KEY_BACK_SLASH: return 63;
            case Keys.KEY_COMMA: return 64;
            case Keys.KEY_PERIOD: return 65;
            case Keys.KEY_SLASH: return 66;
            case Keys.KEY_ALT_LEFT: return 67;
            case Keys.KEY_ALT_RIGHT: return 68;
            case Keys.KEY_SPACE: return 69;

            case Keys.KEY_PRINT_SCREEN: return 70;
            case Keys.KEY_PAUSE: return 71;

            case Keys.KEY_CAPS_LOCK: return 72;
            case Keys.KEY_NUM_LOCK: return 73;
            case Keys.KEY_SCROLL_LOCK: return 74;

            case Keys.KEY_INSERT: return 75;
            case Keys.KEY_HOME: return 76;
            case Keys.KEY_PAGE_UP: return 77;
            case Keys.KEY_DELETE: return 78;
            case Keys.KEY_END: return 79;
            case Keys.KEY_PAGE_DOWN: return 80;

            case Keys.KEY_ARROW_UP: return 81;
            case Keys.KEY_ARROW_LEFT: return 82;
            case Keys.KEY_ARROW_RIGHT: return 83;
            case Keys.KEY_ARROW_DOWN: return 84;

            case Keys.KEY_NUMPAD_0: return 85;
            case Keys.KEY_NUMPAD_1: return 86;
            case Keys.KEY_NUMPAD_2: return 87;
            case Keys.KEY_NUMPAD_3: return 88;
            case Keys.KEY_NUMPAD_4: return 89;
            case Keys.KEY_NUMPAD_5: return 90;
            case Keys.KEY_NUMPAD_6: return 91;
            case Keys.KEY_NUMPAD_7: return 92;
            case Keys.KEY_NUMPAD_8: return 93;
            case Keys.KEY_NUMPAD_9: return 94;

            case Keys.KEY_NUMPAD_ADD: return 95;
            case Keys.KEY_NUMPAD_SUBTRACT: return 96;
            case Keys.KEY_NUMPAD_MULTIPLY: return 97;
            case Keys.KEY_NUMPAD_DIVIDE: return 98;
            case Keys.KEY_NUMPAD_DECIMAL: return 99;
            case Keys.KEY_NUMPAD_ENTER: return 100;
        }
    }
}
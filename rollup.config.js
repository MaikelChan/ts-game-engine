import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: "example1/Example1.ts",
    output: {
        file: "bundle.js",
        format: "cjs",
        sourcemap: "inline"
    },
    plugins: [
        typescript(),
        resolve(),
        commonjs()
    ]
};
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
    input: "example1/Example1.ts",
    output: {
        file: "bundle.js",
        format: "cjs"
    },
    plugins: [
        typescript(),
        resolve(),
        commonjs()
    ],
};
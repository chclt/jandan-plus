import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'index.js',
    output: [
        {
            file: 'dist/index.js',
            format: 'iife',
            name: 'version',
            plugins: [terser()]
        }
    ],
    plugins: [resolve(), commonjs()]
};

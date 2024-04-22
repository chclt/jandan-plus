import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'components/gif-controller/index.js',
    output: [
        {
            file: 'dist/components/gif-controller/index.js',
            format: 'iife',
            name: 'version',
            plugins: [terser()]
        }
    ],
    plugins: [resolve(), commonjs()]
};

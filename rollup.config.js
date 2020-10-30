import pkg from './package.json'
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/index.js',
    output: [
    {
      file: pkg.main,
      format: 'cjs',
      plugins: [terser()],
      strict: false,
    },
    {
      file: pkg.module,
      format: 'es',
      plugins: [terser()],
      strict: false,
    },
    {
      file: 'dist/for-script-tag.js',
      format: 'iife',
      strict: false,
    },
    {
      file: 'dist/for-script-tag.min.js',
      format: 'iife',
      plugins: [terser()],
      strict: false,
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
plugins: [
  ],
}
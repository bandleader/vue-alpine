import pkg from './package.json'
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
    {
      file: 'dist/for-script-tag.min.js',
      format: 'iife',
      plugins: [terser()]
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
plugins: [
  ],
}
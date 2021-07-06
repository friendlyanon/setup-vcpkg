import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

export default ["main", "post"].map((name) => ({
  input: `src/${name}.ts`,
  output: {
    file: `dist/${name}.js`,
    format: "cjs",
  },
  plugins: [
    nodeResolve({ preferBuiltins: false }),
    commonjs(),
    json(),
    typescript(),
  ],
}));

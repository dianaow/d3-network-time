import resolve from "rollup-plugin-node-resolve"
import babel from "rollup-plugin-babel"

var globals = {
  "d3-array": "d3",
  "d3-axis": "d3",
  "d3-collection": "d3",
  "d3-force": "d3",
  "d3-format": "d3",
  "d3-hierarchy": "d3",
  "d3-scale": "d3",
  "d3-selection": "d3",
  "d3-shape": "d3",
  "d3-time-format": "d3",
  "d3-transition": "d3",
  "d3-zoom": "d3",
}

export default {
  input: "index.js",
  output: {
    file: "build/d3-network-time.js",
    name: "d3",
    format: "umd",
    indent: false,
    extend: true,
    globals: globals,
  },
  external: Object.keys(globals),
  plugins: [
    resolve(),
    babel({
      plugins: ["transform-object-assign"],
      exclude: "node_modules/**", // only transpile our source code
    }),
  ],
}

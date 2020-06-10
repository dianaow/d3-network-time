import { scaleSqrt, scaleOrdinal } from "d3-scale"
import { timeFormat, timeParse, utcParse } from "d3-time-format"

// set node, link, text color and dimensions
export const rootRadius = 30
export const nodeRadius = 50
export const nodeStrokeWidth = 2
export const nodeStroke = "white"
export const nodeFill = "#011C54"
export const nodeOpacity = 1
export const nodeTextFill = "white"
export const nodeTextOpacity = 0.8
export const childnodeTextOpacity = 0
export const nodeTextSize = 12

export const linkStrokeWidth = 2
export const linkStroke = "white"
export const linkOpacity = 1
export const linkTextFill = "white"
export const linkTextOpacity = 0
export const linkTextSize = 8
export const transitionDuration = 750

export const strictIsoParse = utcParse("%Y-%m-%dT%H:%M:%S.%LZ")
export const parseDate = timeParse("%Y-%m-%d")

const nodeRadiusScale = scaleSqrt().domain([1, 50]).range([10, nodeRadius])

const colorScale = scaleOrdinal()
  .range(["white", "aqua", "fuchsia"])
  .domain(["root", "parent", "children"])

export const scales = {
  colorAccessor: function (d) {
    return colorScale(d.type)
  }, // default color coding
  nodeRadius: {
    label: "Number of records",
    domain: [1, 15, 50],
    scale: nodeRadiusScale,
  },
}

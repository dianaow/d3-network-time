import { scaleSqrt, scaleOrdinal } from "d3-scale"

// set node, link, text color and dimensions
const nodeStrokeWidth = 2
const nodeTextOpacity = 0.8
const nodeTextSize = 12
const nodeTextFill = "gray"
const linkTextOpacity = 0
const linkTextSize = 8
const linkTextFill = "gray"
const transitionDuration = 750

const radiusScale = scaleSqrt().domain([1, 50]).range([3, 25])
const colorScale = scaleOrdinal()
  .range(["#E10100", "#00bcd4", "#3f51b5"])
  .domain(["root", "parent", "children"])

const radiusAccessor = (d) => radiusScale(d.value)
const nodeOpacityAccessor = () => 1
const nodeColorAccessor = (d) => colorScale(d.type)
const linkWidthAccessor = () => 2
const linkOpacityAccessor = () => 1
const linkColorAccessor = () => "gray"
const strengthAccessor = () => 0.5

export const defaultGraphElements = {
  nodeStrokeWidth,
  nodeTextOpacity,
  nodeTextSize,
  nodeTextFill,
  linkTextOpacity,
  linkTextSize,
  linkTextFill,
  transitionDuration,
  radiusAccessor,
  nodeOpacityAccessor,
  nodeColorAccessor,
  linkWidthAccessor,
  linkOpacityAccessor,
  linkColorAccessor,
  strengthAccessor,
}

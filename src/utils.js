export function generatePath(d, exclude_radius = false) {
  let sourceNewX, sourceNewY, targetNewX, targetNewY
  let dx = d.target.x - d.source.x
  let dy = d.target.y - d.source.y
  let gamma = Math.atan2(dy, dx) // Math.atan2 returns the angle in the correct quadrant as opposed to Math.atan

  if (exclude_radius) {
    sourceNewX = d.source.x + Math.cos(gamma) * d.source.r
    sourceNewY = d.source.y + Math.sin(gamma) * d.source.r
    targetNewX = d.target.x - Math.cos(gamma) * d.target.r
    targetNewY = d.target.y - Math.sin(gamma) * d.target.r
  } else {
    sourceNewX = d.source.x
    sourceNewY = d.source.y
    targetNewX = d.target.x - Math.cos(gamma) * d.target.r
    targetNewY = d.target.y - Math.sin(gamma) * d.target.r
  }

  // Coordinates of mid point on line to add new vertex.
  let midX = (targetNewX - sourceNewX) / 2 + sourceNewX
  let midY = (targetNewY - sourceNewY) / 2 + sourceNewY
  return (
    "M" +
    sourceNewX +
    "," +
    sourceNewY +
    "L" +
    midX +
    "," +
    midY +
    "L" +
    targetNewX +
    "," +
    targetNewY
  )
}

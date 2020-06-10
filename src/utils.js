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

Date.prototype.addYears = function (value) {
  var date = new Date(this.valueOf())
  date.setFullYear(date.getFullYear() + value)
  return date
}

Date.prototype.addMonths = function (value) {
  var date = new Date(this.valueOf())
  date.setMonth(date.getMonth() + value)
  return date
}

Date.prototype.addDays = function (value) {
  var date = new Date(this.valueOf())
  date.setDate(date.getDate() + value)
  return date
}

Date.prototype.addWeeks = function (value) {
  var date = new Date(this.valueOf())
  date.setDate(date.getDate() + value * 7)
  return date
}

Date.prototype.addHours = function (value) {
  var date = new Date(this.valueOf())
  date.setHours(date.getHours() + value)
  return date
}

Date.prototype.addMinutes = function (value) {
  var date = new Date(this.valueOf())
  date.setMinutes(date.getMinutes() + value)
  return date
}

Date.prototype.addSeconds = function (value) {
  var date = new Date(this.valueOf())
  date.setSeconds(date.getSeconds() + value)
  return date
}

Date.prototype.addMilliseconds = function (value) {
  var date = new Date(this.valueOf())
  date.setMilliseconds(date.getMilliseconds() + value)
  return date
}

function addFunc(currentDate, step) {
  if (step === "year") {
    return currentDate.addYears(1)
  } else if (step === "month") {
    return currentDate.addMonths(1)
  } else if (step === "day") {
    return currentDate.addDays(1)
  } else if (step === "week") {
    return currentDate.addWeeks(1)
  } else if (step === "hour") {
    return currentDate.addHours(1)
  } else if (step === "minute") {
    return currentDate.addMinutes(1)
  } else if (step === "second") {
    return currentDate.addSeconds(1)
  } else if (step === "millisecond") {
    return currentDate.addMilliseconds(1)
  }
}

export function getDates(startDate, stopDate, step) {
  startDate = new Date(startDate * 1000)
  stopDate = new Date(stopDate * 1000)
  var dateArray = new Array()
  var currentDate = startDate
  while (currentDate <= stopDate) {
    dateArray.push(currentDate)
    currentDate = addFunc(currentDate, step)
  }
  return dateArray
}

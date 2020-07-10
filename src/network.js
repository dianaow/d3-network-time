import * as d3Force from "d3-force"
import { select } from "d3-selection"
import { transition } from "d3-transition"
import { defaultGraphElements } from "./consts"
import { generatePath, getDates } from "./utils"

export function network(simulation) {
  let width = 800
  let height = 800
  let style = defaultGraphElements
  let animation = { mode: null, step: "day", show_time: "false" }
  let start = new Date()
  let end = new Date()
  let selector = "body"

  const linkedByIndex = []

  function networkLayout({ ...data }) {
    const graphEle = style
    const { mode, step, show_time } = animation
    const graphWrapper = { width, height }
    simulation = simulation || d3Force.forceSimulation()

    const timeline = getDates(start, end, step)

    let START = timeline[0] //if start date is not specified, default to first date found in data
    let END = timeline[timeline.length - 1] //if end date is not specified, default to last date found in data
    data.date = START

    const current = Object.assign({}, data)

    if (select(selector).select("svg").empty()) {
      if (show_time === true) {
        select(selector).append("h1").attr("class", "timeHeader")
      }

      const svg = select(selector)
        .append("svg")
        .attr("class", "networkWrapper")
        .attr("width", graphWrapper.width)
        .attr("height", graphWrapper.height)
        .attr("fill", "transparent")

      const g = svg.append("g").attr("class", "network")

      g.append("g").attr("class", "links")

      g.append("g").attr("class", "nodes")
    }

    if (mode === null) {
      updateGraph(data, current)
    } else if (mode === "auto") {
      let T, index
      let timerun = { playing: true, status: "play", initial: true }
      let dates = timeline.map((d) => d)
      dates = dates.filter((d) => (d >= START) & (d <= END))

      if (timerun.initial) {
        index = 0
      } else {
        index = dates.indexOf(current.date) // restart animation from date last stopped at
      }

      if (timerun.playing) {
        T = setInterval(function () {
          current.date = timeline[index]
          select(".timeHeader").html(current.date)
          let graph = updateGraph(data, current)
          current.nodes = graph.nodes
          current.links = graph.links
          index++
          if (index > dates.length - 1) {
            clearInterval(T)
            timerun = { playing: false, status: "end", initial: true }
          }
        }, 1000)
      }

      if ((timerun.playing === false) & (timerun.status === "pause")) {
        clearInterval(T)
        current.date = timeline[index]
        let graph = updateGraph(data, current)
        current.nodes = graph.nodes
        current.links = graph.links
      }

      if ((timerun.playing === false) & (timerun.status === "end")) {
        clearInterval(T)
        current.date = timeline[dates.length - 1]
        let graph = updateGraph(data, current)
        current.nodes = graph.nodes
        current.links = graph.links
      }
    } else if (mode === "step") {
      let graph = updateGraph(data, current)
      setTimeout(function () {
        current.date = END // date
        current.nodes = graph.nodes
        current.links = graph.links
        updateGraph(data, current)
      }, 1000)
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// Graph Network: Create node and link elements ////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    function draw(nodes, links, accessors) {
      function nodeKey(n) {
        return n.id
      }
      function linkKey(d) {
        return d.source.id + "-" + d.target.id
      }

      let { root, rootparent, berects } = accessors
      let graphNodesGroup = select(selector).select(".nodes")
      let graphLinksGroup = select(selector).select(".links")

      // DRAW NODES
      let graphNodesData = graphNodesGroup
        .selectAll("g")
        .data(nodes, (d) => nodeKey(d))

      graphNodesData
        .exit()
        .select("circle")
        .transition()
        .duration(graphEle.transitionDuration)
        .attr("r", 0)
        .remove()

      graphNodesData
        .exit()
        .select("rect")
        .transition()
        .duration(graphEle.transitionDuration)
        .attr("width", 0)
        .attr("height", 0)
        .remove()

      graphNodesData.exit().select("text").remove()

      graphNodesData
        .exit()
        .transition()
        .duration(graphEle.transitionDuration)
        .remove()

      let graphNodesEnter = graphNodesData
        .enter()
        .append("g")
        .attr("id", (d) => "node-group-" + nodeKey(d))

      graphNodesEnter.attr("transform", function (d) {
        if (berects(d)) {
          if (d.type === "parent") {
            return (
              "translate(" +
              (d.x0 - d.radius + d.strokeWidth) +
              "," +
              (d.y0 - d.radius + d.strokeWidth) +
              ")"
            )
          } else {
            return "translate(" + (d.x0 - d.radius) + "," + (d.y0 - d.radius) + ")"
          }
        } else {
          return "translate(" + d.x0 + "," + d.y0 + ")"
        }
      })

      graphNodesEnter
        .filter((d) => !berects(d))
        .append("circle")
        .attr("class", "node node-circle")
        .attr("id", function (d) {
          return "node-" + d.id
        })
        .attr("stroke-width", function (d) {
          return d.strokeWidth
        })
        .attr("stroke", function (d) {
          return d.strokeColor
        })
        .attr("opacity", function (d) {
          return d.opacity
        })
        .attr("fill", function (d) {
          return d.color
        })

      graphNodesEnter
        .filter((d) => berects(d))
        .append("rect")
        .attr("class", "node node-rect")
        .attr("id", function (d) {
          return "node-" + d.id
        })
        .attr("stroke-width", function (d) {
          return d.strokeWidth
        })
        .attr("stroke", function (d) {
          return d.strokeColor
        })
        .attr("opacity", function (d) {
          return d.opacity
        })
        .attr("fill", function (d) {
          return d.color
        })

      // DRAW NODE LABELS
      let textChildrenNode = graphNodesEnter.filter((d) => !root(d))

      textChildrenNode
        .append("text")
        .attr("class", "node-label")
        .attr("font-size", `${graphEle.nodeTextSize}px`)
        .attr("text-anchor", "middle")
        .attr("fill", graphEle.nodeTextFill)
        .attr("opacity", graphEle.nodeTextOpacity)
        .attr("x", (d) => (berects(d) ? d.radius : 0))
        .attr("y", (d) => (berects(d) ? -10 : -d.radius - 8))
        .text((d) => `${d.id}`)

      let textRootNode = graphNodesEnter.filter((d) => root(d))

      textRootNode
        .append("text")
        .attr("class", "root-label")
        .attr("font-size", `${graphEle.nodeTextSize * 2}px`)
        .attr("text-anchor", "middle")
        .attr("fill", graphEle.nodeTextFill)
        .attr("opacity", 1)
        .attr("x", (d) => (berects(d) ? d.radius : 0))
        .attr("y", (d) => (berects(d) ? -10 : -d.radius - 10))
        .text((d) => `${d.id}`)
        .call(getBB)

      textRootNode
        .insert("rect", "text")
        .attr("x", (d) => (berects(d) ? d.radius + d.bbox.x : 0 + d.bbox.x))
        .attr("y", (d) => (berects(d) ? -10 - 15 : -d.radius - 10 - 15))
        .attr("width", function (d) {
          return d.bbox.width
        })
        .attr("height", function (d) {
          return d.bbox.height
        })
        .style("fill", graphEle.nodeFill)
        .style("opacity", 0.8)

      function getBB(selection) {
        selection.each(function (d) {
          d.bbox = this.getBBox()
        })
      }
      graphNodesData = graphNodesEnter.merge(graphNodesData)

      graphNodesData
        .transition()
        .duration(graphEle.transitionDuration)
        .attr("transform", function (d) {
          if (berects(d)) {
            return "translate(" + (d.x - d.radius) + "," + (d.y - d.radius) + ")"
          } else {
            return "translate(" + d.x + "," + d.y + ")"
          }
        })

      graphNodesData.selectAll(".node-circle").call(function (node) {
        node
          .transition()
          .attr("r", function (d) {
            return d.radius
          })
          .attr("fill", (d) => d.color)
          .attr("stroke", (d) => d.strokeColor)
      })

      graphNodesData.selectAll(".node-rect").call(function (node) {
        node
          .transition()
          .attr("width", function (d) {
            return d.radius * 2
          })
          .attr("height", function (d) {
            return d.radius * 2
          })
          .attr("fill", (d) => d.color)
          .attr("stroke", (d) => d.strokeColor)
      })

      graphNodesData.selectAll(".nodeFO").call(function (node) {
        node
          .transition()
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", (d) => d.radius * 2 - d.strokeWidth)
          .attr("height", (d) => d.radius * 2 - d.strokeWidth)
          .attr("transform", function (d) {
            return "translate(" + -d.radius + "," + -d.radius + ")"
          })
      })

      graphNodesData
        .selectAll(".node")
        .on("mouseover.fade", (d) => hoverOver(d))
        .on("mouseout.fade", () => hoverOut())

      graphNodesData
        .selectAll(".node") // only root and parent nodes are clickable
        .filter((d) => rootparent(d))

      // DRAW LINKS
      let graphLinksData = graphLinksGroup
        .selectAll("g")
        .data(links, (d) => linkKey(d))

      graphLinksData
        .exit()
        .select("path")
        .transition()
        .duration(graphEle.transitionDuration)
        .attr("d", (d) =>
          generatePath(
            {
              source: { x: d.source.x, y: d.source.y, r: 0 },
              target: { x: d.source.x, y: d.source.y, r: 0 },
            },
            d.source.type === "root" ? false : true
          )
        )
        .attr("opacity", 0)
        .remove()

      graphLinksData
        .exit()
        .transition()
        .duration(graphEle.transitionDuration)
        .remove()

      let graphLinksEnter = graphLinksData
        .enter()
        .append("g")
        .attr("id", (d) => "path-group-" + linkKey(d))

      graphLinksEnter
        .append("path")
        .attr("class", "link")
        .attr("id", function (d) {
          return "path-" + linkKey(d)
        })
        .attr("stroke-width", function (d) {
          return d.strokeWidth
        })
        .attr("stroke", function (d) {
          return d.strokeColor
        })
        .attr("opacity", (d) => d.opacity)
        .attr("d", (d) =>
          generatePath(
            {
              source: { x: d.source.x0, y: d.source.y0, r: d.source.radius },
              target: { x: d.target.x0, y: d.target.y0, r: d.target.radius },
            },
            d.source.type === "root" ? false : true
          )
        )

      // DRAW LINK LABELS
      graphLinksEnter
        .append("text")
        .attr("class", "edge-label")
        .attr("font-size", `${graphEle.linkTextSize}px`)
        .attr("text-anchor", "middle")
        .attr("fill", graphEle.linkTextFill)
        .attr("opacity", graphEle.linkTextOpacity)
        .attr("dy", -2)
        .append("textPath")
        .attr("xlink:href", (d) => "#path-" + linkKey(d))
        .attr("startOffset", "50%")
        .text((d) => `${d.label}`)

      graphLinksData = graphLinksEnter.merge(graphLinksData)

      graphLinksData
        .selectAll(".link")
        .transition()
        .duration(graphEle.transitionDuration)
        .attr("opacity", (d) => d.opacity)
        .attr("d", function (d) {
          return generatePath(
            {
              source: { x: d.source.x, y: d.source.y, r: d.source.radius },
              target: { x: d.target.x, y: d.target.y, r: d.target.radius },
            },
            d.source.type === "root" ? false : true
          )
        })

      ///////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////// Graph Network: Create initeractivity ///////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////
      function hoverOver(d) {
        let hoverAttr = {
          hover_textOpacity: 0,
          hover_strokeOpacity: 0.2,
        }
        highlightConnections(graphNodesData, graphLinksData, d, hoverAttr)
      }

      function hoverOut() {
        unhighlightConnections(graphNodesData, graphLinksData)
      }

      function highlightConnections(graphNodesData, graphLinksData, d, hoverAttr) {
        const { hover_textOpacity, hover_strokeOpacity } = hoverAttr

        function isConnected(a, b) {
          return (
            linkedByIndex[`${a.id},${b.id}`] ||
            linkedByIndex[`${b.id},${a.id}`] ||
            a.id === b.id
          )
        }
        graphNodesData
          .selectAll(".node")
          .attr("opacity", (o) => (isConnected(d, o) ? 1 : hover_strokeOpacity))
          .style("pointer-events", (o) => (isConnected(d, o) ? "auto" : "none"))

        graphNodesData
          .selectAll(".root-label")
          .attr("opacity", (o) => (isConnected(d, o) ? 1 : hover_textOpacity))

        graphNodesData
          .selectAll(".node-label")
          .attr("opacity", (o) => (isConnected(d, o) ? 1 : hover_textOpacity))

        graphLinksData
          .selectAll(".link")
          .attr("opacity", (o) =>
            o.source === d || o.target === d ? 1 : hover_strokeOpacity
          )

        graphLinksData
          .selectAll(".edge-label")
          .attr("opacity", (o) =>
            o.source === d || o.target === d ? 0.5 : hover_textOpacity
          )
      }

      function unhighlightConnections(graphNodesData, graphLinksData) {
        graphNodesData
          .selectAll(".node")
          .attr("opacity", graphEle.nodeOpacity)
          .style("pointer-events", "auto")

        graphNodesData.selectAll(".root-label").attr("opacity", 1)
        graphNodesData
          .selectAll(".node-label")
          .attr("opacity", graphEle.nodeTextOpacity)

        graphLinksData.selectAll(".link").attr("opacity", 1)
        graphLinksData
          .selectAll(".edge-label")
          .attr("opacity", graphEle.linkTextOpacity)
      }
    } //draw: update nodes and edges of graph

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// Graph Network: Update node and link styles ////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    function updateAttributes(nodes, links) {
      const ROOT_IDs = nodes.filter((d) => d.root !== undefined).map((d) => d.id)
      let parentIDs = []
      let childIDs = []
      nodes.map((el) => {
        let connections = links
          .filter((d) => d.start_id === el.id)
          .map((d) => d.end_id)
        if (connections.length === 0) {
          childIDs.push(el.id) // a child node has no other nodes extending from it
        } else if (ROOT_IDs.indexOf(el.id) === -1) {
          parentIDs.push(el.id) // everyone else is a parent node if not a cluster root or child node (a node is only considered to be a parent node if it has other nodes extending from it)
        }
      })

      // set up accessors
      const root = (d) => ROOT_IDs.indexOf(d.id) !== -1
      const parent = (d) => parentIDs.indexOf(d.id) !== -1
      const rootparent = (d) => parentIDs.concat(ROOT_IDs).indexOf(d.id) !== -1
      const child = (d) => childIDs.indexOf(d.id) !== -1
      const berects = () => {} // choose node types to be rendered as rectangles

      const accessors = { root, parent, child, rootparent, berects }

      function findType(d) {
        if (root(d)) {
          return "root"
        } else if (parent(d)) {
          return "parent"
        } else if (child(d)) {
          return "children"
        }
      }

      nodes.forEach((d) => {
        d.type = findType(d)
      })

      links.forEach((d) => {
        d.type = nodes.find((el) => el.id === d.start_id).type
      })

      nodes.forEach((d) => {
        d.radius = graphEle.radiusAccessor(d)
        d.color = graphEle.nodeColorAccessor(d)
        d.strokeColor = graphEle.nodeColorAccessor(d)
        d.opacity = graphEle.nodeOpacityAccessor(d)
        d.strokeWidth = graphEle.nodeStrokeWidth
      })

      links.forEach((d) => {
        d.strokeColor = graphEle.linkColorAccessor(d)
        d.strokeWidth = graphEle.linkWidthAccessor(d)
        d.opacity = graphEle.linkOpacityAccessor(d)
        d.strength = graphEle.strengthAccessor(d)
      })

      return { nodes: nodes, links: links, accessors: accessors }
    } //updateAttributes: update attribute values assigned to nodes and edges

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// Graph Network: Update graph layout ////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    function updateGraph(OrigData, data) {
      simulation.stop()
      let { nodes, links, date } = data
      // when slider moves, these elements are to disappear on screen because they are confirmed after the selected date
      var nodesRemove = OrigData.nodes.filter((d) => {
        //console.log(d.date * 1000, date.getTime())
        return d.date * 1000 > date.getTime()
      })
      var linksRemove = OrigData.links.filter((d) => d.date * 1000 > date.getTime())

      // snapshot of all confirmed cases up until selected date
      // elements remain unchanged on screen if these cases are existing before the selected date
      nodes = OrigData.nodes.filter(
        (d) => nodesRemove.map((el) => el.id).indexOf(d.id) == -1
      )
      links = OrigData.links.filter(
        (d) => linksRemove.map((el) => el.id).indexOf(d.id) == -1
      )

      // remove links that do not have either a start and end node in nodes variable
      let nodeIDs = nodes.map((d) => d.id)
      links = links.filter((d) => {
        return (
          (nodeIDs.indexOf(d.start_id) !== -1) & (nodeIDs.indexOf(d.end_id) !== -1)
        )
      })

      let newEle = updateAttributes(nodes, links)
      nodes = newEle.nodes
      links = newEle.links

      links.forEach((d) => {
        d.source = nodes.find((el) => el.id === d.start_id)
        d.target = nodes.find((el) => el.id === d.end_id)
      })

      links.forEach((d) => {
        linkedByIndex[`${d.source.id},${d.target.id}`] = 1
      })

      nodes.forEach((d) => {
        let coords = { x: graphWrapper.width / 2, y: graphWrapper.height / 2 }
        d.x = d.x ? d.x : coords.x
        d.y = d.y ? d.y : coords.y
        d.fx = d.type == "root" ? coords.x : undefined
        d.fy = d.type == "root" ? coords.y : undefined
        d.x0 = d.x
        d.y0 = d.y
      })

      simulation.nodes(nodes)
      simulation.force("link").links(links)
      simulation.alpha(0.3).restart()
      for (var i = 0, n = 300; i < n; ++i) {
        simulation.tick()
      }

      nodes.forEach((d) => {
        d.x0 = d.x
        d.y0 = d.y
      })

      draw(nodes, links, newEle.accessors)

      return { nodes, links }
    } //updateGraph: things to do once marker on slider is moved
  } //networkLayout

  networkLayout.selector = function (_) {
    return arguments.length ? ((selector = _), networkLayout) : selector
  }

  networkLayout.width = function (_) {
    return arguments.length ? ((width = _), networkLayout) : width
  }

  networkLayout.height = function (_) {
    return arguments.length ? ((height = _), networkLayout) : height
  }

  networkLayout.start = function (_) {
    return arguments.length ? ((start = _), networkLayout) : start
  }

  networkLayout.end = function (_) {
    return arguments.length ? ((end = _), networkLayout) : end
  }

  networkLayout.style = function (_) {
    return arguments.length ? ((style = _), networkLayout) : style
  }

  networkLayout.animation = function (_) {
    return arguments.length ? ((animation = _), networkLayout) : animation
  }

  return networkLayout
} //network

(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-force'), require('d3-selection'), require('d3-scale'), require('d3-array'), require('d3-collection'), require('d3-transition'), require('d3-time-format')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3-force', 'd3-selection', 'd3-scale', 'd3-array', 'd3-collection', 'd3-transition', 'd3-time-format'], factory) :
(global = global || self, factory(global.d3 = global.d3 || {}, global.d3, global.d3, global.d3, global.d3, global.d3, global.d3, global.d3));
}(this, (function (exports, d3Force, d3Selection, d3Scale, d3Array, d3Collection, d3Transition, d3TimeFormat) { 'use strict';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var rootRadius = 30;
var nodeRadius = 50;
var nodeStrokeWidth = 2;
var nodeOpacity = 1;
var nodeTextOpacity = 0.8;
var nodeTextSize = 12;
var linkStrokeWidth = 2;
var linkOpacity = 1;
var linkTextOpacity = 0;
var linkTextSize = 8;
var transitionDuration = 750;
var formatYear = d3TimeFormat.timeFormat("%Y");
var formatDate = d3TimeFormat.timeFormat("%d %b %Y");
var formatFullDate = d3TimeFormat.timeFormat("%d/%m/%y");
var parseDate = d3TimeFormat.timeParse("%Y-%m-%d");
var parseDate1 = d3TimeFormat.timeParse("%Y");
var parseDate2 = d3TimeFormat.timeParse("%b %Y");
var currentDateString = "2020-05-11";
var currentDate = parseDate(currentDateString);
var nodeRadiusScale = d3Scale.scaleSqrt().domain([1, 50]).range([10, nodeRadius]);
var colorScale = d3Scale.scaleOrdinal().range(["white", "aqua", "fuchsia"]).domain(["root", "parent", "children"]);
var scales = {
  colorAccessor: function colorAccessor(d) {
    return colorScale(d.type);
  },
  // default color coding
  nodeRadius: {
    label: "Number of records",
    domain: [1, 15, 50],
    scale: nodeRadiusScale
  }
};

function generatePath(d) {
  var exclude_radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var sourceNewX, sourceNewY, targetNewX, targetNewY;
  var dx = d.target.x - d.source.x;
  var dy = d.target.y - d.source.y;
  var gamma = Math.atan2(dy, dx); // Math.atan2 returns the angle in the correct quadrant as opposed to Math.atan

  if (exclude_radius) {
    sourceNewX = d.source.x + Math.cos(gamma) * d.source.r;
    sourceNewY = d.source.y + Math.sin(gamma) * d.source.r;
    targetNewX = d.target.x - Math.cos(gamma) * d.target.r;
    targetNewY = d.target.y - Math.sin(gamma) * d.target.r;
  } else {
    sourceNewX = d.source.x;
    sourceNewY = d.source.y;
    targetNewX = d.target.x - Math.cos(gamma) * d.target.r;
    targetNewY = d.target.y - Math.sin(gamma) * d.target.r;
  } // Coordinates of mid point on line to add new vertex.


  var midX = (targetNewX - sourceNewX) / 2 + sourceNewX;
  var midY = (targetNewY - sourceNewY) / 2 + sourceNewY;
  return "M" + sourceNewX + "," + sourceNewY + "L" + midX + "," + midY + "L" + targetNewX + "," + targetNewY;
}

function processTimeline(cases) {
  var timeline = d3Collection.nest().key(function (d) {
    return d.date;
  }).rollup(function (leaves) {
    return leaves.length;
  }).entries(cases);
  timeline.forEach(function (d) {
    d.key = parseDate(d.key);
  });
  return timeline;
}

function network(selector) {
  var width = 800;
  var height = 800;
  var style = null;
  var start = "";
  var end = "";
  var linkedByIndex = [];
  var _Consts$scales = scales,
      colorAccessor = _Consts$scales.colorAccessor,
      nodeRadius = _Consts$scales.nodeRadius;
  var nodeTextOpacity$1 = nodeTextOpacity;
  var linkTextOpacity$1 = linkTextOpacity;
  var simulation = d3Force.forceSimulation().force("link", d3Force.forceLink().distance(function (d) {
    return d.distance;
  }).strength(function (d) {
    return d.strength;
  }));
  var themeState = {
    type: "light",
    primary: "#f5f5f5",
    secondary: "#333333"
  };
  var graphEle = {
    nodeFill: themeState.primary,
    nodeStroke: themeState.secondary,
    nodeTextFill: themeState.secondary,
    linkStroke: themeState.secondary,
    linkTextFill: themeState.secondary
  };

  function networkLayout(_ref) {
    var data = _extends({}, _ref);

    var graphWrapper = {
      width: width,
      height: height
    };
    selector = selector || "body";

    if (d3Selection.select(selector).select("svg").empty()) {
      var svg = d3Selection.select(selector).append("svg").attr("class", "networkWrapper").attr("width", graphWrapper.width / 2).attr("height", graphWrapper.height / 2).attr("viewBox", [0, 0, graphWrapper.width, graphWrapper.height]).attr("fill", themeState.secondary);
      var g = svg.append("g").attr("class", "network");
      g.append("g").attr("class", "links");
      g.append("g").attr("class", "nodes");
    }

    var timeline = processTimeline(data.links);
    start = start || timeline[0].key; //if start date is not specified, default to first date found in data

    end = end || timeline[timeline.length - 1].key; //if end date is not specified, default to last date found in data

    var START = typeof start === "string" ? parseDate(start) : start;
    var END = typeof end === "string" ? parseDate(end) : end;
    data.date = START;

    var current = _extends({}, data);

    if (style === null) {
      updateGraph(data, current);
    } else if (style === "auto") {
      var T, index;
      var timerun = {
        playing: true,
        status: "play",
        initial: true
      };
      var dates = timeline.map(function (d) {
        return d.key.getTime();
      });
      dates = dates.filter(function (d) {
        return d >= START.getTime() & d <= END.getTime();
      });

      if (timerun.initial) {
        index = 0;
      } else {
        index = dates.indexOf(current.date.getTime()); // restart animation from date last stopped at
      }

      if (timerun.playing) {
        T = setInterval(function () {
          current.date = timeline[index].key;
          var graph = updateGraph(data, current);
          current.nodes = graph.nodes;
          current.links = graph.links;
          index++;

          if (index > dates.length - 1) {
            clearInterval(T);
            timerun = {
              playing: false,
              status: "end",
              initial: true
            };
          }
        }, 1000);
      }

      if (timerun.playing === false & timerun.status === "pause") {
        clearInterval(T);
        current.date = timeline[index].key;
        var graph = updateGraph(data, current);
        current.nodes = graph.nodes;
        current.links = graph.links;
      }

      if (timerun.playing === false & timerun.status === "end") {
        clearInterval(T);
        current.date = timeline[dates.length - 1].key;

        var _graph = updateGraph(data, current);

        current.nodes = _graph.nodes;
        current.links = _graph.links;
      }
    } else if (style === "step") {
      var _graph2 = updateGraph(data, current);

      setTimeout(function () {
        current.date = END; // date

        current.nodes = _graph2.nodes;
        current.links = _graph2.links;
        updateGraph(data, current);
      }, 1000);
    } ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////// Graph Network: Create node and link elements ////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////


    function draw(nodes, links, accessors) {
      function nodeKey(n) {
        return n.id;
      }

      function linkKey(d) {
        return d.source.id + "-" + d.target.id;
      }

      var root = accessors.root,
          rootparent = accessors.rootparent,
          berects = accessors.berects;
      var graphNodesGroup = d3Selection.select(selector).select(".nodes");
      var graphLinksGroup = d3Selection.select(selector).select(".links"); // DRAW NODES

      var graphNodesData = graphNodesGroup.selectAll("g").data(nodes, function (d) {
        return nodeKey(d);
      });
      graphNodesData.exit().select("circle").transition().duration(transitionDuration).attr("r", 0).remove();
      graphNodesData.exit().select("rect").transition().duration(transitionDuration).attr("width", 0).attr("height", 0).remove();
      graphNodesData.exit().select("text").remove();
      graphNodesData.exit().transition().duration(transitionDuration).remove();
      var graphNodesEnter = graphNodesData.enter().append("g").attr("id", function (d) {
        return "node-group-" + nodeKey(d);
      });
      graphNodesEnter.attr("transform", function (d) {
        if (berects(d)) {
          if (d.type === "parent") {
            return "translate(" + (d.x0 - d.radius + d.strokeWidth) + "," + (d.y0 - d.radius + d.strokeWidth) + ")";
          } else {
            return "translate(" + (d.x0 - d.radius) + "," + (d.y0 - d.radius) + ")";
          }
        } else {
          return "translate(" + d.x0 + "," + d.y0 + ")";
        }
      });
      graphNodesEnter.filter(function (d) {
        return !berects(d);
      }).append("circle").attr("class", "node node-circle").attr("id", function (d) {
        return "node-" + d.id;
      }).attr("stroke-width", function (d) {
        return d.strokeWidth;
      }).attr("stroke", function (d) {
        return d.strokeColor;
      }).attr("opacity", function (d) {
        return d.opacity;
      }).attr("fill", function (d) {
        return d.color;
      });
      graphNodesEnter.filter(function (d) {
        return berects(d);
      }).append("rect").attr("class", "node node-rect").attr("id", function (d) {
        return "node-" + d.id;
      }).attr("stroke-width", function (d) {
        return d.strokeWidth;
      }).attr("stroke", function () {
        return graphEle.nodeStroke;
      }).attr("opacity", function (d) {
        return d.opacity;
      }).attr("fill", function (d) {
        return d.color;
      }); // DRAW NODE LABELS

      var textChildrenNode = graphNodesEnter.filter(function (d) {
        return !root(d);
      });
      textChildrenNode.append("text").attr("class", "node-label").attr("font-size", "".concat(nodeTextSize, "px")).attr("text-anchor", "middle").attr("fill", graphEle.nodeTextFill).attr("opacity", nodeTextOpacity).attr("x", function (d) {
        return berects(d) ? d.radius : 0;
      }).attr("y", function (d) {
        return berects(d) ? -10 : -d.radius - 8;
      }).text(function (d) {
        return "".concat(d.id);
      });
      var textRootNode = graphNodesEnter.filter(function (d) {
        return root(d);
      });
      textRootNode.append("text").attr("class", "root-label").attr("font-size", "".concat(nodeTextSize * 2, "px")).attr("text-anchor", "middle").attr("fill", graphEle.nodeTextFill).attr("opacity", 1).attr("x", function (d) {
        return berects(d) ? d.radius : 0;
      }).attr("y", function (d) {
        return berects(d) ? -10 : -d.radius - 10;
      }).text(function (d) {
        return "".concat(d.id);
      }).call(getBB);
      textRootNode.insert("rect", "text").attr("x", function (d) {
        return berects(d) ? d.radius + d.bbox.x : 0 + d.bbox.x;
      }).attr("y", function (d) {
        return berects(d) ? -10 - 15 : -d.radius - 10 - 15;
      }).attr("width", function (d) {
        return d.bbox.width;
      }).attr("height", function (d) {
        return d.bbox.height;
      }).style("fill", graphEle.nodeFill).style("opacity", 0.8);

      function getBB(selection) {
        selection.each(function (d) {
          d.bbox = this.getBBox();
        });
      }

      graphNodesData = graphNodesEnter.merge(graphNodesData);
      graphNodesData.transition().duration(transitionDuration).attr("transform", function (d) {
        if (berects(d)) {
          return "translate(" + (d.x - d.radius) + "," + (d.y - d.radius) + ")";
        } else {
          return "translate(" + d.x + "," + d.y + ")";
        }
      });
      graphNodesData.selectAll(".node-circle").call(function (node) {
        node.transition().attr("r", function (d) {
          return d.radius;
        }).attr("fill", function (d) {
          return d.color;
        }).attr("stroke", function (d) {
          return d.strokeColor;
        });
      });
      graphNodesData.selectAll(".node-rect").call(function (node) {
        node.transition().attr("width", function (d) {
          return d.radius * 2;
        }).attr("height", function (d) {
          return d.radius * 2;
        }).attr("fill", function (d) {
          return d.color;
        }).attr("stroke", function (d) {
          return d.strokeColor;
        });
      });
      graphNodesData.selectAll(".nodeFO").call(function (node) {
        node.transition().attr("x", 0).attr("y", 0).attr("width", function (d) {
          return d.radius * 2 - d.strokeWidth;
        }).attr("height", function (d) {
          return d.radius * 2 - d.strokeWidth;
        }).attr("transform", function (d) {
          return "translate(" + -d.radius + "," + -d.radius + ")";
        });
      });
      graphNodesData.selectAll(".node").on("mouseover.fade", function (d) {
        return hoverOver(d);
      }).on("mouseout.fade", function () {
        return hoverOut();
      });
      graphNodesData.selectAll(".node") // only root and parent nodes are clickable
      .filter(function (d) {
        return rootparent(d);
      }); // DRAW LINKS

      var graphLinksData = graphLinksGroup.selectAll("g").data(links, function (d) {
        return linkKey(d);
      });
      graphLinksData.exit().select("path").transition().duration(transitionDuration).attr("d", function (d) {
        return generatePath({
          source: {
            x: d.source.x,
            y: d.source.y,
            r: 0
          },
          target: {
            x: d.source.x,
            y: d.source.y,
            r: 0
          }
        }, d.source.type === "root" ? false : true);
      }).attr("opacity", 0).remove();
      graphLinksData.exit().transition().duration(transitionDuration).remove();
      var graphLinksEnter = graphLinksData.enter().append("g").attr("id", function (d) {
        return "path-group-" + linkKey(d);
      });
      graphLinksEnter.append("path").attr("class", "link").attr("id", function (d) {
        return "path-" + linkKey(d);
      }).attr("marker-mid", "url(#arrowhead)").attr("stroke-width", function (d) {
        return d.strokeWidth;
      }).attr("stroke", function (d) {
        return d.strokeColor;
      }).attr("opacity", function (d) {
        return d.opacity;
      }).attr("d", function (d) {
        return generatePath({
          source: {
            x: d.source.x0,
            y: d.source.y0,
            r: d.source.radius
          },
          target: {
            x: d.target.x0,
            y: d.target.y0,
            r: d.target.radius
          }
        }, d.source.type === "root" ? false : true);
      }); // DRAW LINK LABELS

      graphLinksEnter.append("text").attr("class", "edge-label").attr("font-size", "".concat(linkTextSize, "px")).attr("text-anchor", "middle").attr("fill", graphEle.linkTextFill).attr("opacity", linkTextOpacity).attr("dy", -2).append("textPath").attr("xlink:href", function (d) {
        return "#path-" + linkKey(d);
      }).attr("startOffset", "50%").text(function (d) {
        return "".concat(d.label);
      });
      graphLinksData = graphLinksEnter.merge(graphLinksData);
      graphLinksData.selectAll(".link").transition().duration(transitionDuration).attr("opacity", function (d) {
        return d.opacity;
      }).attr("d", function (d) {
        return generatePath({
          source: {
            x: d.source.x,
            y: d.source.y,
            r: d.source.radius
          },
          target: {
            x: d.target.x,
            y: d.target.y,
            r: d.target.radius
          }
        }, d.source.type === "root" ? false : true);
      }); ///////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////// Graph Network: Create initeractivity ///////////////////////////////
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      function hoverOver(d) {
        {
          var hoverAttr = {
            hover_textOpacity: 0,
            hover_strokeOpacity: 0.2,
            hover_arrow: "url(#arrowhead)"
          };
          highlightConnections(graphNodesData, graphLinksData, d, hoverAttr);
        }
      }

      function hoverOut() {
        {
          unhighlightConnections(graphNodesData, graphLinksData);
        }
      }

      function highlightConnections(graphNodesData, graphLinksData, d, hoverAttr) {
        var hover_textOpacity = hoverAttr.hover_textOpacity,
            hover_strokeOpacity = hoverAttr.hover_strokeOpacity,
            hover_arrow = hoverAttr.hover_arrow;

        function isConnected(a, b) {
          return linkedByIndex["".concat(a.id, ",").concat(b.id)] || linkedByIndex["".concat(b.id, ",").concat(a.id)] || a.id === b.id;
        }

        function isDirectConn(d, o) {
          if (d.root_id === "Unknown" | d.root_id === "Unlinked") {
            return isConnected(d, o) | o.root_id === d.id;
          } else {
            return isConnected(d, o);
          }
        }

        graphNodesData.selectAll(".node").attr("opacity", function (o) {
          var thisOpacity = isDirectConn(d, o) ? 1 : hover_strokeOpacity; //this.setAttribute('fill-opacity', thisOpacity)

          return thisOpacity;
        }).style("pointer-events", function (o) {
          return isDirectConn(d, o) ? "auto" : "none";
        });
        graphNodesData.selectAll(".root-label").attr("opacity", function (o) {
          return isDirectConn(d, o) ? 1 : hover_textOpacity;
        });
        graphNodesData.selectAll(".node-label").attr("opacity", function (o) {
          return isDirectConn(d, o) ? 1 : hover_textOpacity;
        });
        graphLinksData.selectAll(".link").attr("opacity", function (o) {
          return o.source === d || o.target === d ? 1 : hover_strokeOpacity;
        }).attr("marker-mid", function (o) {
          return o.source === d || o.target === d ? "url(#arrowheadOpaque)" : hover_arrow;
        });
        graphLinksData.selectAll(".edge-label").attr("opacity", function (o) {
          return o.source === d || o.target === d ? 0.5 : hover_textOpacity;
        });
      }

      function unhighlightConnections(graphNodesData, graphLinksData) {
        graphNodesData.selectAll(".node").attr("opacity", nodeOpacity).style("pointer-events", "auto");
        graphNodesData.selectAll(".root-label").attr("opacity", 1);
        graphNodesData.selectAll(".node-label").attr("opacity", nodeTextOpacity$1);
        graphLinksData.selectAll(".link").attr("opacity", 1);
        graphLinksData.selectAll(".edge-label").attr("opacity", linkTextOpacity$1);
      }
    } //draw: update nodes and edges of graph
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// Graph Network: Update node and link styles ////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////


    function updateAttributes(nodes, links) {
      var ROOT_IDs = nodes.filter(function (d) {
        return d.root !== undefined;
      }).map(function (d) {
        return d.id;
      });
      var parentIDs = [];
      var childIDs = [];
      nodes.map(function (el) {
        var connections = links.filter(function (d) {
          return d.start_id === el.id;
        }).map(function (d) {
          return d.end_id;
        });

        if (connections.length === 0) {
          childIDs.push(el.id); // a child node has no other nodes extending from it
        } else if (ROOT_IDs.indexOf(el.id) === -1) {
          parentIDs.push(el.id); // everyone else is a parent node if not a cluster root or child node (a node is only considered to be a parent node if it has other nodes extending from it)
        }
      }); // set up accessors

      var root = function root(d) {
        return ROOT_IDs.indexOf(d.id) !== -1;
      };

      var parent = function parent(d) {
        return parentIDs.indexOf(d.id) !== -1;
      };

      var rootparent = function rootparent(d) {
        return parentIDs.concat(ROOT_IDs).indexOf(d.id) !== -1;
      };

      var child = function child(d) {
        return childIDs.indexOf(d.id) !== -1;
      };

      var berects = function berects() {}; // choose node types to be rendered as rectangles


      var accessors = {
        root: root,
        parent: parent,
        child: child,
        rootparent: rootparent,
        berects: berects
      };

      function findType(d) {
        if (root(d)) {
          return "root";
        } else if (parent(d)) {
          return "parent";
        } else if (child(d)) {
          return "children";
        }
      }

      var linksTarget_nested = d3Collection.nest().key(function (d) {
        return d.end_id;
      }).rollup(function (leaves) {
        return leaves.length;
      }).entries(links);
      var linksSource_nested = d3Collection.nest().key(function (d) {
        return d.start_id;
      }).rollup(function (leaves) {
        return leaves.length;
      }).entries(links);
      var linksNested = [];
      linksTarget_nested.map(function (d) {
        linksNested.push({
          key: d.key,
          value: d.value
        });
      });
      linksSource_nested.map(function (d) {
        linksNested.push({
          key: d.key,
          value: d.value
        });
      });
      var linkAllNodes = d3Collection.nest().key(function (d) {
        return d.key;
      }).rollup(function (leaves) {
        return d3Array.sum(leaves, function (d) {
          return d.value;
        });
      }).entries(linksNested); // create custom link strength scale based on total number of connections to node (node could be either a source or target)

      var strengthScale = d3Scale.scaleLinear().domain(d3Array.extent(linkAllNodes, function (d) {
        return d.value;
      })).range([0.4, 0.3]); // create custom link distance scale based on node type

      var distanceScale = d3Scale.scaleOrdinal().domain(["root", "parent", "child"]).range([150, 40, 30]);
      nodes.forEach(function (d) {
        d.strokeWidth = nodeStrokeWidth;
        d.opacity = nodeOpacity;
      });
      links.forEach(function (d) {
        d.strokeColor = graphEle.linkStroke;
        d.strokeWidth = linkStrokeWidth;
        d.opacity = linkOpacity;
      });
      nodes.forEach(function (d) {
        d.type = findType(d);
      });
      links.forEach(function (d) {
        d.type = nodes.find(function (el) {
          return el.id === d.start_id;
        }).type;
      });
      nodes.forEach(function (d) {
        var conn = linkAllNodes.find(function (l) {
          return l.key === d.id;
        });
        d.radius = root(d) ? rootRadius : conn ? nodeRadius.scale(conn.value) : 4;
        d.color = rootparent(d) ? graphEle.nodeFill : colorAccessor(d);
        d.strokeColor = root(d) ? graphEle.nodeStroke : colorAccessor(d);
      });
      links.forEach(function (d) {
        var conn = linkAllNodes.find(function (l) {
          return l.key === d.end_id;
        }).value;
        d.strength = strengthScale(conn);
        d.distance = distanceScale(d.type);
      });
      return {
        nodes: nodes,
        links: links,
        accessors: accessors
      };
    } //updateAttributes: update attribute values assigned to nodes and edges
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////// Graph Network: Update graph layout ////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////


    function updateGraph(OrigData, data) {
      simulation.stop();
      var nodes = data.nodes,
          links = data.links,
          date = data.date; // when slider moves, these elements are to disappear on screen because they are confirmed after the selected date

      var nodesRemove = OrigData.nodes.filter(function (d) {
        return parseDate(d.date).getTime() > date.getTime();
      });
      var linksRemove = OrigData.links.filter(function (d) {
        return parseDate(d.date).getTime() > date.getTime();
      }); // snapshot of all confirmed cases up until selected date
      // elements remain unchanged on screen if these cases are existing before the selected date

      nodes = OrigData.nodes.filter(function (d) {
        return nodesRemove.map(function (el) {
          return el.id;
        }).indexOf(d.id) == -1;
      });
      links = OrigData.links.filter(function (d) {
        return linksRemove.map(function (el) {
          return el.id;
        }).indexOf(d.id) == -1;
      });
      console.log(nodes, links); // remove links that do not have either a start or end node in nodes variable

      var nodeIDs = nodes.map(function (d) {
        return d.id;
      });
      links = links.filter(function (d) {
        return nodeIDs.indexOf(d.start_id) !== -1;
      });
      links = links.filter(function (d) {
        return nodeIDs.indexOf(d.end_id) !== -1;
      });
      var newEle = updateAttributes(nodes, links);
      nodes = newEle.nodes;
      links = newEle.links;
      links.forEach(function (d) {
        d.source = nodes.find(function (el) {
          return el.id === d.start_id;
        });
        d.target = nodes.find(function (el) {
          return el.id === d.end_id;
        });
      });
      links.forEach(function (d) {
        linkedByIndex["".concat(d.source.id, ",").concat(d.target.id)] = 1;
      });
      nodes.forEach(function (d) {
        var coords = {
          x: graphWrapper.width / 2,
          y: graphWrapper.height / 2
        };
        d.x = d.x ? d.x : coords.x;
        d.y = d.y ? d.y : coords.y;
        d.fx = d.type == "root" ? coords.x : undefined;
        d.fy = d.type == "root" ? coords.y : undefined;
        d.x0 = d.x;
        d.y0 = d.y;
      });
      var forceCharge = d3Force.forceManyBody().strength(-30);
      var forceCollide = d3Force.forceCollide(function (d) {
        return d.radius * 2;
      });
      simulation.force("charge", forceCharge).force("collide", forceCollide).force("center", d3Force.forceCenter(graphWrapper.width / 2, graphWrapper.height / 2));
      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.alpha(0.3).restart();

      for (var i = 0, n = 300; i < n; ++i) {
        simulation.tick();
      }

      nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
      draw(nodes, links, newEle.accessors);
      return {
        nodes: nodes,
        links: links
      };
    } //updateGraph: things to do once marker on slider is moved

  } //networkLayout


  networkLayout.selector = function (_) {
    return arguments.length ? (selector = _, networkLayout) : selector;
  };

  networkLayout.width = function (_) {
    return arguments.length ? (width = _, networkLayout) : width;
  };

  networkLayout.height = function (_) {
    return arguments.length ? (height = _, networkLayout) : height;
  };

  networkLayout.start = function (_) {
    return arguments.length ? (start = _, networkLayout) : start;
  };

  networkLayout.end = function (_) {
    return arguments.length ? (end = _, networkLayout) : end;
  };

  networkLayout.style = function (_) {
    return arguments.length ? (style = _, networkLayout) : style;
  };

  return networkLayout;
} //network

exports.network = network;

Object.defineProperty(exports, '__esModule', { value: true });

})));

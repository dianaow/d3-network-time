(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-force'), require('d3-selection'), require('d3-transition'), require('d3-scale')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3-force', 'd3-selection', 'd3-transition', 'd3-scale'], factory) :
(global = global || self, factory(global.d3 = global.d3 || {}, global.d3, global.d3, global.d3, global.d3));
}(this, (function (exports, d3Force, d3Selection, d3Transition, d3Scale) { 'use strict';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

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

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var nodeStrokeWidth = 2;
var nodeTextOpacity = 0.8;
var nodeTextSize = 12;
var nodeTextFill = "gray";
var linkTextOpacity = 0;
var linkTextSize = 8;
var linkTextFill = "gray";
var transitionDuration = 750;
var colorScale = d3Scale.scaleOrdinal().range(["#E10100", "#00bcd4", "#3f51b5"]).domain(["root", "parent", "children"]);

var radiusAccessor = function radiusAccessor(d) {
  return 3;
};

var nodeOpacityAccessor = function nodeOpacityAccessor() {
  return 1;
};

var nodeColorAccessor = function nodeColorAccessor(d) {
  return colorScale(d.type);
};

var linkWidthAccessor = function linkWidthAccessor() {
  return 2;
};

var linkOpacityAccessor = function linkOpacityAccessor() {
  return 1;
};

var linkColorAccessor = function linkColorAccessor() {
  return "gray";
};

var strengthAccessor = function strengthAccessor() {
  return 0.5;
};

var defaultGraphElements = {
  nodeStrokeWidth: nodeStrokeWidth,
  nodeTextOpacity: nodeTextOpacity,
  nodeTextSize: nodeTextSize,
  nodeTextFill: nodeTextFill,
  linkTextOpacity: linkTextOpacity,
  linkTextSize: linkTextSize,
  linkTextFill: linkTextFill,
  transitionDuration: transitionDuration,
  radiusAccessor: radiusAccessor,
  nodeOpacityAccessor: nodeOpacityAccessor,
  nodeColorAccessor: nodeColorAccessor,
  linkWidthAccessor: linkWidthAccessor,
  linkOpacityAccessor: linkOpacityAccessor,
  linkColorAccessor: linkColorAccessor,
  strengthAccessor: strengthAccessor
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

Date.prototype.addYears = function (value) {
  var date = new Date(this.valueOf());
  date.setFullYear(date.getFullYear() + value);
  return date;
};

Date.prototype.addMonths = function (value) {
  var date = new Date(this.valueOf());
  date.setMonth(date.getMonth() + value);
  return date;
};

Date.prototype.addDays = function (value) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + value);
  return date;
};

Date.prototype.addWeeks = function (value) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + value * 7);
  return date;
};

Date.prototype.addHours = function (value) {
  var date = new Date(this.valueOf());
  date.setHours(date.getHours() + value);
  return date;
};

Date.prototype.addMinutes = function (value) {
  var date = new Date(this.valueOf());
  date.setMinutes(date.getMinutes() + value);
  return date;
};

Date.prototype.addSeconds = function (value) {
  var date = new Date(this.valueOf());
  date.setSeconds(date.getSeconds() + value);
  return date;
};

Date.prototype.addMilliseconds = function (value) {
  var date = new Date(this.valueOf());
  date.setMilliseconds(date.getMilliseconds() + value);
  return date;
};

function addFunc(currentDate, step) {
  if (step === "year") {
    return currentDate.addYears(1);
  } else if (step === "month") {
    return currentDate.addMonths(1);
  } else if (step === "day") {
    return currentDate.addDays(1);
  } else if (step === "week") {
    return currentDate.addWeeks(1);
  } else if (step === "hour") {
    return currentDate.addHours(1);
  } else if (step === "minute") {
    return currentDate.addMinutes(1);
  } else if (step === "second") {
    return currentDate.addSeconds(1);
  } else if (step === "millisecond") {
    return currentDate.addMilliseconds(1);
  }
}

function getDates(startDate, stopDate, step) {
  startDate = new Date(startDate);
  stopDate = new Date(stopDate);
  var dateArray = new Array();
  var currentDate = startDate;

  while (currentDate <= stopDate) {
    dateArray.push(currentDate);
    currentDate = addFunc(currentDate, step);
  }

  return dateArray;
}

function network(simulation) {
  var width = 800;
  var height = 800;
  var style = {};
  var animation = {
    mode: null,
    step: "day",
    show_time: "false"
  };
  var start = new Date();
  var end = new Date();
  var selector = "body";
  var linkedByIndex = [];

  function networkLayout(_ref) {
    var data = _extends({}, _ref);

    var graphEle = _objectSpread2(_objectSpread2({}, defaultGraphElements), style);

    var _animation = animation,
        mode = _animation.mode,
        step = _animation.step,
        show_time = _animation.show_time;
    var graphWrapper = {
      width: width,
      height: height
    };
    simulation = simulation || d3Force.forceSimulation();
    var timeline = getDates(start, end, step);
    var START = timeline[0]; //if start date is not specified, default to first date found in data

    var END = timeline[timeline.length - 1]; //if end date is not specified, default to last date found in data

    data.date = START;

    var current = _extends({}, data);

    if (d3Selection.select(selector).select("svg").empty()) {
      if (show_time === true) {
        d3Selection.select(selector).append("h1").attr("class", "timeHeader");
      }

      var svg = d3Selection.select(selector).append("svg").attr("class", "networkWrapper").attr("width", graphWrapper.width).attr("height", graphWrapper.height).attr("fill", "transparent");
      var g = svg.append("g").attr("class", "network");
      g.append("g").attr("class", "links");
      g.append("g").attr("class", "nodes");
    }

    if (mode === null) {
      updateGraph(data, current);
    } else if (mode === "auto") {
      var T, index;
      var timerun = {
        playing: true,
        status: "play",
        initial: true
      };
      var dates = timeline.map(function (d) {
        return d;
      });
      dates = dates.filter(function (d) {
        return d >= START & d <= END;
      });

      if (timerun.initial) {
        index = 0;
      } else {
        index = dates.indexOf(current.date); // restart animation from date last stopped at
      }

      if (timerun.playing) {
        T = setInterval(function () {
          current.date = timeline[index];
          d3Selection.select(".timeHeader").html(current.date);
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
        current.date = timeline[index];
        var graph = updateGraph(data, current);
        current.nodes = graph.nodes;
        current.links = graph.links;
      }

      if (timerun.playing === false & timerun.status === "end") {
        clearInterval(T);
        current.date = timeline[dates.length - 1];

        var _graph = updateGraph(data, current);

        current.nodes = _graph.nodes;
        current.links = _graph.links;
      }
    } else if (mode === "step") {
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
      graphNodesData.exit().select("circle").transition().duration(graphEle.transitionDuration).attr("r", 0).remove();
      graphNodesData.exit().select("rect").transition().duration(graphEle.transitionDuration).attr("width", 0).attr("height", 0).remove();
      graphNodesData.exit().select("text").remove();
      graphNodesData.exit().transition().duration(graphEle.transitionDuration).remove();
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
      }).attr("stroke", function (d) {
        return d.strokeColor;
      }).attr("opacity", function (d) {
        return d.opacity;
      }).attr("fill", function (d) {
        return d.color;
      }); // DRAW NODE LABELS

      var textChildrenNode = graphNodesEnter.filter(function (d) {
        return !root(d);
      });
      textChildrenNode.append("text").attr("class", "node-label").attr("font-size", "".concat(graphEle.nodeTextSize, "px")).attr("text-anchor", "middle").attr("fill", graphEle.nodeTextFill).attr("opacity", graphEle.nodeTextOpacity).attr("x", function (d) {
        return berects(d) ? d.radius : 0;
      }).attr("y", function (d) {
        return berects(d) ? -10 : -d.radius - 8;
      }).text(function (d) {
        return "".concat(d.id);
      });
      var textRootNode = graphNodesEnter.filter(function (d) {
        return root(d);
      });
      textRootNode.append("text").attr("class", "root-label").attr("font-size", "".concat(graphEle.nodeTextSize * 2, "px")).attr("text-anchor", "middle").attr("fill", graphEle.nodeTextFill).attr("opacity", 1).attr("x", function (d) {
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
      graphNodesData.transition().duration(graphEle.transitionDuration).attr("transform", function (d) {
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
      graphLinksData.exit().select("path").transition().duration(graphEle.transitionDuration).attr("d", function (d) {
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
      graphLinksData.exit().transition().duration(graphEle.transitionDuration).remove();
      var graphLinksEnter = graphLinksData.enter().append("g").attr("id", function (d) {
        return "path-group-" + linkKey(d);
      });
      graphLinksEnter.append("path").attr("class", "link").attr("id", function (d) {
        return "path-" + linkKey(d);
      }).attr("stroke-width", function (d) {
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

      graphLinksEnter.append("text").attr("class", "edge-label").attr("font-size", "".concat(graphEle.linkTextSize, "px")).attr("text-anchor", "middle").attr("fill", graphEle.linkTextFill).attr("opacity", graphEle.linkTextOpacity).attr("dy", -2).append("textPath").attr("xlink:href", function (d) {
        return "#path-" + linkKey(d);
      }).attr("startOffset", "50%").text(function (d) {
        return "".concat(d.label);
      });
      graphLinksData = graphLinksEnter.merge(graphLinksData);
      graphLinksData.selectAll(".link").transition().duration(graphEle.transitionDuration).attr("opacity", function (d) {
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
        var hoverAttr = {
          hover_textOpacity: 0,
          hover_strokeOpacity: 0.2
        };
        highlightConnections(graphNodesData, graphLinksData, d, hoverAttr);
      }

      function hoverOut() {
        unhighlightConnections(graphNodesData, graphLinksData);
      }

      function highlightConnections(graphNodesData, graphLinksData, d, hoverAttr) {
        var hover_textOpacity = hoverAttr.hover_textOpacity,
            hover_strokeOpacity = hoverAttr.hover_strokeOpacity;

        function isConnected(a, b) {
          return linkedByIndex["".concat(a.id, ",").concat(b.id)] || linkedByIndex["".concat(b.id, ",").concat(a.id)] || a.id === b.id;
        }

        graphNodesData.selectAll(".node").attr("opacity", function (o) {
          return isConnected(d, o) ? 1 : hover_strokeOpacity;
        }).style("pointer-events", function (o) {
          return isConnected(d, o) ? "auto" : "none";
        });
        graphNodesData.selectAll(".root-label").attr("opacity", function (o) {
          return isConnected(d, o) ? 1 : hover_textOpacity;
        });
        graphNodesData.selectAll(".node-label").attr("opacity", function (o) {
          return isConnected(d, o) ? 1 : hover_textOpacity;
        });
        graphLinksData.selectAll(".link").attr("opacity", function (o) {
          return o.source === d || o.target === d ? 1 : hover_strokeOpacity;
        });
        graphLinksData.selectAll(".edge-label").attr("opacity", function (o) {
          return o.source === d || o.target === d ? 0.5 : hover_textOpacity;
        });
      }

      function unhighlightConnections(graphNodesData, graphLinksData) {
        graphNodesData.selectAll(".node").attr("opacity", graphEle.nodeOpacity).style("pointer-events", "auto");
        graphNodesData.selectAll(".root-label").attr("opacity", 1);
        graphNodesData.selectAll(".node-label").attr("opacity", graphEle.nodeTextOpacity);
        graphLinksData.selectAll(".link").attr("opacity", 1);
        graphLinksData.selectAll(".edge-label").attr("opacity", graphEle.linkTextOpacity);
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

      nodes.forEach(function (d) {
        d.type = findType(d);
      });
      links.forEach(function (d) {
        d.type = nodes.find(function (el) {
          return el.id === d.start_id;
        }).type;
      });
      nodes.forEach(function (d) {
        d.radius = graphEle.radiusAccessor(d);
        d.color = graphEle.nodeColorAccessor(d);
        d.strokeColor = graphEle.nodeColorAccessor(d);
        d.opacity = graphEle.nodeOpacityAccessor(d);
        d.strokeWidth = graphEle.nodeStrokeWidth;
      });
      links.forEach(function (d) {
        d.strokeColor = graphEle.linkColorAccessor(d);
        d.strokeWidth = graphEle.linkWidthAccessor(d);
        d.opacity = graphEle.linkOpacityAccessor(d);
        d.strength = graphEle.strengthAccessor(d);
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
        return d.date > date.getTime();
      });
      var linksRemove = OrigData.links.filter(function (d) {
        return d.date > date.getTime();
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
      }); // remove links that do not have either a start and end node in nodes variable

      var nodeIDs = nodes.map(function (d) {
        return d.id;
      });
      links = links.filter(function (d) {
        return nodeIDs.indexOf(d.start_id) !== -1 & nodeIDs.indexOf(d.end_id) !== -1;
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

  networkLayout.animation = function (_) {
    return arguments.length ? (animation = _, networkLayout) : animation;
  };

  return networkLayout;
} //network

exports.network = network;

Object.defineProperty(exports, '__esModule', { value: true });

})));

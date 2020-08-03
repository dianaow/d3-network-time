# d3-network-time

This is a d3 plugin to create a temporal network visualization.

[d3-force](https://github.com/d3/d3-force) is used to construct the graph layout. This plugin can be used in two ways:

- dynamic: animates the evolution of the network over time, with the option to display each iteration between dates, or just a single step transition between two dates
- static: only displays the network at a specific point in time

![alt text](https://github.com/dianaow/d3-network-time/raw/master/example.gif "Example GIF")

## Examples

- an [example](https://github.com/dianaow/d3-network-time/blob/master/example/index.html) for a highly connected graph
- an [example](https://github.com/dianaow/d3-network-time/blob/master/example/index.html) for a disjointed graph, showing how to use the API with element styling

## Installing

If you use NPM, `npm install d3-network-time` and import it with

```js
import { network } from "d3-network-time"
```

Otherwise, download the [latest build](https://github.com/dianaow/d3-network-time/tree/master/build). AMD, CommonJS, and vanilla environments are supported. In vanilla, you must include a script tag with the d3 library before including `d3-network-map.js`, and a d3 global is exported:

```html
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="d3-network-map.js"></script>
<script>
  var network = d3.network()

  var simulation = d3.forceSimulation()

  var radiusScale = d3.scaleSqrt().domain([1, 50]).range([3, 25])
  var radiusAccessor = (d) => radiusScale(d.value)

  network(simulation)
    .selector(".Network")
    .width(1200)
    .height(800)
    .start(1217567877)
    .end(1218036494)
    .animation({ mode: "auto", step: "day", show_time: true })
    .style({ radiusAccessor })(data)
</script>
```

## API Reference

<a href="#network" name="network">#</a> d3.<b>network</b>()

Constructs a new network generator with the default configuration values.

<a href="#_network" name="_network">#</a> <i>network</i>(<i>data</i>)

Creates a network layout with the specified _data_. The animation starts automatically.

The dataset must contain an object of nodes and links with the following attributes:

Timestamps of nodes and links must be in <b>UNIX Epoch time</b>.

```js
var data = {
  nodes: [
    {
      id: "1",
      date: 1217567877000,
    },
    {
      id: "2",
      date: 1217567877000,
    },
    {
      id: "3",
      date: 1218036494000,
    },
  ],
  links: [
    {
      start_id: "1",
      end_id: "2",
      date: 1217567877000,
    },
    {
      start_id: "1",
      end_id: "3",
      date: 1218036494000,
    },
  ],
}
```

<a href="#network" name="network">#</a> <i>network</i>([<i>simulation</i>])

This is the new simulation to initialize. Users can specify forces to layout the graph according to their requirements. Nodes and edges should not be specified here.

<a href="#network_selector" name="network_selector">#</a> <i>network</i>.<b>selector</b>([<i>selector</i>])

This is the CSS selector for the div element containing the svg element in which the network is rendered in.

<a href="#network_height" name="network_height">#</a> <i>network</i>.<b>height</b>([<i>height</i>])

This _height_ gives the height of the svg element in which the network is rendered in. If height is not specified, it defaults to 800 pixels.

<a href="#network_width" name="network_width">#</a> <i>network</i>.<b>width</b>([<i>width</i>])

This _width_ gives the width of the svg element in which the network is rendered in. If width is not specified, it defaults to 800 pixels.

<a href="#network_start" name="network_start">#</a> <i>network</i>.<b>start</b>([<i>start</i>])

_start_ represents the date (a UNIX Epoch timestamp) which the animation begins at. If _start_ is not specified, returns the first date found in data.links.

<a href="#network_end" name="network_end">#</a> <i>network</i>.<b>end</b>([<i>end</i>])

_end_ represents the date (a UNIX Epoch timestamp) which the animation stops. If _end_ is not specified, returns the last date found in data.links.

<a href="#network_animation" name="network_">#</a> <i>network</i>.<b>animation</b>([<i>animation</i>])

The _animation_ represents the animation parameters. If _animation_ is not specified, it defaults to `{mode: null, step: 'day', show_time: false}`. This is a static render of graph only at the specified _start_ value, ignoring the _end_ value, if provided.

If _animation.mode_ is <b>'auto'</b>, the animation runs upon function invocation, displaying each iteration between a range of dates between _start_ and _end_ value. If _style.mode_ is <b>'step'</b>, then only a transition between _start_ and _end_ value is displayed.

_animation.step_: represents the time iteration gap and has to be any of the following values: `['year', 'month', 'day', 'week', 'hour', 'minute', 'second', 'millisecond']`

_animation.show_time_: allows user to show or hide the timestamp header

<a href="#network_style" name="network_">#</a> <i>network</i>.<b>style</b>([<i>style</i>])

The _style_ represents the style of the graph elements. If _style_ is not specified, it defaults to the styles specified in [consts.js](https://github.com/dianaow/d3-network-time/blob/master/src/consts.js). Some attributes such as node and edge color and opacity have to be represented as accessors, while some attributes such as text size and color are represented as a single value.

npm version history:

0.0.1-0.0.3: Time iteration based on YYYY-MM-DD datetime string
0.1.0: Time iteration based on UNIX epoch timstamp
0.2.0: Allow user to style graph elements and customize force-directed layout

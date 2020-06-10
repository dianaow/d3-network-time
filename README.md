# d3-network-time

This is a d3 plugin to create a temporal network visualization.

[d3-force](https://github.com/d3/d3-force) is used to construct the graph layout. This plugin can be used in two ways:

- dynamic: animates the evolution of the network over time, with the option to display each iteration between dates, or just a single step transition between two dates
- static: only displays the network at a specific point in time

![](example.mov)

## Examples

- an [example](https://observablehq.com/@dianaow/temporal-network-visualization) visualizing changes to a single network with a fixed root over time
- an [example](https://observablehq.com/@dianaow/temporal-network-visualization/2) visualizing changes to a disjointed network over time

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

  //Example
  network
    .selector(".Network")
    .width(1200)
    .height(800)
    .start(1217567877)
    .end(1218036494)
    .style({ mode: "auto", step: "day", show_time: true })(data)
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
      date: 1217567877,
    },
    {
      id: "2",
      date: 1217567877,
    },
    {
      id: "3",
      date: 1218036494,
    },
  ],
  links: [
    {
      start_id: "1",
      end_id: "2",
      date: 1217567877,
    },
    {
      start_id: "1",
      end_id: "3",
      date: 1218036494,
    },
  ],
}
```

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

<a href="#network_style" name="network_style">#</a> <i>network</i>.<b>style</b>([<i>style</i>])

The _style_ represents the animation parameters. If _style_ is not specified, it defaults to `{mode: null, step: 'day', show_time: false}`. This is a static render of graph only at the specified _start_ value, ignoring the _end_ value, if provided.

If _style.mode_ is 'auto', the animation runs upon function invocation, displaying each iteration between a range of dates between _start_ and _end_ value. If _style.mode_ is 'step', then only a transition between _start_ and _end_ value is displayed.

_style.step_: represents the time iteration gap and has to be any of the following values: `['year', 'month', 'day', 'week', 'hour', 'minute', 'second', 'millisecond']`

_style.show_time_: allows user to show or hide the timestamp header

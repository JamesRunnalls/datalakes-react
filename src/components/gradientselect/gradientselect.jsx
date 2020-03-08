import React, { Component } from "react";
import * as d3 from "d3";
import "./gradientselect.css";

class GradientSelect extends Component {
  state = {};

  histogram = (array, bins) => {
    var min = Math.min(...array);
    var max = Math.max(...array);
    var bin_width = (max - min) / bins;
    var data = [];
    var x, index;
    for (var i = 0; i < bins; i++) {
      x = min + i * bin_width;
      data.push({ x: x, y: 0 });
    }
    for (var i = 0; i < array.length; i++) {
      index = Math.max(Math.ceil((array[i] - min) / bin_width) - 1, 0);
      data[index].y++;
    }
    return { bin_width: bin_width, data: data };
  };

  plotHistogram = async () => {
    try {
      d3.select("#histogramsvg").remove();
    } catch (e) {}

    var { array } = this.props;
    if (this.props.array.length > 0) {
      try {
        var bins = 200;

        var { bin_width, data } = this.histogram(array, bins);

        // Set graph size
        var margin = { top: 0, right: 0, bottom: 0, left: 0 },
          histogramwidth = d3
            .select("#histogram")
            .node()
            .getBoundingClientRect().width,
          histogramheight = d3
            .select("#histogram")
            .node()
            .getBoundingClientRect().height,
          width = histogramwidth,
          height = histogramheight;

        var svg = d3
          .select("#histogram")
          .append("svg")
          .attr("id", "histogramsvg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        var x = d3
          .scaleLinear()
          .range([0, width])
          .domain([Math.min(...array), Math.max(...array)]);

        var xx = d3
          .scaleLinear()
          .range([0, width])
          .domain([Math.min(...array), Math.max(...array)]);

        var y = d3.scaleLinear().range([height, 0]);
        y.domain([
          0,
          d3.max(data, function(d) {
            return d.y;
          })
        ]);

        var yy = d3.scaleLinear().range([height, 0]);
        y.domain([
          0,
          d3.max(data, function(d) {
            return d.y;
          })
        ]);

        var bars = svg
          .selectAll("rect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", function(d) {
            return x(d.x);
          })
          .attr("y", function(d) {
            return y(d.y);
          })
          .attr("width", x(bin_width))
          .attr("height", function(d) {
            return height - y(d.y);
          })
          .style("fill", "#000");

        // Zooming and Panning
        var zoom = d3
          .zoom()
          .extent([
            [0, 0],
            [width, height]
          ])
          .scaleExtent([1, 32])
          .translateExtent([
            [0, 0],
            [width, height]
          ])
          .on("zoom", normalzoom);

        var zoombox = svg
          .append("rect")
          .attr("id", "zoombox")
          .attr("width", width)
          .attr("height", height)
          .style("fill", "none")
          .style("cursor", "move")
          .attr("pointer-events", "all")
          .call(zoom);

        function plotbars() {}

        function normalzoom() {
          //console.log(d3.event.transform.rescaleY(yy))
          //console.log(y.domain(),d3.event.transform.rescaleX(yy).domain())
          x.domain(d3.event.transform.rescaleX(xx).domain());
          //y.domain(d3.event.transform.rescaleY(yy).domain());


          bars
            .attr("x", function(d) {
              return x(d.x);
            })
            .attr("y", function(d) {
              return y(d.y);
            })
            .attr("width", x(bin_width))
            .attr("height", function(d) {
              return height - y(d.y);
            })
            .style("fill", "#23D63B");
        }
      } catch (e) {
        console.error("Error plotting histogram", e);
      }
    }
  };

  componentDidMount() {
    this.plotHistogram();
  }

  componentDidUpdate() {
    this.plotHistogram();
  }

  render() {
    return (
      <div>
        <div id="histogram" className="gradientselect-histogram"></div>
      </div>
    );
  }
}

export default GradientSelect;

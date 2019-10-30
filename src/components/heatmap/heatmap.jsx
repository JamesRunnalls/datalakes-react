import React, { Component } from "react";
import * as d3 from "d3";
import { format } from "date-fns";
import { generateColorRGB } from "../gradients/gradients";
import "./heatmap.css";

class D3HeatMap extends Component {
  formatDate = raw => {
    return new Date(raw * 1000);
  };

  plotHeatMap = () => {
    try {
      d3.select("svg").remove();
      d3.select("canvas").remove();
    } catch (e) {}

    var { data, graphtype, bcolor, sgradient, egradient } = this.props;
    const formatDate = this.formatDate;

    // Set graph size
    var margin = { top: 20, right: 20, bottom: 50, left: 50 },
      viswidth = d3
        .select("#heatmap")
        .node()
        .getBoundingClientRect().width,
      visheight = d3
        .select("#heatmap")
        .node()
        .getBoundingClientRect().height,
      width = viswidth - margin.left - margin.right,
      height = visheight - margin.top - margin.bottom;

    // Get data extents
    if (graphtype == "time") {
      var xe = d3.extent(data.x);
      var xdomain = [this.formatDate(xe[0]), this.formatDate(xe[1])];
    } else {
      var xdomain = d3.extent(data.x);
    }
    var ydomain = d3.extent(data.y);
    var vdomain = d3.extent(
      [].concat.apply([], data.v).filter(f => {
        return !isNaN(parseFloat(f)) && isFinite(f);
      })
    );

    // Calculate bar widths
    // x
    var bwa = [];
    var bha = [];

    bwa = Array(data.x.length).fill(2);
    bha = Array(data.y.length).fill(10);

    // Set color gradients
    var ncolors = 100;
    var gradient = generateColorRGB(sgradient, egradient, ncolors);
    var colorScale = v => {
      if (isNaN(v)) {
        return "rgba(255,255,255,0)";
      }
      var i = Math.round(
        ((v - vdomain[0]) / (vdomain[1] - vdomain[0])) * (ncolors - 1)
      );
      return gradient[i];
    };

    // Format X-axis
    var x = d3
      .scaleTime()
      .range([0, width])
      .domain(xdomain);

    // Format Y-axis
    var y = d3
      .scaleLinear()
      .range([height, 0])
      .domain(ydomain);

    // Define the axes
    var xAxis = d3.axisBottom(x).ticks(5);
    var yAxis = d3.axisLeft(y).ticks(5);

    // Adds the svg
    var svg = d3
      .select("#heatmap")
      .append("svg")
      .attr("id", "svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Adds the canvas
    var canvas = d3
      .select("#heatmap")
      .append("canvas")
      .attr("width", width)
      .attr("height", height)
      .style("margin-left", margin.left + "px")
      .style("margin-top", margin.top + "px")
      .style("position", "absolute")
      .style("left", "10px")
      .attr("class", "canvas-plot")
      .call(
        d3
          .zoom()
          .scaleExtent([1, 20])
          .extent([[0, 0], [width, height]])
          .on("zoom", () => {
            context.save();
            updateChart(d3.event.transform);
            context.restore();
          })
      );
    
    // Change double click behavior from zoom to reset
    canvas.on("dblclick.zoom", null).on("dblclick", () => {
      updateChart(d3.zoomIdentity);
    });

    const context = canvas.node().getContext("2d");

    // Background color
    var background = svg
      .append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("fill", bcolor)
      .attr("transform", "translate(-" + margin.left + ",-" + margin.top + ")");

    // Set clip
    var clip = svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);

    // Add the X Axis
    if (graphtype === "time") {
      var gxAxis = svg
        .append("g")
        .attr("class", "x axis")
        .attr("id", "axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    } else {
      var xLabel = "";
      if ("xlabel" in this.props) {
        xLabel = this.props.xlabel;
      }

      var xunits = "";
      if ("xunits" in this.props) {
        xunits = this.props.xunits;
        xLabel = this.props.xlabel + " (" + xunits + ")";
      }

      var gxAxis = svg
        .append("g")
        .attr("class", "x axis")
        .attr("id", "axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg
        .append("text")
        .attr(
          "transform",
          "translate(" + width / 2 + " ," + (height + margin.bottom / 1.5) + ")"
        )
        .attr("x", 6)
        .attr("dx", "1em")
        .style("text-anchor", "end")
        .text(xLabel);
    }

    // Add the Y Axis
    var yLabel = "";
    if ("ylabel" in this.props) {
      yLabel = this.props.ylabel;
    }

    var yunits = "";
    if ("yunits" in this.props) {
      yunits = this.props.yunits;
      yLabel = this.props.ylabel + " (" + yunits + ")";
    }

    var gyAxis = svg
      .append("g")
      .attr("class", "y axis")
      .attr("id", "axis--y")
      .call(yAxis);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(yLabel);

    // Plot data to canvas
    updateChart(d3.zoomIdentity);

    function fillCanvas(scaleX,scaleY,k) {
      for (var xx in data.x) {
        for (var yy in data.y) {
          if (graphtype == "time") {
            var dx = scaleX(formatDate(data.x[xx]));
          } else {
            var dx = scaleX(data.x[xx]);
          }
          var dy = scaleY(data.y[yy]);
          var dv = data.v[yy][xx];
          var bw = bwa[xx]*k;
          var bh = bha[yy]*k;
          drawRect(dx, dy, dv, bw, bh);
        }
      }
    }

    function drawRect(dx, dy, dv, bw, bh) {
      context.fillStyle = colorScale(dv);
      context.fillRect(dx, dy, bw, bh);
    }

    function updateChart(transform) {
      var scaleX = transform.rescaleX(x);
      var scaleY = transform.rescaleY(y);

      gxAxis.call(xAxis.scale(scaleX));
      gyAxis.call(yAxis.scale(scaleY));

      context.clearRect(0, 0, width, height);

      fillCanvas(scaleX,scaleY,transform.k);
    }
  };

  componentDidMount() {
    window.addEventListener("resize", this.plotHeatMap);
    this.plotHeatMap();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plotHeatMap);
  }

  componentDidUpdate() {
    this.plotHeatMap();
  }

  render() {
    return <div id="heatmap"></div>;
  }
}

export default D3HeatMap;

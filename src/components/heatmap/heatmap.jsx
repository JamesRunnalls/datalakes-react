import React, { Component } from "react";
import * as d3 from "d3";
import { format } from "date-fns";
import { generateColorRGB } from "../gradients/gradients";
import "./heatmap.css";

class D3HeatMap extends Component {
  plotHeatMap = () => {
    try {
      d3.select("svg").remove();
      d3.select("canvas").remove();
    } catch (e) {}

    var {
      data,
      graphtype,
      bcolor,
      sgradient,
      egradient,
      yint,
      xint
    } = this.props;

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
    if (graphtype === "time") {
      var parseDate = d3.timeParse("%Y");
      var xdomain = d3.extent(data, function(d) {
        if (d.x instanceof Date) {
        } else {
          d.x = parseDate(d.x.toString());
        }
        return d.x;
      });
    } else {
      var xdomain = d3.extent(data, function(d) {
        d.x = parseFloat(d.x);
        return d.x;
      });
    }

    var ydomain = d3.extent(data, function(d) {
      d.y = parseFloat(d.y);
      return d.y;
    });

    var vdomain = d3.extent(data, function(d) {
      d.v = parseFloat(d.v);
      return d.v;
    });

    // Set color gradients
    var ncolors = 100;
    var gradient = generateColorRGB(
      this.props.sgradient,
      this.props.egradient,
      ncolors
    );
    var colorScale = v => {
      var i = Math.round(
        ((v - vdomain[0]) / (vdomain[1] - vdomain[0])) * (ncolors - 1)
      );
      return gradient[i];
    };

    // Get axis arrays
    var xarray = [];
    var yarray = [];
    for (var d of data) {
      if (!xarray.includes(d.x)) {
        xarray.push(d.x);
      }
      if (!yarray.includes(d.y)) {
        yarray.push(parseFloat(d.y));
      }
    }

    yarray.sort(function(a, b) {
      return a - b;
    });
    if (graphtype === "time") {
      xarray.sort(function(a, b) {
        return a.valueOf() - b.valueOf();
      });
    } else {
      xarray.sort(function(a, b) {
        return a - b;
      });
    }

    // Format X-axis
    var x = d3
      .scaleBand()
      .range([0, width])
      .domain(xarray)
      .padding(-0.001);

    // Format Y-axis
    var y = d3
      .scaleBand()
      .range([height, 0])
      .domain(yarray)
      .padding(-0.001);

    // Define the axes
    var maxticks = 8;
    var xticks = Math.round(xarray.length / maxticks / 10);
    var xAxis = d3
      .axisBottom(x)
      .tickFormat(d3.timeFormat("%d-%b-%Y"))
      .tickValues(
        x.domain().filter(function(d, i) {
          return !(i % xticks);
        })
      );
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
      .attr("class", "canvas-plot");

    const context = canvas.node().getContext('2d');

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
      svg
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

      svg
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

    svg
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
    data.forEach(d => {
      drawRect(d);
    });

    function drawRect(d) {
      context.fillStyle = colorScale(d.v);
      context.fillRect(x(d.x), y(d.y), x.bandwidth(), y.bandwidth());
    }

    //var context = canvas.node().getContext("2d");

    // Plot data
    /*
    var heat = svg.selectAll()
        .data(data, function(d) {return d.x+':'+d.y;})
        .enter()
        .append("g")
        .attr("id", "scatterplot")
        .attr("clip-path", "url(#clip)");

    heat.append("rect")
        .attr("x", function(d) { return x(d.x) })
        .attr("y", function(d) { return y(d.y) })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return colorScale(d.v)} )
    */
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

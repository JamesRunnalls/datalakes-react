import React, { Component } from "react";
import * as d3 from "d3";
import { format } from "date-fns";
import { generateColorRGB } from "../gradients/gradients";
import "./heatmap.css";

class D3HeatMap extends Component {
  formatDate = raw => {
    return new Date(raw * 1000);
  };

  unformatDate = date => {
    return date.valueOf() / 1000;
  };

  closest = (num, arr) => {
    var curr = arr[0];
    var diff = Math.abs(num - curr);
    for (var val = 0; val < arr.length; val++) {
      var newdiff = Math.abs(num - arr[val]);
      if (newdiff < diff) {
        diff = newdiff;
        curr = val;
      }
    }
    return curr;
  };

  median = arr => {
    const mid = Math.floor(arr.length / 2),
      nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  };

  gaps = arr => {
    var out = [];
    for (var i = 1; i < arr.length; i++) {
      out.push(arr[i] - arr[i - 1]);
    }
    return out;
  };

  plotHeatMap = () => {
    try {
      d3.select("svg").remove();
      d3.select("canvas").remove();
    } catch (e) {}

    var {
      data,
      graphtype,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      bcolor,
      sgradient,
      egradient,
      mintemp,
      maxtemp
    } = this.props;
    const { formatDate, unformatDate, closest, median, gaps } = this;
    var currentZoom = d3.zoomIdentity;

    // Set graph size
    var margin = { top: 20, right: 80, bottom: 50, left: 50 },
      viswidth = d3
        .select("#heatmap")
        .node()
        .getBoundingClientRect().width,
      visheight = d3
        .select("#heatmap")
        .node()
        .getBoundingClientRect().height - 5,
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
    if (mintemp != "" ){vdomain[0] = mintemp}
    if (maxtemp != "" ){vdomain[1] = maxtemp}

    // Set color gradients
    var ncolors = 100;
    var gradient = generateColorRGB(sgradient, egradient, ncolors);
    var colorScale = v => {
      if (isNaN(v)) {
        return "rgba(255,255,255,0)";
      }
      var i = 0;
      if (parseFloat(v) < parseFloat(mintemp)) {
        i = 0;
      } else if (parseFloat(v) > parseFloat(maxtemp)) {
        i = gradient.length - 1;
      } else {
        i = Math.round(((v - vdomain[0]) / (vdomain[1] - vdomain[0])) * (ncolors - 1));
      } 
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

    // Calculate bar widths
    var xp = [];
    var yp = [];
    for (var i of data.y) {
      yp.push(y(i));
    }
    if (graphtype === "time") {
      for (var i of data.x) {
        xp.push(x(formatDate(i)));
      }
    } else {
      for (var i of data.x) {
        xp.push(x(i));
      }
    }
    var bwa = gaps(xp);
    var bha = gaps(yp);
    var wm = median(bwa);
    var hm = median(bha);
    bwa.push(wm);
    bha.push(hm);
    bwa = bwa.map(s => {
      if (s > 2 * wm) {
        return wm;
      } else {
        return s;
      }
    });
    bha = bha.map(s => {
      if (s > 2 * hm) {
        return hm;
      } else {
        return s;
      }
    });

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
    const context = canvas.node().getContext("2d");
    context.globalCompositeOperation = "lighter";

    // Add zoom to canvas
    var zoom_function = d3
      .zoom()
      .scaleExtent([0.8, 1000])
      .extent([[0, 0], [width, height]])
      .on("zoom", () => {
        context.save();
        updateChart(d3.event.transform);
        context.restore();
      });
    canvas.call(zoom_function);

    // Change double click behavior from zoom to reset
    canvas.on("dblclick.zoom", null).on("dblclick", () => {
      var t = d3.zoomIdentity.translate(0, 0).scale(1);
      canvas
        .transition()
        .duration(200)
        .ease(d3.easeLinear)
        .call(zoom_function.transform, t);
    });

    // Add tooltip
    canvas.on("mousemove", () => {
      var scaleX = currentZoom.rescaleX(x);
      var scaleY = currentZoom.rescaleY(y);
      var hoverX = scaleX.invert(d3.event.layerX || d3.event.offsetX);
      var hoverY = scaleY.invert(d3.event.layerY || d3.event.offsetY);
      var yi = closest(hoverY, data.y);

      if (graphtype === "time") {
        var xi = closest(unformatDate(hoverX), data.x);
        document.getElementById("value").innerHTML =
          format(formatDate(data.x[xi]), "hh:mm dd MMM yy") +
          " | " +
          ylabel +
          ": " +
          data.y[yi] +
          yunits +
          " | " +
          zlabel +
          ": " +
          Math.round(data.v[yi][xi] * 100) / 100 +
          zunits;
      } else {
        var xi = closest(hoverX, data.x);
        document.getElementById("value").innerHTML =
          xlabel +
          ": " +
          data.x[xi] +
          xunits +
          " | " +
          ylabel +
          ": " +
          data.y[yi] +
          yunits +
          " | " +
          zlabel +
          ": " +
          Math.round(data.v[yi][xi] * 100) / 100 +
          zunits;
      }
    });
    canvas.on("mouseout", () => {
      document.getElementById("value").innerHTML = "";
    });

    // Background color
    var background = svg
      .append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("fill", bcolor)
      .attr("transform", "translate(-" + margin.left + ",-" + margin.top + ")");

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

    // Add the legend
    var defs = svg.append("defs");

    var svggradient = defs
      .append("linearGradient")
      .attr("id", "svgGradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");

    svggradient
      .append("stop")
      .attr("class", "start")
      .attr("offset", "0%")
      .attr("stop-color", egradient)
      .attr("stop-opacity", 1);

    svggradient
      .append("stop")
      .attr("class", "end")
      .attr("offset", "100%")
      .attr("stop-color", sgradient)
      .attr("stop-opacity", 1);

    svg
      .append("g")
      .append("rect")
      .attr("width", margin.right / 6)
      .attr("height", height)
      .attr("x", width + margin.right / 6)
      .attr("y", 0)
      .attr("fill","url(#svgGradient)");

    var t1 = Math.round(vdomain[1]*100)/100,
    t5 = Math.round(vdomain[0]*100)/100,
    t3 = Math.round(((t1 + t5)/2)*100)/100,
    t2 = Math.round(((t1 + t3)/2)*100)/100,
    t4 = Math.round(((t3 + t5)/2)*100)/100;
    
    svg
      .append("text")
      .attr("x", width + 2 + margin.right / 3)
      .attr("y", 10)
      .style("font-size", "12px")
      .text(t1+zunits);

    svg
      .append("text")
      .attr("x", width + 2 + margin.right / 3)
      .attr("y", height*0.25 + 3)
      .style("font-size", "12px")
      .text(t2+zunits);

    svg
      .append("text")
      .attr("x", width + 2 + margin.right / 3)
      .attr("y", height*0.5 + 3)
      .style("font-size", "12px")
      .text(t3+zunits);

    svg
      .append("text")
      .attr("x", width + 2 + margin.right / 3)
      .attr("y", height*0.75 + 3)
      .style("font-size", "12px")
      .text(t4+zunits);

    svg
      .append("text")
      .attr("x", width + 2 + margin.right / 3)
      .attr("y", height )
      .style("font-size", "12px")
      .text(t5+zunits);

    // Plot data to canvas
    updateChart(d3.zoomIdentity);

    function fillCanvas(scaleX, scaleY, k) {
      for (var xx in data.x) {
        for (var yy in data.y) {
          if (graphtype == "time") {
            var dx = scaleX(formatDate(data.x[xx]));
          } else {
            var dx = scaleX(data.x[xx]);
          }
          var dy = scaleY(data.y[yy]);
          var dv = data.v[yy][xx];
          var bw = bwa[xx] * k;
          var bh = bha[yy] * k;
          drawRect(dx, dy, dv, bw, bh);
        }
      }
    }

    function drawRect(dx, dy, dv, bw, bh) {
      var color = colorScale(dv);
      context.lineWidth = 1;
      context.strokeStyle = color;
      context.fillStyle = color;
      context.fillRect(dx, dy, bw, bh);
    }

    function updateChart(transform) {
      currentZoom = transform;
      var scaleX = transform.rescaleX(x);
      var scaleY = transform.rescaleY(y);
      gxAxis.call(xAxis.scale(scaleX));
      gyAxis.call(yAxis.scale(scaleY));
      context.clearRect(0, 0, width, height);
      fillCanvas(scaleX, scaleY, transform.k);
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
    var {
      data,
      graphtype,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      bcolor,
      sgradient,
      egradient,
      mintemp,
      maxtemp
    } = this.props;
    return (
      <React.Fragment>
        <div className="heat-header">
          <div className="heat-data" id="value"></div>
        </div>
        <div id="heatmap"></div>
      </React.Fragment>
    );
  }
}

export default D3HeatMap;

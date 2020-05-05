import React, { Component } from "react";
import * as d3 from "d3";
import { format } from "date-fns";
import { getColor } from "../../../components/gradients/gradients";
import "./heatmap.css";

class D3HeatMap extends Component {
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

  median = (arr) => {
    const mid = Math.floor(arr.length / 2),
      nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
  };

  gaps = (arr) => {
    var out = [];
    for (var i = 1; i < arr.length; i++) {
      out.push(arr[i] - arr[i - 1]);
    }
    return out;
  };

  plotHeatMap = () => {
    try {
      d3.select("#svg").remove();
      d3.select("#canvas").remove();
    } catch (e) {}
    if (this.props.data !== undefined) {
      try {
        var {
          data,
          xlabel,
          ylabel,
          zlabel,
          xunits,
          yunits,
          zunits,
          bcolor,
          gradient,
          sgradient,
          egradient,
        } = this.props;
        const { closest, median, gaps } = this;
        var currentZoom = d3.zoomIdentity;

        // Set graph size
        var margin = { top: 20, right: 80, bottom: 50, left: 50 },
          viswidth = d3.select("#heatmap").node().getBoundingClientRect().width,
          visheight =
            d3.select("#heatmap").node().getBoundingClientRect().height - 5,
          width = viswidth - margin.left - margin.right,
          height = visheight - margin.top - margin.bottom;

        // Get data extents
        var xdomain = d3.extent(data.x);
        var ydomain = d3.extent(data.y);
        var zdomain = d3.extent(
          [].concat.apply([], data.z).filter((f) => {
            return !isNaN(parseFloat(f)) && isFinite(f);
          })
        );

        // Set color gradients
        var colorScale = (v) => {
          return getColor(v, zdomain[0], zdomain[1], gradient);
        };

        // Format X-axis
        var x = d3.scaleTime().range([0, width]).domain(xdomain);

        // Format Y-axis
        var y = d3.scaleLinear().range([height, 0]).domain(ydomain);

        // Define the axes
        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y);

        // Calculate bar widths
        var xp = [];
        var yp = [];
        for (var i of data.y) {
          yp.push(y(i));
        }
        for (var k of data.x) {
          xp.push(x(k));
        }
        var bwa = gaps(xp);
        var bha = gaps(yp);
        var wm = median(bwa);
        var hm = median(bha);
        bwa.push(wm);
        bha.push(hm);
        bwa = bwa.map((s) => {
          if (s > 2 * wm) {
            return wm;
          } else {
            return s;
          }
        });
        bha = bha.map((s) => {
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
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

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
          .style("cursor", "grab")
          .attr("id", "canvas")
          .attr("class", "canvas-plot");
        const context = canvas.node().getContext("2d");
        context.globalCompositeOperation = "lighter";

        // Add zoom to canvas
        var zoom_function = d3
          .zoom()
          .scaleExtent([0.8, 1000])
          .extent([
            [0, 0],
            [width, height],
          ])
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

          var xi;
          if (xlabel === "Time") {
            xi = closest(hoverX, data.x);
            document.getElementById("value").innerHTML =
              format(data.x[xi], "hh:mm dd MMM yy") +
              " | " +
              ylabel +
              ": " +
              data.y[yi] +
              yunits +
              " | " +
              zlabel +
              ": " +
              Math.round(data.z[yi][xi] * 100) / 100 +
              zunits;
          } else {
            xi = closest(hoverX, data.x);
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
              Math.round(data.z[yi][xi] * 100) / 100 +
              zunits;
          }
        });
        canvas.on("mouseout", () => {
          document.getElementById("value").innerHTML = "";
        });

        // Add cursor change
        window.addEventListener("keydown", function (event) {
          if (event.ctrlKey) {
            canvas.style("cursor", "crosshair");
          }
        });
        window.addEventListener("keyup", function (event) {
          canvas.style("cursor", "grab");
        });

        // Background color
        svg
          .append("rect")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("fill", bcolor)
          .attr(
            "transform",
            "translate(-" + margin.left + ",-" + margin.top + ")"
          );

        // Add the X Axis
        var gxAxis;
        if (xlabel === "Time") {
          gxAxis = svg
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

          xunits = "";
          if ("xunits" in this.props) {
            xunits = this.props.xunits;
            xLabel = this.props.xlabel + " (" + xunits + ")";
          }

          gxAxis = svg
            .append("g")
            .attr("class", "x axis")
            .attr("id", "axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

          svg
            .append("text")
            .attr(
              "transform",
              "translate(" +
                width / 2 +
                " ," +
                (height + margin.bottom / 1.5) +
                ")"
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

        yunits = "";
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
          .attr("x1", "0")
          .attr("x2", "0")
          .attr("y1", "0")
          .attr("y2", "1");

        for (var g = gradient.length - 1; g > -1; g--) {
          svggradient
            .append("stop")
            .attr("class", "end")
            .attr("offset", 1 - gradient[g].point)
            .attr("stop-color", gradient[g].color)
            .attr("stop-opacity", 1);
        }

        svg
          .append("g")
          .append("rect")
          .attr("width", margin.right / 6)
          .attr("height", height)
          .attr("x", width + margin.right / 6)
          .attr("y", 0)
          .attr("fill", "url(#svgGradient)");

        var t1 = Math.round(zdomain[1] * 100) / 100,
          t5 = Math.round(zdomain[0] * 100) / 100,
          t3 = Math.round(((t1 + t5) / 2) * 100) / 100,
          t2 = Math.round(((t1 + t3) / 2) * 100) / 100,
          t4 = Math.round(((t3 + t5) / 2) * 100) / 100;

        svg
          .append("text")
          .attr("x", width + 2 + margin.right / 3)
          .attr("y", 10)
          .style("font-size", "12px")
          .text(t1);

        svg
          .append("text")
          .attr("x", width + 2 + margin.right / 3)
          .attr("y", height * 0.25 + 3)
          .style("font-size", "12px")
          .text(t2);

        svg
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", width + margin.right - 5)
          .attr("x", 0 - height / 2)
          .attr("dz", "1em")
          .style("text-anchor", "middle")
          .style("font-size", "12px")
          .text(zlabel + " (" + zunits + ")");

        svg
          .append("text")
          .attr("x", width + 2 + margin.right / 3)
          .attr("y", height * 0.75 + 3)
          .style("font-size", "12px")
          .text(t4);

        svg
          .append("text")
          .attr("x", width + 2 + margin.right / 3)
          .attr("y", height)
          .style("font-size", "12px")
          .text(t5);

        // Plot data to canvas
        setTimeout(() => {
          context.clearRect(0, 0, width, height);
          fillCanvas(x, y, 1);
        }, 10);

        d3.select("#heatmap-download").on("click", function () {
          var s = new XMLSerializer();
          var str = s.serializeToString(document.getElementById("svg"));

          var canvasout = document.createElement("canvas"),
            contextout = canvasout.getContext("2d");

          canvasout.width = viswidth;
          canvasout.height = visheight;

          var image = new Image();
          image.onerror = function () {
            alert("Appologies .png download failed. Please download as .svg.");
          };
          image.onload = function () {
            contextout.drawImage(image, 0, 0);
            contextout.drawImage(
              document.getElementById("canvas"),
              margin.left,
              margin.top
            );
            var a = document.createElement("a");
            a.download = "downloadgraph.png";
            a.href = canvasout.toDataURL("image/png");
            a.click();
          };
          image.src =
            "data:image/svg+xml;charset=utf8," + encodeURIComponent(str);
        });

        function fillCanvas(scaleX, scaleY, k) {
          for (var xx in data.x) {
            for (var yy in data.y) {
              var dx = scaleX(data.x[xx]);
              var dy = scaleY(data.y[yy]);
              var dv = data.z[yy][xx];
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
      } catch (e) {
        console.log("Heatmap failed to plot", e);
      }
    }
  };

  componentDidMount() {
    this.plotHeatMap();
    window.addEventListener("resize", this.plotHeatMap);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plotHeatMap);
  }

  componentDidUpdate() {
    this.plotHeatMap();
  }

  render() {
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

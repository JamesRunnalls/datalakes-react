import React, { Component } from "react";
import * as d3 from "d3";
import { format } from "date-fns";
import { getRGBAColor } from "../../../components/gradients/gradients";
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

  indexOfClosest = (num, arr) => {
    var index = 0;
    var diff = Math.abs(num - arr[0]);
    for (var val = 0; val < arr.length; val++) {
      var newdiff = Math.abs(num - arr[val]);
      if (newdiff < diff) {
        diff = newdiff;
        index = val;
      }
    }
    return index;
  };

  downloadCSV = () => {
    var {
      data,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      title,
    } = this.props;
    var csvContent = `data:text/csv;charset=utf-8,,${xlabel} (${xunits})\n${ylabel} (${yunits}),${zlabel} (${zunits})\n`;
    csvContent = csvContent + `,${data.x.join(",")}\n`;
    for (var i = 0; i < data.y.length; i++) {
      csvContent = csvContent + `${data.y[i]},${data.z[i].join(",")}\n`;
    }
    var name = title + ".csv";
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
  };

  downloadJSON = () => {
    var {
      data,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      title,
    } = this.props;
    var arr = {
      ...{ xlabel, xunits, ylabel, yunits, zlabel, zunits, title },
      ...data,
    };
    var name = title.split(" ").join("_") + ".json";
    var encodedUri =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(arr));
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
  };

  getDomain = (domain) => {
    var minarr = domain.map((d) => d[0]);
    var maxarr = domain.map((d) => d[1]);
    var min = d3.extent(minarr)[0];
    var max = d3.extent(maxarr)[1];
    return [min, max];
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
          colors,
          title,
          minvalue,
          maxvalue,
        } = this.props;
        const { closest, indexOfClosest } = this;
        var currentZoom = d3.zoomIdentity;

        // Set graph size
        var margin = { top: 20, right: 80, bottom: 50, left: 50 },
          viswidth = d3.select("#heatmap").node().getBoundingClientRect().width,
          visheight =
            d3.select("#heatmap").node().getBoundingClientRect().height - 5,
          width = Math.floor(viswidth - margin.left - margin.right),
          height = Math.floor(visheight - margin.top - margin.bottom);

        // Get data extents
        var xdomain, ydomain, zdomain;
        if (Array.isArray(data)) {
          var xdomarr = [];
          var ydomarr = [];
          var zdomarr = [];
          for (var h = 0; h < data.length; h++) {
            xdomarr.push(d3.extent(data[h].x));
            ydomarr.push(d3.extent(data[h].y));
            zdomarr.push(
              d3.extent(
                [].concat.apply([], data[h].z).filter((f) => {
                  return !isNaN(parseFloat(f)) && isFinite(f);
                })
              )
            );
          }
          xdomain = this.getDomain(xdomarr);
          ydomain = this.getDomain(ydomarr);
          zdomain = this.getDomain(zdomarr);
        } else {
          xdomain = d3.extent(data.x);
          ydomain = d3.extent(data.y);
          zdomain = d3.extent(
            [].concat.apply([], data.z).filter((f) => {
              return !isNaN(parseFloat(f)) && isFinite(f);
            })
          );
        }

        if (!minvalue && !maxvalue) {
          minvalue = zdomain[0];
          maxvalue = zdomain[1];
        }

        // Set color gradients
        var colorScale = (v) => {
          return getRGBAColor(v, minvalue, maxvalue, colors);
        };

        // Format X-axis
        var x;
        if ("xlinear" in this.props) {
          x = d3.scaleLinear().range([0, width]).domain(xdomain);
        } else {
          x = d3.scaleTime().range([0, width]).domain(xdomain);
        }

        // Format Y-axis
        var y = d3.scaleLinear().range([height, 0]).domain(ydomain);

        // Define the axes
        var xAxis = d3.axisBottom(x);
        var yAxis = d3.axisLeft(y);

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
          .style("left", "0")
          .style("cursor", "grab")
          .attr("id", "canvas")
          .attr("class", "canvas-plot");
        const context = canvas.node().getContext("2d");

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
          var process = data;
          if (Array.isArray(data)) {
            process = data[getFileIndex(xdomarr, hoverX)];
          }
          var yi = closest(hoverY, process.y);
          try {
            var xi;
            if (xlabel === "Time") {
              xi = closest(hoverX, process.x);
              document.getElementById("value").innerHTML =
                format(process.x[xi], "hh:mm dd MMM yy") +
                " | " +
                ylabel +
                ": " +
                numberformat(process.y[yi]) +
                yunits +
                " | " +
                zlabel +
                ": " +
                numberformat(process.z[yi][xi]) +
                zunits;
            } else {
              xi = closest(hoverX, process.x);
              document.getElementById("value").innerHTML =
                xlabel +
                ": " +
                numberformat(process.x[xi]) +
                xunits +
                " | " +
                ylabel +
                ": " +
                numberformat(process.y[yi]) +
                yunits +
                " | " +
                zlabel +
                ": " +
                numberformat(process.z[yi][xi]) +
                zunits;
            }
          } catch (e) {
            document.getElementById("value").innerHTML = "";
          }
        });
        canvas.on("mouseout", () => {
          document.getElementById("value").innerHTML = "";
        });

        function numberformat(num) {
          num = parseFloat(num);
          if (num > 9999 || (num < 0.01 && num > -0.01) || num < -9999) {
            num = num.toExponential(3);
          } else {
            num = Math.round(num * 10000) / 10000;
          }
          return num;
        }

        // Add cursor change
        window.addEventListener("keydown", function (event) {
          if (event.shiftKey) {
            canvas.style("cursor", "crosshair");
          }
        });
        window.addEventListener("keyup", function (event) {
          canvas.style("cursor", "grab");
        });

        // Background color
        svg
          .append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("fill", bcolor);

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

        gxAxis.selectAll("text").attr("transform", function (d) {
          return (
            "rotate(-45)translate(-" +
            this.getBBox().width * (3 / 4) +
            ",-" +
            this.getBBox().height * (3 / 4) +
            ")"
          );
        });

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

        // Add title
        svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", 2 - margin.top / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("text-decoration", "underline")
          .text(title);

        // Add the legend
        var defs = svg.append("defs");

        var svggradient = defs
          .append("linearGradient")
          .attr("id", "svgGradient")
          .attr("x1", "0")
          .attr("x2", "0")
          .attr("y1", "0")
          .attr("y2", "1");

        for (var g = colors.length - 1; g > -1; g--) {
          svggradient
            .append("stop")
            .attr("class", "end")
            .attr("offset", 1 - colors[g].point)
            .attr("stop-color", colors[g].color)
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

        var t1 = Math.round(maxvalue * 100) / 100,
          t5 = Math.round(minvalue * 100) / 100,
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
          fillCanvas(x, y);
        }, 0);

        d3.select("#heatmap-download").on("click", function () {
          downloadGraph();
        });

        d3.select("#pngdownload").on("click", function () {
          downloadGraph();
        });

        function downloadGraph() {
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
        }

        function pixelMapping(data, scaleX, scaleY) {
          if (!Array.isArray(data)) {
            var dataypix = data.y.map((dy) => scaleY(dy));
            var dataxpix = data.x.map((dx) => scaleX(dx));

            var indexypix = [];
            var indexxpix = [];

            // Currently using closest (needs to be improved)

            for (var i = 0; i < height; i++) {
              indexypix.push(indexOfClosest(i, dataypix));
            }

            for (var j = 0; j < width; j++) {
              indexxpix.push(indexOfClosest(j, dataxpix));
            }
            return { indexxpix, indexypix };
          } else {
          }
        }

        function getFileIndex(xscales, xp) {
          for (var i = 0; i < xscales.length; i++) {
            if (xp >= xscales[i][0] && xp <= xscales[i][1]) {
              return i;
            }
          }
          return NaN;
        }

        function getXScales(scaleX, arr) {
          var xscales = [];
          for (var i = 0; i < arr.length; i++) {
            xscales.push([scaleX(arr[i][0]), scaleX(arr[i][1])]);
          }
          return xscales;
        }

        function getPixelValue(data, yp, xp, xscales, dataxpix, dataypix) {
          var fileindex = getFileIndex(xscales, xp);
          if (isNaN(fileindex)) {
            return NaN;
          } else {
            var iy = indexOfClosest(yp, dataypix[fileindex]);
            var ix = indexOfClosest(xp, dataxpix[fileindex]);
            return data[fileindex].z[iy][ix];
          }
        }

        function fillCanvas(scaleX, scaleY) {
          if (!Array.isArray(data)) {
            var { indexxpix, indexypix } = pixelMapping(data, scaleX, scaleY);
          } else {
            var xscales = getXScales(scaleX, xdomarr);
            var dataypix = data.map((d) => d.y.map((dd) => scaleY(dd)));
            var dataxpix = data.map((d) => d.x.map((dd) => scaleX(dd)));
          }
          var imgData = context.createImageData(width, height);

          // Get zero pixel
          var highh = Math.min(height, Math.floor(scaleY(ydomain[0])));
          var lowh = Math.max(0, Math.floor(scaleY(ydomain[1])));
          var highw = Math.min(width, Math.floor(scaleX(xdomain[1])));
          var loww = Math.max(0, Math.floor(scaleX(xdomain[0])));
          var i, j, l, rgbacolor;
          for (j = lowh; j < highh; j++) {
            for (l = loww; l < highw; l++) {
              if (!Array.isArray(data)) {
                rgbacolor = colorScale(data.z[indexypix[j]][indexxpix[l]]);
              } else {
                rgbacolor = colorScale(
                  getPixelValue(data, j, l, xscales, dataxpix, dataypix)
                );
              }

              i = (width * j + l) * 4;
              imgData.data[i + 0] = rgbacolor[0];
              imgData.data[i + 1] = rgbacolor[1];
              imgData.data[i + 2] = rgbacolor[2];
              imgData.data[i + 3] = rgbacolor[3];
            }
          }
          context.putImageData(imgData, 1, 0);
        }

        function updateChart(transform) {
          currentZoom = transform;
          var scaleX = transform.rescaleX(x);
          var scaleY = transform.rescaleY(y);
          gxAxis.call(xAxis.scale(scaleX));
          gyAxis.call(yAxis.scale(scaleY));
          context.clearRect(0, 0, width, height);
          fillCanvas(scaleX, scaleY);
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
        <div className="downloadbar">
          <button id="pngdownload">PNG</button>
          <button className="blue" onClick={this.downloadJSON}>JSON</button>
          <button className="red" onClick={this.downloadCSV}>CSV</button>
        </div>
      </React.Fragment>
    );
  }
}

export default D3HeatMap;

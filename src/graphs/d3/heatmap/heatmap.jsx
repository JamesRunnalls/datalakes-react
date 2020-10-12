import React, { Component } from "react";
import * as d3 from "d3";
import "d3-contour";
import { format } from "date-fns";
import { getRGBAColor } from "../../../components/gradients/gradients";
import GraphHeader from "../graphheader/graphheader";
import "./heatmap.css";
import { isEqual } from "lodash";
import D3LineGraph from "../linegraph/linegraph";

class D3HeatMap extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
    download: false,
    fullscreen: false,
    display: "contour",
    zoom: false,
    fontSize: 12,
    xgraph: false,
    ygraph: false,
    mousex: false,
    mousey: false,
  };

  editFontSize = (fontSize) => {
    this.setState({ fontSize });
  };

  toggleXgraph = () => {
    this.setState({ xgraph: !this.state.xgraph }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  toggleYgraph = () => {
    this.setState({ ygraph: !this.state.ygraph }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  toggleDownload = () => {
    this.setState({ download: !this.state.download });
  };

  toggleFullscreen = () => {
    var { fullscreen, xgraph, ygraph } = this.state;
    this.setState(
      {
        fullscreen: !fullscreen,
        xgraph: false,
        ygraph: false,
      },
      () => {
        this.setState({ xgraph, ygraph });
      }
    );
  };

  toggleDisplay = () => {
    var { display } = this.state;
    if (display === "contour") {
      display = "heatmap";
    } else {
      display = "contour";
    }
    this.setState({ display });
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
    try {
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
      this.setState({ download: false });
    } catch (e) {
      alert("Failed to convert data to .csv, please download in .json format.");
    }
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
    this.setState({ download: false });
  };

  getDomain = (domain) => {
    var minarr = domain.map((d) => d[0]);
    var maxarr = domain.map((d) => d[1]);
    var min = d3.extent(minarr)[0];
    var max = d3.extent(maxarr)[1];
    return [min, max];
  };

  thresholds = (domain, t) => {
    let thresholds = [];
    let step = (domain[1] - domain[0]) / (t + 1);
    for (let i = 0; i < t; i++) {
      thresholds.push(domain[0] + step * i);
    }
    return thresholds;
  };

  plotHeatMap = () => {
    var { display, graphid, fontSize } = this.state;
    try {
      d3.select("#svg" + graphid).remove();
      d3.select("#canvas" + graphid).remove();
      d3.select("#tooltip" + graphid).remove();
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
          thresholdStep,
          setDownloadGraph,
        } = this.props;

        const { closest, indexOfClosest, props } = this;

        // Set graph size
        var margin = {
            top: 10,
            right: fontSize * 5 + 10,
            bottom: fontSize * 3 + 10,
            left: fontSize * 3 + 10,
          },
          viswidth = d3
            .select("#vis" + graphid)
            .node()
            .getBoundingClientRect().width,
          visheight =
            d3
              .select("#vis" + graphid)
              .node()
              .getBoundingClientRect().height - 5,
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

        // Set default color threshhold step
        if (thresholdStep) {
        } else {
          thresholdStep = 20;
        }

        // Format X-axis
        var x;
        if ("xlinear" in this.props) {
          x = d3.scaleLinear().range([0, width]).domain(xdomain);
        } else {
          x = d3.scaleTime().range([0, width]).domain(xdomain);
        }
        var xref = x.copy();
        var xbase = x.copy();

        // Format Y-axis
        var y = d3.scaleLinear().range([height, 0]).domain(ydomain);
        var yref = y.copy();
        var ybase = y.copy();

        // Define the axes
        var xAxis = d3.axisBottom(x).ticks(5);
        var yAxis = d3.axisLeft(y).ticks(5);

        // Adds the svg
        var svg = d3
          .select("#vis" + graphid)
          .append("svg")
          .attr("id", "svg" + graphid)
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        // Background color
        if (bcolor) {
          svg
            .append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", bcolor);
        }

        // Add title
        var titlesvg = svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", 2 - margin.top / 2)
          .attr("text-anchor", "middle")
          .style("font-size", `${fontSize}px`)
          .style("text-decoration", "underline")
          .style("opacity", "0")
          .text(title);

        // Add the X Axis
        var gX;
        if (xlabel === "Time") {
          gX = svg
            .append("g")
            .attr("class", "x axis")
            .attr("id", "axis--x")
            .attr("transform", "translate(0," + height + ")")
            .style("font-size", `${fontSize}px`)
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

          gX = svg
            .append("g")
            .attr("class", "x axis")
            .attr("id", "axis--x")
            .attr("transform", "translate(0," + height + ")")
            .style("font-size", `${fontSize}px`)
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
            .attr("dx", `${fontSize}px`)
            .style("font-size", `${fontSize}px`)
            .style("text-anchor", "end")
            .text(xLabel);
        }

        gX.selectAll("text").attr("transform", function (d) {
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
          yLabel = ylabel;
        }

        if ("yunits" in this.props) {
          yLabel = ylabel + " (" + yunits + ")";
        }

        var gY = svg
          .append("g")
          .attr("class", "y axis")
          .attr("id", "axis--y")
          .style("font-size", `${fontSize}px`)
          .call(yAxis);

        svg
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - height / 2)
          .attr("dy", `${fontSize}px`)
          .style("font-size", `${fontSize}px`)
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
          .style("font-size", `${fontSize}px`)
          .text(t1);

        svg
          .append("text")
          .attr("x", width + 2 + margin.right / 3)
          .attr("y", height * 0.25 + 3)
          .style("font-size", `${fontSize}px`)
          .text(t2);

        svg
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", width + margin.right - 5)
          .attr("x", 0 - height / 2)
          .attr("dz", "1em")
          .style("text-anchor", "middle")
          .style("font-size", `${fontSize}px`)
          .text(zlabel + " (" + zunits + ")");

        svg
          .append("text")
          .attr("x", width + 2 + margin.right / 3)
          .attr("y", height * 0.75 + 3)
          .style("font-size", `${fontSize}px`)
          .text(t4);

        svg
          .append("text")
          .attr("x", width + 2 + margin.right / 3)
          .attr("y", height)
          .style("font-size", `${fontSize}px`)
          .text(t5);

        // Adds the canvas
        var canvas = d3
          .select("#vis" + graphid)
          .append("canvas")
          .attr("width", width)
          .attr("height", height)
          .style("margin-left", margin.left + "px")
          .style("margin-top", margin.top + "px")
          .style("pointer-events", "none")
          .style("z-index", 0)
          .style("position", "absolute")
          .style("left", "1px")
          .style("cursor", "grab")
          .attr("id", "canvas" + graphid)
          .attr("class", "canvas-plot");
        const context = canvas.node().getContext("2d");

        // Zooming and Panning
        var zoom = d3
          .zoom()
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("zoom", normalzoom);

        var zoomx = d3
          .zoom()
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("zoom", normalzoomx);

        var zoomy = d3
          .zoom()
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("zoom", normalzoomy);

        var zoombox = svg
          .append("rect")
          .attr("id", "zoombox" + graphid)
          .attr("width", width)
          .attr("height", height)
          .style("fill", "none")
          .style("cursor", "pointer")
          .attr("pointer-events", "all")
          .call(zoom);

        var zoomboxx = svg
          .append("rect")
          .attr("id", "zoomboxx" + graphid)
          .attr("width", width)
          .attr("height", margin.bottom)
          .style("fill", "none")
          .style("cursor", "col-resize")
          .attr("pointer-events", "all")
          .attr("y", height)
          .call(zoomx);

        var zoomboxy = svg
          .append("rect")
          .attr("id", "zoomboxy" + graphid)
          .attr("width", margin.left)
          .attr("height", height)
          .style("fill", "none")
          .style("cursor", "row-resize")
          .attr("pointer-events", "all")
          .attr("x", -margin.left)
          .call(zoomy);

        function normalzoom() {
          let t = d3.event.transform;
          if (t !== d3.zoomIdentity) {
            x = t.rescaleX(xref);
            y = t.rescaleY(yref);
            xAxis.scale(x);
            gX.call(xAxis);
            yAxis.scale(y);
            gY.call(yAxis);
            context.clearRect(0, 0, width, height);
            if (display === "heatmap") {
              fillCanvas(x, y);
            } else if (display === "contour") {
              fillCanvasContour(x, y);
            }
            yref = y;
            xref = x;
            zoombox.call(zoom.transform, d3.zoomIdentity);
          }
        }

        function normalzoomx() {
          let t = d3.event.transform;
          if (t !== d3.zoomIdentity) {
            x = t.rescaleX(xref);
            xAxis.scale(x);
            gX.call(xAxis);
            context.clearRect(0, 0, width, height);
            if (display === "heatmap") {
              fillCanvas(x, y);
            } else if (display === "contour") {
              fillCanvasContour(x, y);
            }
            xref = x;
            zoomboxx.call(zoom.transform, d3.zoomIdentity);
          }
        }

        function normalzoomy() {
          let t = d3.event.transform;
          if (t !== d3.zoomIdentity) {
            y = t.rescaleX(yref);
            yAxis.scale(y);
            gY.call(yAxis);
            context.clearRect(0, 0, width, height);
            if (display === "heatmap") {
              fillCanvas(x, y);
            } else if (display === "contour") {
              fillCanvasContour(x, y);
            }
            yref = y;
            zoomboxy.call(zoom.transform, d3.zoomIdentity);
          }
        }

        zoombox.on("dblclick.zoom", null).on("dblclick", () => {
          x = xbase;
          y = ybase;
          xref = xbase;
          yref = ybase;
          yAxis.scale(ybase);
          gY.call(yAxis);
          xAxis.scale(xbase);
          gX.call(xAxis);
          context.clearRect(0, 0, width, height);
          if (display === "heatmap") {
            fillCanvas(x, y);
          } else if (display === "contour") {
            fillCanvasContour(x, y);
          }
        });
        zoomboxx.on("dblclick.zoom", null);
        zoomboxy.on("dblclick.zoom", null);

        // Add tooltip

        // create a tooltip
        var tooltip = d3
          .select("#vis" + graphid)
          .append("div")
          .style("opacity", 0)
          .attr("id", "tooltip" + graphid)
          .attr("class", "graphtooltip");

        zoombox.on("mousemove", () => {
          try {
            var hoverX = x.invert(
              d3.event.layerX - margin.left || d3.event.offsetX - margin.left
            );
            var hoverY = y.invert(
              d3.event.layerY - margin.top || d3.event.offsetY - margin.top
            );
            var process = data;
            if (Array.isArray(data)) {
              process = data[getFileIndex(xdomarr, hoverX)];
            }
            var yi = closest(hoverY, process.y);
            var xi = closest(hoverX, process.x);

            var html = "";
            if (xlabel === "Time") {
              html =
                "<table><tbody>" +
                `<tr><td>x:</td><td>${format(
                  process.x[xi],
                  "HH:mm dd MMM yy"
                )}</td></tr>` +
                `<tr><td>y:</td><td>${numberformat(
                  process.y[yi]
                )} ${yunits}</td></tr>` +
                `<tr><td>z:</td><td>${numberformat(
                  process.z[yi][xi]
                )} ${zunits}</td></tr>` +
                "</tbody></table>";
            } else {
              html =
                "<table><tbody>" +
                `<tr><td>y:</td><td>${numberformat(
                  process.x[xi]
                )} ${xunits}</td></tr>` +
                `<tr><td>y:</td><td>${numberformat(
                  process.y[yi]
                )} ${yunits}</td></tr>` +
                `<tr><td>z:</td><td>${numberformat(
                  process.z[yi][xi]
                )} ${zunits}</td></tr>` +
                "</tbody></table>";
            }
            tooltip
              .html(html)
              .style("left", x(process.x[xi]) + margin.left + 10 + "px")
              .style("top", y(process.y[yi]) + margin.top - 20 + "px")
              .style("opacity", 1);
            this.setState({ mousex: xi, mousey: yi });
          } catch (e) {
            tooltip.style("opacity", 0);
            this.setState({ mousex: false, mousey: false });
          }
        });

        zoombox.on("mouseout", () => {
          tooltip.style("opacity", 0);
          this.setState({ mousex: false, mousey: false });
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

        // Plot data to canvas
        setTimeout(() => {
          context.clearRect(0, 0, width, height);
          if (display === "heatmap") {
            fillCanvas(x, y);
          } else if (display === "contour") {
            fillCanvasContour(x, y);
          }
        }, 0);

        d3.select("#png" + graphid).on("click", function () {
          downloadGraph();
        });

        function getXfromIndex(index, plotdata) {
          if (index <= plotdata.x.length - 1) {
            if ("xlinear" in props) {
              return (
                (plotdata.x[Math.ceil(index)] - plotdata.x[Math.floor(index)]) *
                  (index - Math.floor(index)) +
                plotdata.x[Math.floor(index)]
              );
            } else {
              return new Date(
                (plotdata.x[Math.ceil(index)].getTime() -
                  plotdata.x[Math.floor(index)].getTime()) *
                  (index - Math.floor(index)) +
                  plotdata.x[Math.floor(index)].getTime()
              );
            }
          } else {
            return plotdata.x[plotdata.x.length - 1];
          }
        }

        function getYfromIndex(index, plotdata) {
          if (index <= plotdata.y.length - 1) {
            return (
              (plotdata.y[Math.ceil(index)] - plotdata.y[Math.floor(index)]) *
                (index - Math.floor(index)) +
              plotdata.y[Math.floor(index)]
            );
          } else {
            return plotdata.y[plotdata.y.length - 1];
          }
        }

        function downloadGraph() {
          titlesvg.style("opacity", "1");
          var s = new XMLSerializer();
          var str = s.serializeToString(
            document.getElementById("svg" + graphid)
          );

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
              document.getElementById("canvas" + graphid),
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
          titlesvg.style("opacity", "0");
          if (setDownloadGraph) {
            setDownloadGraph(downloadGraph);
          }
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

        function fillCanvasContour(scaleX, scaleY) {
          var thresholds = d3.range(
            zdomain[0],
            zdomain[1],
            (zdomain[1] - zdomain[0]) / thresholdStep
          );
          var contours, crough, values;
          if (Array.isArray(data)) {
            data.forEach((d) => {
              crough = d3
                .contours()
                .size([d.z[0].length, d.z.length])
                .smooth(false);
              contours = d3.contours().size([d.z[0].length, d.z.length]);
              values = d.z.flat();
              fill(crough.thresholds(thresholds)(values)[0], d);
              contours
                .thresholds(thresholds)(values)
                .forEach((contour, index) => {
                  if (index !== 0) fill(contour, d);
                });
            });
          } else {
            crough = d3
              .contours()
              .size([data.z[0].length, data.z.length])
              .smooth(false);
            contours = d3.contours().size([data.z[0].length, data.z.length]);
            values = data.z.flat();
            fill(crough.thresholds(thresholds)(values)[0], data);
            contours
              .thresholds(thresholds)(values)
              .forEach((contour, index) => {
                if (index !== 0) fill(contour, data);
              });
          }

          function fill(geometry, plotdata) {
            let color = colorScale(geometry.value);
            context.fillStyle = `rgb(
              ${color[0]},
              ${color[1]},
              ${color[2]})`;
            geometry.coordinates.forEach((a) => {
              a.forEach((b) => {
                context.beginPath();
                context.moveTo(
                  scaleX(getXfromIndex(b[0][0], plotdata)),
                  scaleY(getYfromIndex(b[0][1], plotdata))
                );
                b.forEach((c) => {
                  context.lineTo(
                    scaleX(getXfromIndex(c[0], plotdata)),
                    scaleY(getYfromIndex(c[1], plotdata))
                  );
                });
                context.closePath();
                context.fill();
              });
            });
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
      } catch (e) {
        console.log("Heatmap failed to plot", e);
      }
    }
  };

  componentDidMount() {
    if ("display" in this.props) {
      this.setState({ display: this.props.display });
    }
    this.plotHeatMap();
    window.addEventListener("resize", this.plotHeatMap);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plotHeatMap);
  }

  componentDidUpdate(prevProps, prevState) {
    var { display, fontSize, fullscreen, xgraph, ygraph } = this.state;
    if (
      !isEqual(prevProps, this.props) ||
      display !== prevState.display ||
      fontSize !== prevState.fontSize ||
      fullscreen !== prevState.fullscreen ||
      xgraph !== prevState.xgraph ||
      ygraph !== prevState.ygraph
    )
      this.plotHeatMap();
  }

  render() {
    var {
      graphid,
      download,
      fullscreen,
      display,
      fontSize,
      xgraph,
      ygraph,
      mousex,
      mousey,
    } = this.state;
    var {
      title,
      ylabel,
      xlabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      data,
    } = this.props;
    var xy = " ";
    if (xgraph) xy = xy + "x";
    if (ygraph) xy = xy + "y";

    var dxy = [];
    var dxx = [];
    var dyy = [];
    var dyx = [];

    try {
      if (xgraph && mousey && data.x) {
        dxx = data.x;
        dxy = data.z[mousey];
      }
      if (ygraph && mousex && data.x) {
        dyx = data.z.map((z) => z[mousex]);
        dyy = data.y;
      }
    } catch (e) {
      console.log(e);
    }

    var datax = [{ x: dxx, y: dxy }];
    var datay = [{ x: dyx, y: dyy }];

    return (
      <div className={fullscreen ? "vis-main full" : "vis-main"}>
        <div className="heatmap-main">
          <div className="heatmap-header">
            <GraphHeader
              id={graphid}
              title={title}
              download={download}
              display={display}
              fontSize={fontSize}
              fullscreen={fullscreen}
              toggleDownload={this.toggleDownload}
              editFontSize={this.editFontSize}
              toggleDisplay={this.toggleDisplay}
              toggleFullscreen={this.toggleFullscreen}
              downloadJSON={this.downloadJSON}
              downloadCSV={this.downloadCSV}
              toggleXgraph={this.toggleXgraph}
              toggleYgraph={this.toggleYgraph}
            />
          </div>
          <div className="heatmap-graphs">
            <div className={"heatmap-top" + xy}>
              <div className={"heatmap-left" + xy}>
                {ygraph && (
                  <D3LineGraph
                    data={datay}
                    xlabel={zlabel}
                    ylabel={ylabel}
                    xunits={zunits}
                    yunits={yunits}
                    lcolor={"black"}
                    lweight={1}
                    bcolor={"white"}
                    simple={true}
                  />
                )}
              </div>
              <div className={"heatmap-right" + xy} id={"vis" + graphid} />
            </div>
            <div className={"heatmap-bottom" + xy}>
              {xgraph && (
                <D3LineGraph
                  data={datax}
                  xlabel={xlabel}
                  ylabel={zlabel}
                  xunits={xunits}
                  yunits={zunits}
                  lcolor={"black"}
                  lweight={1}
                  bcolor={"white"}
                  xscale={"Time"}
                  simple={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default D3HeatMap;

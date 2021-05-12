import React, { Component } from "react";
import * as d3 from "d3";
import isEqual from "lodash/isEqual";
import { format } from "date-fns";
import GraphHeader from "../graphheader/graphheader";
import "./linegraph.css";

class D3LineGraph extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
    download: false,
    fullscreen: false,
    fontSize: 12,
  };

  editFontSize = (fontSize) => {
    this.setState({ fontSize });
  };

  toggleDownload = () => {
    this.setState({ download: !this.state.download });
  };

  toggleFullscreen = () => {
    this.setState({ fullscreen: !this.state.fullscreen }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  getDomain = (domain) => {
    var minarr = domain.map((d) => d[0]);
    var maxarr = domain.map((d) => d[1]);
    var min = d3.extent(minarr)[0];
    var max = d3.extent(maxarr)[1];
    return [min, max];
  };

  formatDate = (raw) => {
    return new Date(raw * 1000);
  };

  removeErrorWarning = (x) => {
    return;
  };

  downloadCSV = () => {
    try {
      var { data, xlabel, xunits, ylabel, yunits, title } = this.props;
      var csvContent = ""
      if (!Array.isArray(data) || data.length === 1) {
        if (Array.isArray(data)) data = data[0];
        csvContent = csvContent + `data:text/csv;charset=utf-8,${xlabel} (${xunits}),${ylabel} (${yunits})\n`;
        for (var i = 0; i < data.x.length; i++) {
          csvContent = csvContent + `${data.x[i]},${data.y[i]}\n`;
        }
      } else {
        csvContent = csvContent + "data:text/csv;charset=utf-8";
        var rows = -Infinity;
        for (let i = 0; i < data.length; i++) {
          csvContent =
            csvContent + `,${xlabel} (${xunits}),${ylabel} (${yunits})`;
          rows = Math.max(rows, data[i].x.length);
        }
        csvContent = csvContent + "\n";
        for (let j = 0; j < rows; j++) {
          csvContent = csvContent + `${data[0].x[j]},${data[0].y[j]}`
          for (let i = 1; i < data.length; i++) {
            csvContent = csvContent + `,${data[i].x[j]},${data[i].y[j]}`;
          }
          csvContent = csvContent + "\n";
        }
      }
      var name = title.split(" ").join("_") + ".csv";
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      this.setState({ download: false });
    } catch (e) {
      console.error(e);
      alert("Failed to convert data to .csv, please download in .json format.");
    }
  };

  downloadJSON = () => {
    var { data, xlabel, xunits, ylabel, yunits, title } = this.props;
    var arr = { ...{ xlabel, xunits, ylabel, yunits, title }, ...data };
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

  removeCommaFromLabels = (gX) => {
    var labels = gX._groups[0][0].children;
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].children.length > 1) {
        labels[i].children[1].innerHTML = labels[
          i
        ].children[1].innerHTML.replace(",", "");
      }
    }
  };

  plotLineGraph = async () => {
    var { graphid, fontSize } = this.state;
    try {
      d3.select("#svg" + graphid).remove();
    } catch (e) {}
    if (this.props.data) {
      try {
        var {
          data,
          xlabel,
          xunits,
          ylabel,
          yunits,
          xscale,
          yscale,
          bcolor,
          lcolor,
          lweight,
          title,
          legend,
          setDownloadGraph,
          confidence,
          simple,
          yReverse,
          xReverse,
          plotdots,
        } = this.props;

        if (!lcolor) lcolor = ["#000000"];
        if (!lweight) lweight = [1];

        if (!Array.isArray(data)) data = [data];
        if (!Array.isArray(lcolor)) lcolor = [lcolor];
        if (!Array.isArray(lweight)) lweight = [lweight];

        // Verify data
        var plotdata = [];
        for (let d = 0; d < data.length; d++) {
          if (data[d].x && data[d].y) {
            plotdata.push(data[d]);
          } else {
            plotdata.push({ x: [], y: [] });
          }
        }
        data = plotdata;

        // Set graph size
        var margin = {
            top: 10,
            right: 20,
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
          width = viswidth - margin.left - margin.right,
          height = visheight - margin.top - margin.bottom;

        // Get data extents
        var xdomain, ydomain;
        if (Array.isArray(data)) {
          var xdomarr = [];
          var ydomarr = [];
          for (var h = 0; h < data.length; h++) {
            let xext = d3.extent(data[h].x);
            let yext = d3.extent(data[h].y);
            xdomarr.push(xext);
            ydomarr.push(yext);
          }
          xdomain = this.getDomain(xdomarr);
          ydomain = this.getDomain(ydomarr);
        } else {
          xdomain = d3.extent(data.x);
          ydomain = d3.extent(data.y);
        }

        // Format X-axis
        var x;
        var xrange = [0, width];
        if (xReverse) xrange = [width, 0];
        if (xscale === "Time") {
          x = d3.scaleTime().range(xrange).domain(xdomain);
        } else if (xscale === "Log") {
          x = d3.scaleLog().range(xrange).domain(xdomain);
        } else {
          x = d3.scaleLinear().range(xrange).domain(xdomain);
        }
        var xref = x.copy();
        var xbase = x.copy();

        // Format Y-axis
        var y;
        var yrange = [height, 0];
        if (yReverse) yrange = [0, height];
        if (yscale === "Time") {
          y = d3.scaleTime().range(yrange).domain(ydomain);
        } else if (yscale === "Log") {
          y = d3.scaleLog().range(yrange).domain(ydomain);
        } else {
          y = d3.scaleLinear().range(yrange).domain(ydomain);
        }
        var yref = y.copy();
        var ybase = y.copy();

        // Define the axes
        var xAxis = d3.axisBottom(x).ticks(5);
        var yAxis = d3.axisLeft(y).ticks(5);

        // Adds the svg canvas
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

        // Set clip
        var clip = svg
          .append("defs")
          .append("svg:clipPath")
          .attr("id", "clip" + graphid)
          .append("svg:rect")
          .attr("width", width)
          .attr("height", height)
          .attr("x", 0)
          .attr("y", 0);

        this.removeErrorWarning(clip);

        // Add the X Axis

        var gX = svg
          .append("g")
          .attr("class", "x axis")
          .attr("id", "axis--x")
          .style("font-size", `${fontSize}px`)
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        if (xlabel !== "Time") {
          svg
            .append("text")
            .attr(
              "transform",
              "translate(" +
                width / 2 +
                " ," +
                (height + margin.bottom / 1.2) +
                ")"
            )
            .attr("x", 6)
            .attr("dx", `${fontSize}px`)
            .style("font-size", `${fontSize}px`)
            .style("text-anchor", "middle")
            .text(xunits ? `${xlabel} (${xunits})` : xlabel);
        }

        this.removeCommaFromLabels(gX);
        var removeCommaFromLabels = this.removeCommaFromLabels;

        // Add the Y Axis
        var gY = svg
          .append("g")
          .attr("class", "y axis")
          .attr("id", "axis--y")
          .style("font-size", `${fontSize}px`)
          .call(yAxis);

        if (ylabel !== "Time") {
          svg
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - height / 2)
            .attr("dy", `${fontSize}px`)
            .style("font-size", `${fontSize}px`)
            .style("text-anchor", "middle")
            .text(yunits ? `${ylabel} (${yunits})` : ylabel);
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

        main();

        async function main() {
          // Transform Data
          var xy = [];
          for (var i = 0; i < data.length; i++) {
            var xyt = [];
            for (var j = 0; j < data[i]["x"].length; j++) {
              if (
                confidence &&
                confidence[i] &&
                confidence[i]["CI_upper"].length === data[i]["x"].length
              ) {
                xyt.push({
                  x: data[i]["x"][j],
                  y: data[i]["y"][j],
                  CI_upper: confidence[i]["CI_upper"][j],
                  CI_lower: confidence[i]["CI_lower"][j],
                });
              } else {
                if (!isNaN(data[i]["x"][j]) && !isNaN(data[i]["y"][j])) {
                  xyt.push({
                    x: data[i]["x"][j],
                    y: data[i]["y"][j],
                  });
                }
              }
            }
            xy.push(xyt);
          }

          var xy_px = xy.map((p) =>
            p.map((pp) => ({ x: x(pp.x), y: y(pp.y) }))
          );

          // Define the line
          var valueline = d3
            .line()
            .x(function (d) {
              return x(d.x);
            })
            .y(function (d) {
              return y(d.y);
            })
            .defined(function (d) {
              if (d.x === null || d.y === null) {
                return false;
              } else {
                return true;
              }
            });

          // Define confidence interval
          var valueconfy = d3
            .area()
            .x(function (d) {
              return x(d.x);
            })
            .y0(function (d) {
              return y(d.CI_upper);
            })
            .y1(function (d) {
              return y(d.CI_lower);
            });

          var valueconfx = d3
            .area()
            .y(function (d) {
              return y(d.y);
            })
            .x0(function (d) {
              return x(d.CI_upper);
            })
            .x1(function (d) {
              return x(d.CI_lower);
            });

          // Add confidence interval
          var confInt = svg
            .append("g")
            .attr("id", "confidenceinterval")
            .attr("clip-path", "url(#clip" + graphid + ")");

          // Add the line
          var line = svg
            .append("g")
            .attr("id", "plotlines")
            .attr("clip-path", "url(#clip" + graphid + ")");

          // Add the points
          var points = svg
            .append("g")
            .attr("id", "plotpoints")
            .attr("clip-path", "url(#clip" + graphid + ")");

          plotLine(
            line,
            points,
            confInt,
            data,
            confidence,
            xy,
            lcolor,
            lweight
          );

          function filterNull(arr) {
            return arr.filter((v) => v.x !== null && v.y !== null);
          }

          function plotLine(
            line,
            points,
            confInt,
            data,
            confidence,
            value,
            lcolor,
            lweight
          ) {
            if (confidence) {
              // Plot confidence bound
              for (let k = 0; k < confidence.length; k++) {
                if (confidence[k]) {
                  try {
                    var confplot = valueconfy;
                    if (confidence[k].axis === "x") confplot = valueconfx;
                    let color = "#DCDCDC";
                    if (lcolor) color = lcolor[k];
                    confInt
                      .append("path")
                      .attr("style", `fill:${color};stroke:none;opacity:0.15`)
                      .attr("d", confplot(value[k]));
                  } catch (e) {
                    console.error("Failed to plot confidence interval " + k);
                  }
                }
              }
            }
            for (let l = 0; l < data.length; l++) {
              try {
                line
                  .append("path")
                  .attr(
                    "style",
                    "fill:none;stroke:" +
                      lcolor[l] +
                      "; stroke-width:" +
                      lweight[l] +
                      "; fill-opacity:0; stroke-opacity:1;"
                  )
                  .attr("d", valueline(value[l]));
              } catch (e) {
                console.error("Failed to plot line " + l);
              }
            }
            if (plotdots && data.length > 0) {
              var pointdata = [];
              for (let i = 0; i < value.length; i++) {
                pointdata = pointdata.concat(
                  value[i].map((v) => {
                    v.c = lcolor[i];
                    return v;
                  })
                );
              }

              try {
                points
                  .selectAll("dots")
                  .data(filterNull(pointdata))
                  .enter()
                  .append("circle")
                  .attr("style", function (d) {
                    return (
                      "stroke:" +
                      d.c +
                      ";fill:none;fill-opacity:0; stroke-opacity:1;"
                    );
                  })
                  .attr("r", 2.5)
                  .attr("cx", function (d) {
                    return x(d.x);
                  })
                  .attr("cy", function (d) {
                    return y(d.y);
                  });
              } catch (e) {
                console.error("Failed to plot point group");
              }
            }
          }

          if (!simple) {
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
              .style("cursor", "move")
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
                removeCommaFromLabels(gX);
                line.selectAll("path").remove();
                points.selectAll("circle").remove();
                confInt.selectAll("path").remove();
                plotLine(
                  line,
                  points,
                  confInt,
                  data,
                  confidence,
                  xy,
                  lcolor,
                  lweight
                );
                yref = y;
                xref = x;
                xy_px = xy.map((p) =>
                  p.map((pp) => ({ x: x(pp.x), y: y(pp.y) }))
                );
                zoombox.call(zoom.transform, d3.zoomIdentity);
              }
            }

            function normalzoomx() {
              let t = d3.event.transform;
              if (t !== d3.zoomIdentity) {
                x = t.rescaleX(xref);
                xAxis.scale(x);
                gX.call(xAxis);
                removeCommaFromLabels(gX);
                line.selectAll("path").remove();
                points.selectAll("circle").remove();
                confInt.selectAll("path").remove();
                plotLine(
                  line,
                  points,
                  confInt,
                  data,
                  confidence,
                  xy,
                  lcolor,
                  lweight
                );
                xref = x;
                xy_px = xy.map((p) =>
                  p.map((pp) => ({ x: x(pp.x), y: y(pp.y) }))
                );
                zoomboxx.call(zoom.transform, d3.zoomIdentity);
              }
            }

            function normalzoomy() {
              let t = d3.event.transform;
              if (t !== d3.zoomIdentity) {
                y = t.rescaleX(yref);
                yAxis.scale(y);
                gY.call(yAxis);
                removeCommaFromLabels(gX);
                line.selectAll("path").remove();
                points.selectAll("circle").remove();
                confInt.selectAll("path").remove();
                plotLine(
                  line,
                  points,
                  confInt,
                  data,
                  confidence,
                  xy,
                  lcolor,
                  lweight
                );
                yref = y;
                xy_px = xy.map((p) =>
                  p.map((pp) => ({ x: x(pp.x), y: y(pp.y) }))
                );
                zoomboxy.call(zoom.transform, d3.zoomIdentity);
              }
            }

            zoombox.on("dblclick.zoom", null).on("dblclick", () => {
              x = xbase;
              y = ybase;
              xy_px = xy.map((p) =>
                p.map((pp) => ({ x: x(pp.x), y: y(pp.y) }))
              );
              xref = xbase;
              yref = ybase;
              yAxis.scale(ybase);
              gY.call(yAxis);
              xAxis.scale(xbase);
              gX.call(xAxis);
              removeCommaFromLabels(gX);
              line.selectAll("path").remove();
              points.selectAll("circle").remove();
              confInt.selectAll("path").remove();
              plotLine(
                line,
                points,
                confInt,
                data,
                confidence,
                xy,
                lcolor,
                lweight
              );
            });
            zoomboxx.on("dblclick.zoom", null);
            zoomboxy.on("dblclick.zoom", null);

            // Add Focus
            var focus = [];
            for (let f = 0; f < data.length; f++) {
              focus.push(
                svg
                  .append("g")
                  .append("circle")
                  .style("fill", lcolor[f])
                  .attr("stroke", lcolor[f])
                  .attr("r", 4)
                  .style("opacity", 0)
              );
            }

            // Add legend
            if (legend && legend.length > 1) {
              var legendblock = svg
                .append("g")
                .attr("id", "legendbox")
                .attr("pointer-events", "none");

              // Add one dot in the legend for each name.
              legendblock
                .selectAll("legendtext")
                .data(legend)
                .enter()
                .append("text")
                .attr("x", width)
                .attr("y", function (d, i) {
                  return height - 10 - i * 18;
                })
                .style("fill", function (d) {
                  return d.color;
                })
                .text(function (d) {
                  return "--- " + d.text;
                })
                .attr("text-anchor", "end")
                .style("font-size", `${fontSize}px`)
                .style("alignment-baseline", "middle");
            }

            // Add cursor catcher
            svg
              .select("#zoombox" + graphid)
              .on("mouseover", mouseover)
              .on("mousemove", mousemove)
              .on("mouseout", mouseout);

            function mouseover() {
              for (let f = 0; f < focus.length; f++) {
                focus[f].style("opacity", 1);
              }
            }

            function mouseout() {
              for (let f = 0; f < focus.length; f++) {
                focus[f].style("opacity", 0);
              }
              document.getElementById("value" + graphid).innerHTML = "";
            }

            function closestCoordinates(x0, y0, xy) {
              var x_px, y_px, dist_t;
              var dist = Infinity;
              for (var i = 0; i < xy.length; i++) {
                dist_t = Math.sqrt(
                  Math.pow(Math.abs(xy[i].y - y0), 2) +
                    Math.pow(Math.abs(xy[i].x - x0), 2)
                );
                if (dist_t < dist) {
                  x_px = xy[i].x;
                  y_px = xy[i].y;
                  dist = dist_t;
                }
              }
              if (dist < 20) {
                var xx = x.invert(x_px);
                var yy = y.invert(y_px);
                return { x: xx, y: yy, x_px, y_px };
              } else {
                return false;
              }
            }

            function mousemove() {
              try {
                var selectedData;
                var visible = false;
                var inner = `<tr><td>${
                  xunits ? xlabel + " (" + xunits + ")" : xlabel
                }</td><td>${
                  yunits ? ylabel + " (" + yunits + ")" : ylabel
                }</td></tr>`;
                for (let f = 0; f < focus.length; f++) {
                  selectedData = closestCoordinates(
                    d3.mouse(this)[0],
                    d3.mouse(this)[1],
                    xy_px[f]
                  );
                  if (selectedData) {
                    visible = true;
                    focus[f]
                      .attr("cx", selectedData.x_px)
                      .attr("cy", selectedData.y_px);
                    var xtext;
                    if (xlabel === "Time") {
                      xtext = format(
                        new Date(selectedData.x),
                        "hh:mm dd MMM yy"
                      );
                    } else {
                      xtext = numberformat(selectedData.x);
                    }
                    var ytext;
                    if (ylabel === "Time") {
                      ytext = format(
                        new Date(selectedData.y),
                        "hh:mm dd MMM yy"
                      );
                    } else {
                      ytext = numberformat(selectedData.y);
                    }
                    inner =
                      inner +
                      `<tr style="color:${lcolor[f]}"><td>${xtext}</td><td>${ytext}</td></tr>`;
                    focus[f].style("opacity", 1);
                  } else {
                    focus[f].style("opacity", 0);
                  }
                }
                if (visible) {
                  document.getElementById("value" + graphid).innerHTML = inner;
                } else {
                  document.getElementById("value" + graphid).innerHTML = "";
                }
              } catch (e) {}
            }

            function numberformat(num) {
              num = parseFloat(num);
              if (num > 9999 || (num < 0.01 && num > -0.01) || num < -9999) {
                num = num.toExponential(3);
              } else {
                num = Math.round(num * 10000) / 10000;
              }
              return num;
            }

            d3.select("#png" + graphid).on("click", function () {
              downloadGraph();
            });

            function downloadGraph() {
              titlesvg.style("opacity", "1");
              var s = new XMLSerializer();
              var str = s.serializeToString(
                document.getElementById("svg" + graphid)
              );

              var canvas = document.createElement("canvas"),
                context = canvas.getContext("2d");

              canvas.width = viswidth;
              canvas.height = visheight;

              var image = new Image();
              image.onerror = function () {
                alert(
                  "Appologies .png download failed. Pleaseawait  download as .svg."
                );
              };
              image.onload = function () {
                context.drawImage(image, 0, 0);
                var a = document.createElement("a");
                a.download = "downloadgraph.png";
                a.href = canvas.toDataURL("image/png");
                a.click();
              };
              image.src =
                "data:image/svg+xml;charset=utf8," + encodeURIComponent(str);
              titlesvg.style("opacity", "0");
            }

            if (setDownloadGraph) {
              setDownloadGraph(downloadGraph);
            }
          }
        }
      } catch (e) {
        console.error("Error plotting line graph", e);
      }
    }
  };

  componentDidMount() {
    var { graphid } = this.state;
    this.plotLineGraph();
    window.addEventListener("resize", this.plotLineGraph, false);
    document
      .getElementById("vis" + graphid)
      .addEventListener("resize", this.plotLineGraph, false);
  }

  componentWillUnmount() {
    var { graphid } = this.state;
    window.removeEventListener("resize", this.plotLineGraph, false);
    document
      .getElementById("vis" + graphid)
      .removeEventListener("resize", this.plotLineGraph, false);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps, this.props)) {
      this.plotLineGraph();
    }
    if (prevState.fontSize !== this.state.fontSize) {
      this.plotLineGraph();
    }
  }

  render() {
    var { graphid, download, fullscreen, fontSize } = this.state;
    var { title, simple } = this.props;
    return simple ? (
      <div className="linegraph-graph" id={"vis" + graphid} />
    ) : (
      <div className={fullscreen ? "vis-main full" : "vis-main"}>
        <div className="linegraph-main">
          <div className="linegraph-header">
            <GraphHeader
              id={graphid}
              title={title}
              download={download}
              fullscreen={fullscreen}
              fontSize={fontSize}
              toggleDownload={this.toggleDownload}
              toggleFullscreen={this.toggleFullscreen}
              editFontSize={this.editFontSize}
              downloadJSON={this.downloadJSON}
              downloadCSV={this.downloadCSV}
            />
          </div>
          <div className="linegraph-graph" id={"vis" + graphid} />
        </div>
      </div>
    );
  }
}

export default D3LineGraph;

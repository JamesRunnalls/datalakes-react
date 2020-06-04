import React, { Component } from "react";
import * as d3 from "d3";
import { isEqual } from "lodash";
import { format } from "date-fns";
import "./linegraph.css";

class D3LineGraph extends Component {
  getMax = (arr, param) => {
    let max = -Infinity;
    for (var i = 0; i < arr.length; i++) {
      let len = arr[i][param].length;
      while (len--) {
        max = arr[i][param][len] > max ? arr[i][param][len] : max;
      }
    }
    return max;
  };

  getMin = (arr, param) => {
    let min = Infinity;
    for (var i = 0; i < arr.length; i++) {
      let len = arr[i][param].length;
      while (len--) {
        min = arr[i][param][len] < min ? arr[i][param][len] : min;
      }
    }
    return min;
  };

  formatDate = (raw) => {
    return new Date(raw * 1000);
  };

  removeErrorWarning = (x) => {
    return;
  };

  plotLineGraph = async () => {
    try {
      d3.select("#linegraphsvg").remove();
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
          setDownloadGraph,
          confidence,
        } = this.props;

        if (!Array.isArray(data)) data = [data];

        // Set graph size
        var margin = { top: 20, right: 20, bottom: 50, left: 50 },
          viswidth = d3.select("#vis").node().getBoundingClientRect().width,
          visheight =
            d3.select("#vis").node().getBoundingClientRect().height - 5,
          width = viswidth - margin.left - margin.right,
          height = visheight - margin.top - margin.bottom;

        // Format X-axis
        var x, xx;
        var minx = this.getMin(data, "x");
        var maxx = this.getMax(data, "x");

        if (xscale === "Time") {
          x = d3.scaleTime().range([0, width]).domain([minx, maxx]);
          xx = d3.scaleTime().range([0, width]).domain([minx, maxx]);
        } else if (xscale === "Log") {
          x = d3.scaleLog().range([0, width]).domain([minx, maxx]);
          xx = d3.scaleLog().range([0, width]).domain([minx, maxx]);
        } else {
          x = d3.scaleLinear().range([0, width]).domain([minx, maxx]);
          xx = d3.scaleLinear().range([0, width]).domain([minx, maxx]);
        }

        // Format Y-axis
        var y, yy;
        var miny = this.getMin(data, "y");
        var maxy = this.getMax(data, "y");
        if (yscale === "Time") {
          y = d3.scaleTime().range([height, 0]).domain([miny, maxy]);
          yy = d3.scaleTime().range([height, 0]).domain([miny, maxy]);
        } else if (yscale === "Log") {
          y = d3.scaleLog().range([height, 0]).domain([miny, maxy]);
          yy = d3.scaleLog().range([height, 0]).domain([miny, maxy]);
        } else {
          y = d3.scaleLinear().range([height, 0]).domain([miny, maxy]);
          yy = d3.scaleLinear().range([height, 0]).domain([miny, maxy]);
        }

        // Define the axes
        var xAxis = d3.axisBottom(x).ticks(5);
        var yAxis = d3.axisLeft(y).ticks(5);

        // Adds the svg canvas
        var svg = d3
          .select("#vis")
          .append("svg")
          .attr("id", "linegraphsvg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        // Background color
        svg
          .append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("fill", bcolor);

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

        this.removeErrorWarning(clip);

        // Add the X Axis
        svg
          .append("g")
          .attr("class", "x axis")
          .attr("id", "axis--x")
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
                (height + margin.bottom / 1.5) +
                ")"
            )
            .attr("x", 6)
            .attr("dx", "1em")
            .style("text-anchor", "middle")
            .text(`${xlabel} (${xunits})`);
        }

        // Add the Y Axis
        svg
          .append("g")
          .attr("class", "y axis")
          .attr("id", "axis--y")
          .call(yAxis);

        if (ylabel !== "Time") {
          svg
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(`${ylabel} (${yunits})`);
        }

        // Add title
        svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", 2 - margin.top / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("text-decoration", "underline")
          .text(title);

        // Add legend
        if ("legend" in this.props) {
          let div = d3.select("#legend").call(
            d3
              .drag()
              .on("start.interrupt", function () {
                div.interrupt();
              })
              .on("start drag", function () {
                div.style("top", d3.event.y + "px");
                div.style("left", d3.event.x + "px");
              })
          );
        }

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
                if ((!isNaN(data[i]["x"][j]), !isNaN(data[i]["y"][j]))) {
                  xyt.push({
                    x: data[i]["x"][j],
                    y: data[i]["y"][j],
                  });
                }
              }
            }
            xy.push(xyt);
          }

          // Define the line
          var valueline = d3
            .line()
            .x(function (d) {
              return x(d.x);
            })
            .y(function (d) {
              return y(d.y);
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
            .attr("clip-path", "url(#clip)");

          // Add the line
          var line = svg
            .append("g")
            .attr("id", "plotlines")
            .attr("clip-path", "url(#clip)");

          //

          plotLine(line, confInt, data, confidence, xy, lcolor, lweight);

          function plotLine(
            line,
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
                    confInt
                      .append("path")
                      .attr("style", "fill:#DCDCDC;stroke:none")
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
          }

          // Zooming and Panning
          var zoom = d3
            .zoom()
            .extent([
              [0, 0],
              [width, height],
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

          function normalzoom() {
            x.domain(d3.event.transform.rescaleX(xx).domain());
            y.domain(d3.event.transform.rescaleY(yy).domain());
            svg.select("#axis--x").call(xAxis);
            svg.select("#axis--y").call(yAxis);
            line.selectAll("path").remove();
            confInt.selectAll("path").remove();
            plotLine(line, confInt, data, confidence, xy, lcolor, lweight);
          }

          var brush = d3
              .brush()
              .extent([
                [0, 0],
                [width, height],
              ])
              .on("end", brushended),
            idleTimeout,
            idleDelay = 350;

          line.append("g").attr("class", "brush").call(brush);

          // Add Focus
          var focus = svg
            .append("g")
            .append("circle")
            .style("fill", "red")
            .attr("stroke", "red")
            .attr("r", 4)
            .style("opacity", 0);

          // Add cursor catcher
          svg
            .select(".overlay")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout);
          svg
            .select("#zoombox")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout);

          function brushended() {
            mouseout();
            var s = d3.event.selection;
            if (!s) {
              if (!idleTimeout)
                return (idleTimeout = setTimeout(idled, idleDelay));
              x.domain(
                d3.extent(xy, function (d) {
                  return d.x;
                })
              );
              y.domain(
                d3.extent(xy, function (d) {
                  d.y = parseFloat(d.y);
                  return d.y;
                })
              );
            } else {
              xx.domain([s[0][0], s[1][0]].map(x.invert, x));
              yy.domain([s[1][1], s[0][1]].map(y.invert, y));
              line.select(".brush").call(brush.move, null);
              svg.call(zoom.transform, d3.zoomIdentity);
            }
            zoombox = zoombox.style("pointer-events", "all");
          }

          d3.select(window).on("keydown", function () {
            if (d3.event.shiftKey || d3.event.metaKey) {
              zoombox = zoombox.style("pointer-events", "none");
            } else if (d3.event.keyCode === 27) {
              zoombox = zoombox.style("pointer-events", "all");
            }
          });

          function mouseover() {
            focus.style("opacity", 1);
          }

          function mouseout() {
            focus.style("opacity", 0);
            document.getElementById("value").innerHTML = "";
          }

          function closestCoordinates(x0, y0, xy) {
            var x, y, dist_t;
            var dist = Infinity;
            for (var i = 0; i < xy.length; i++) {
              dist_t = Math.sqrt(
                Math.pow(Math.abs(xy[i].y - y0), 2) +
                  Math.pow(Math.abs(xy[i].x - x0), 2)
              );
              if (dist_t < dist) {
                x = xy[i].x;
                y = xy[i].y;
                dist = dist_t;
              }
            }
            return { x: x, y: y };
          }

          function mousemove() {
            var y0 = y.invert(d3.mouse(this)[1]);
            var x0 = x.invert(d3.mouse(this)[0]);
            var selectedData = closestCoordinates(x0, y0, xy[0]);
            focus.attr("cx", x(selectedData.x)).attr("cy", y(selectedData.y));
            if (xlabel === "Time") {
              document.getElementById("value").innerHTML =
                format(new Date(selectedData.x), "hh:mm dd MMM yy") +
                " | " +
                selectedData.y.toExponential(3) +
                yunits;
            } else {
              document.getElementById(
                "value"
              ).innerHTML = `${selectedData.x.toExponential(
                3
              )} ${xunits} | ${selectedData.y.toExponential(3)} ${yunits}`;
            }
          }

          function idled() {
            idleTimeout = null;
          }

          function downloadGraph() {
            var s = new XMLSerializer();
            var str = s.serializeToString(
              document.getElementById("linegraphsvg")
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
          }

          if (setDownloadGraph) {
            setDownloadGraph(downloadGraph);
          }
        }
      } catch (e) {
        console.error("Error plotting line graph", e);
      }
    }
  };

  componentDidMount() {
    this.plotLineGraph();
    window.addEventListener("resize", this.plotLineGraph, false);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plotLineGraph, false);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps, this.props)) {
      this.plotLineGraph();
    }
  }

  render() {
    if ("legend" in this.props) {
      var { legend } = this.props;
      var legendcontent = [];
      for (var i = 0; i < legend.length; i++) {
        legendcontent.push(
          <tr key={i}>
            <td style={{ color: legend[i].color }}>––</td>
            <td>{legend[i].text}</td>
          </tr>
        );
      }
    }

    return (
      <React.Fragment>
        <div className="vis-header">
          <div className="vis-data" id="value"></div>
        </div>
        <div id="vis" title="Click shift to activate zoom to area"></div>
        {"legend" in this.props && (
          <div id="legend">
            <table>
              <tbody>{legendcontent}</tbody>
            </table>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default D3LineGraph;

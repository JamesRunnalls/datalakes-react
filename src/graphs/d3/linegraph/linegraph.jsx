import React, { Component } from "react";
import * as d3 from "d3";
import { isEqual } from "lodash";
import { format } from "date-fns";
import "./linegraph.css";

class D3LineGraph extends Component {
  getMax = arr => {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
      max = arr[len] > max ? arr[len] : max;
    }
    return max;
  };

  getMin = arr => {
    let len = arr.length;
    let min = Infinity;

    while (len--) {
      min = arr[len] < min ? arr[len] : min;
    }
    return min;
  };

  formatDate = raw => {
    return new Date(raw * 1000);
  };

  removeErrorWarning = x => {
    return;
  };

  dataTransform = (label, data) => {
    if (label === "Time") {
      return this.formatDate(data);
    } else if (label === "Depth") {
      return -data;
    } else {
      return data;
    }
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
          bcolor,
          lcolor,
          lweight,
          title,
          setDownloadGraph
        } = this.props;
        var dataTransform = this.dataTransform;

        // Set graph size
        var margin = { top: 20, right: 20, bottom: 50, left: 50 },
          viswidth = d3
            .select("#vis")
            .node()
            .getBoundingClientRect().width,
          visheight =
            d3
              .select("#vis")
              .node()
              .getBoundingClientRect().height - 5,
          width = viswidth - margin.left - margin.right,
          height = visheight - margin.top - margin.bottom;

        // Format X-axis
        var x;
        var xdomain;
        if (xlabel === "Time") {
          var xe = [this.getMin(data.x), this.getMax(data.x)];
          xdomain = [this.formatDate(xe[0]), this.formatDate(xe[1])];
          x = d3
            .scaleTime()
            .range([0, width])
            .domain([this.getMin(xdomain), this.getMax(xdomain)]);
        } else if (xlabel === "Depth") {
          x = d3
            .scaleLinear()
            .range([0, width])
            .domain([-this.getMax(data.x), -this.getMin(data.x)]);
        } else {
          x = d3
            .scaleLinear()
            .range([0, width])
            .domain([this.getMin(data.x), this.getMax(data.x)]);
        }

        // Format Y-axis
        var y;
        var ydomain;
        if (ylabel === "Time") {
          var ye = [this.getMin(data.y), this.getMax(data.y)];
          ydomain = [this.formatDate(ye[0]), this.formatDate(ye[1])];
          y = d3
            .scaleTime()
            .range([height, 0])
            .domain([this.getMin(ydomain), this.getMax(ydomain)]);
        } else if (ylabel === "Depth") {
          y = d3
            .scaleLinear()
            .range([height, 0])
            .domain([-this.getMax(data.y), -this.getMin(data.y)]);
        } else {
          y = d3
            .scaleLinear()
            .range([height, 0])
            .domain([this.getMin(data.y), this.getMax(data.y)]);
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
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("fill", bcolor)
          .attr(
            "transform",
            "translate(-" + margin.left + ",-" + margin.top + ")"
          );

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
            .style("text-anchor", "end")
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

        main();    

        async function main() {
          // Transform Data
          var xy = [];
          for (var i = 0; i < data.x.length; i++) {
            xy.push({
              x: dataTransform(xlabel, data.x[i]),
              y: dataTransform(ylabel, data.y[i])
            });
          }

          // Define the line
          var valueline = d3
            .line()
            .defined(d => !isNaN(d.y))
            .x(function(d) {
              return x(d.x);
            })
            .y(function(d) {
              return y(d.y);
            });

          // Add the line
          var line = svg
            .append("g")
            .attr("id", "scatterplot")
            .attr("clip-path", "url(#clip)");

          line
            .append("path")
            .attr(
              "style",
              "fill:none;stroke:" +
                lcolor +
                "; stroke-width:" +
                lweight +
                "; fill-opacity:0; stroke-opacity:1;"
            )
            .attr("d", valueline(xy));

          // Brushing
          var brush = d3
              .brush()
              .extent([
                [0, 0],
                [width, height]
              ])
              .on("end", brushended),
            idleTimeout,
            idleDelay = 350;

          line
            .append("g")
            .attr("class", "brush")
            .call(brush);

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

          function brushended() {
            mouseout();
            var s = d3.event.selection;
            if (!s) {
              if (!idleTimeout)
                return (idleTimeout = setTimeout(idled, idleDelay));
              x.domain(
                d3.extent(xy, function(d) {
                  if (typeof d.x === "string") {
                    d.x = this.formatDate(d.x);
                  }
                  return d.x;
                })
              );
              y.domain(
                d3.extent(xy, function(d) {
                  d.y = parseFloat(d.y);
                  return d.y;
                })
              );
            } else {
              x.domain([s[0][0], s[1][0]].map(x.invert, x));
              y.domain([s[1][1], s[0][1]].map(y.invert, y));
              line.select(".brush").call(brush.move, null);
            }
            zoom();
          }

          function mouseover() {
            focus.style("opacity", 1);
          }

          function mouseout() {
            focus.style("opacity", 0);
            document.getElementById("value").innerHTML = "";
          }

          function closestCoordinates(x0,y0,xy) {
            var x,y,dist_t;
            var dist = Infinity;
            for (var i = 0; i < xy.length; i++) {
              dist_t = Math.sqrt(
                Math.pow(Math.abs(xy[i].y - y0), 2) +
                  Math.pow(Math.abs(xy[i].x - x0), 2)
              );
              if (dist_t < dist){
                x = xy[i].x;
                y = xy[i].y;
                dist = dist_t;
              }
            }
            return {x: x, y: y}
          }

          function mousemove() {
            var y0 = y.invert(d3.mouse(this)[1]);
            var x0 = x.invert(d3.mouse(this)[0]);
            var selectedData = closestCoordinates(x0,y0,xy)
            focus.attr("cx", x(selectedData.x)).attr("cy", y(selectedData.y));

            if (xlabel === "Time") {
              document.getElementById("value").innerHTML =
                format(new Date(selectedData.x), "hh:mm dd MMM yy") +
                " | " +
                selectedData.y +
                yunits;
            } else {
              document.getElementById(
                "value"
              ).innerHTML = `${selectedData.x} ${xunits} | ${selectedData.y} ${yunits}`;
            }
          }

          function idled() {
            idleTimeout = null;
          }

          function zoom() {
            var t = line.transition().duration(750);
            svg
              .select("#axis--x")
              .transition(t)
              .call(xAxis);
            svg
              .select("#axis--y")
              .transition(t)
              .call(yAxis);
            line
              .selectAll("path")
              .transition(t)
              .attr("d", valueline(xy));
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
            image.onerror = function() {
              alert(
                "Appologies .png download failed. Pleaseawait  download as .svg."
              );
            };
            image.onload = function() {
              context.drawImage(image, 0, 0);
              var a = document.createElement("a");
              a.download = "downloadgraph.png";
              a.href = canvas.toDataURL("image/png");
              a.click();
            };
            image.src =
              "data:image/svg+xml;charset=utf8," + encodeURIComponent(str);
          }

          setDownloadGraph(downloadGraph);
        }
      } catch (e) {
        console.error("Error plotting line graph", e);
      }
    }
  };

  componentDidMount() {
    window.addEventListener("resize", this.plotLineGraph, false);
  }

  componentWillUnmount() {
    window.removeEventListener("resize",this.plotLineGraph, false);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps, this.props)) {
      this.plotLineGraph();
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="vis-header">
          <div className="vis-data" id="value"></div>
        </div>
        <div id="vis"></div>
      </React.Fragment>
    );
  }
}

export default D3LineGraph;

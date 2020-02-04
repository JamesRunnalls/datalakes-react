import React, { Component } from "react";
import * as d3 from "d3";
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

  plotLineGraph = () => {
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
          sequential,
          bcolor,
          lcolor,
          lweight,
          title,
          download,
          endDownload
        } = this.props;

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
            .domain([-this.getMax(data.x),-this.getMin(data.x)]);
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
          .domain([-this.getMax(data.y),-this.getMin(data.y)]);
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

        // Transform Data
        var xy = [];
        for (var i = 0; i < data.x.length; i++) {
          xy.push({
            x: this.dataTransform(xlabel, data.x[i]),
            y: this.dataTransform(ylabel, data.y[i])
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

        // Add title
        svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 2 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "14px") 
        .style("text-decoration", "underline")  
        .text(title);

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

        var bisectx = d3.bisector(function(d) {
          return d.x;
        }).left;

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

        function mousemove() {
          var selectedData = "";
          if (sequential === "y") {
            var y0 = y.invert(d3.mouse(this)[1]);
            selectedData = xy.sort(function(a, b) {
              return Math.abs(a.y - y0) - Math.abs(b.y - y0);
            })[0];
          } else {
            var x0 = x.invert(d3.mouse(this)[0]);
            var i = bisectx(xy, x0, 1);

            selectedData = xy[i];
          }
          focus.attr("cx", x(selectedData.x)).attr("cy", y(selectedData.y));

          if (xlabel === "Time") {
            document.getElementById("value").innerHTML =
              format(new Date(selectedData.x), "hh:mm dd MMM yy") +
              " | " +
              selectedData.y +
              yunits;
          } else {
            document.getElementById("value").innerHTML =
            `${selectedData.x} ${xunits} | ${selectedData.y} ${yunits}`;
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

        if (download) {
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
            alert("Appologies .png download failed. Please download as .svg.");
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
        endDownload();
      } catch (e) {
        console.error("Error plotting line graph", e);
      }
    }
  };

  componentDidMount() {
    window.addEventListener("resize", this.plotLineGraph);
    this.plotLineGraph();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.plotLineGraph);
  }

  componentDidUpdate() {
    this.plotLineGraph();
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

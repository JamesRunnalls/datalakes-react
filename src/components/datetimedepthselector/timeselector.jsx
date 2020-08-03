import React, { Component } from "react";
import * as d3 from "d3";
import { isEqual } from "lodash";

class TimeSelector extends Component {
  removeErrorWarning = (x) => {
    return;
  };
  plotLineGraph = async () => {
    try {
      d3.select("#timeselectorsvg").remove();
    } catch (e) {}
    var {
      selectedlayers,
      datetime,
      mindatetime,
      maxdatetime,
      onChangeDatetime,
    } = this.props;
    if (selectedlayers.length && mindatetime && maxdatetime) {
      try {
        // Set graph size
        var currentZoom = d3.zoomIdentity;
        var margin = { top: 0, right: 10, bottom: 20, left: 0 },
          viswidth = d3.select("#timeselector").node().getBoundingClientRect()
            .width,
          visheight = margin.bottom + selectedlayers.length * 5,
          width = viswidth - margin.left - margin.right,
          height = visheight - margin.top - margin.bottom;

        // Format X-axis
        var x = d3
          .scaleTime()
          .range([0, width])
          .domain([mindatetime, maxdatetime]);
        var xx = d3
          .scaleTime()
          .range([0, width])
          .domain([mindatetime, maxdatetime]);

        // Define the axes
        var xAxis = d3.axisBottom(x).ticks(5);

        var zoom = d3
          .zoom()
          .scaleExtent([1, 100000000])
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("zoom", zoomed);

        function zoomed() {
          x.domain(d3.event.transform.rescaleX(xx).domain());
          gX.call(xAxis);
        }

        // Adds the svg canvas
        var svg = d3
          .select("#timeselector")
          .append("svg")
          .attr("id", "timeselectorsvg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          )
          .call(zoom);

        // Add the X Axis
        var gX = svg
          .append("g")
          .attr("class", "xaxis")
          .attr("id", "axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        // Add the availability data
        var array;
        for (var i = 0; i < selectedlayers.length; i++) {
          array = selectedlayers[i].files.map((x) => ({
            min: new Date(x.mindatetime),
            max: new Date(x.maxdatetime),
          }));
          svg
            .selectAll("dot")
            .data(array)
            .enter()
            .append("rect")
            .attr("height", 4)
            .attr("width", function (d) {
              return Math.max(1, x(d.max) - x(d.min));
            })
            .attr("stroke", selectedlayers[i].color)
            .attr("fill", selectedlayers[i].color)
            .attr("x", function (d) {
              return x(d.min);
            })
            .attr("y", function (d) {
              return i * 5;
            });
        }

        // Add Focus
        var focus = svg
          .append("g")
          .append("circle")
          .style("fill", "#F83F3F")
          .attr("stroke", "#F83F3F")
          .attr("r", 5)
          .attr("cy", selectedlayers.length * 5)
          .style("opacity", 0)
          .html("some text" + "<br/>");

        // Add the current value
        svg
          .append("g")
          .append("circle")
          .style("fill", "red")
          .attr("stroke", "red")
          .attr("r", 6)
          .attr("cy", selectedlayers.length * 5)
          .attr("cx", x(datetime));

        svg
          .append("rect")
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr("width", width)
          .attr("height", height + margin.bottom)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseout", mouseout)
          .on("click", onClick);

        function onClick() {
          var date = x.invert(d3.mouse(this)[0]);
          if (typeof date.getMonth === "function") {
            onChangeDatetime(date);
          }
        }

        function mouseover() {
          focus.style("opacity", 1);
        }

        function mouseout() {
          focus.style("opacity", 0);
        }

        function mousemove() {
          try {
            focus.attr("cx", d3.mouse(this)[0]);
          } catch (e) {}
        }
      } catch (e) {
        console.error("Error plotting time selector", e);
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
    this.plotLineGraph();
  }
  render() {
    var { selectedlayers, mindatetime, maxdatetime } = this.props;
    return (
      <div className="timeselector">
        <div id="timeselector"></div>
      </div>
    );
  }
}

export default TimeSelector;

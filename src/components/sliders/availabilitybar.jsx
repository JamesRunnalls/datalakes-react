import React, { Component } from "react";
import * as d3 from "d3";
import { scaleTime } from "d3";
import "./slider.css";

class AvailbilityBar extends Component {
  state = {
    plotted: false,
  };

  formatDate = (raw) => {
    return new Date(raw * 1000);
  };

  plotBar = () => {
    try {
      d3.select("#availabilitybarsvg").remove();
    } catch (e) {}

    var width = d3.select("#availabilitybar").node().getBoundingClientRect()
      .width;

    if (width > 0) {
      this.setState({ plotted: true });
      var { min, max, files } = this.props;
      var array = files.map((x) => ({
        min: new Date(x.mindatetime),
        max: new Date(x.maxdatetime),
      }));

      var svg = d3
        .select("#availabilitybar")
        .append("svg")
        .attr("id", "availabilitybarsvg")
        .attr("height", 6)
        .attr("width", width);
      var x = scaleTime().domain([min, max]).range([0, width]);
      svg
        .selectAll("dot")
        .data(array)
        .enter()
        .append("rect")
        .attr("height", 6)
        .attr("width", function (d) {
          return x(d.max) - x(d.min);
        })
        .attr("stroke", "deepskyblue")
        .attr("fill", "deepskyblue")
        .attr("x", function (d) {
          return x(d.min);
        })
        .attr("y", function (d) {
          return 0;
        });
    }
  };

  componentDidMount() {
    this.plotBar();
  }

  componentDidUpdate() {
    var { plotted } = this.state;
    if (!plotted) {
      this.plotBar();
    }
  }

  render() {
    return <div id="availabilitybar" className="availabilitybar"></div>;
  }
}

export default AvailbilityBar;

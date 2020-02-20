import React, { Component } from "react";
import * as d3 from "d3";
import { scaleTime } from "d3";
import "./slider.css";

class AvailbilityBar extends Component {
  formatDate = raw => {
    return new Date(raw * 1000);
  };

  componentDidMount() {
    var { min, max, filedict } = this.props;
    var array = filedict.map(x => this.formatDate(x));

    var width = d3
      .select("#availabilitybar")
      .node()
      .getBoundingClientRect().width;
    var svg = d3
      .select("#availabilitybar")
      .append("svg")
      .attr("id", "availabilitybarsvg")
      .attr("height",6)
      .attr("width",width)
    var x = scaleTime()
      .domain([min, max])
      .range([0, width]);
    svg
      .selectAll("dot")
      .data(array)
      .enter()
      .append("rect")
      .attr("height", 6)
      .attr("width", 1)
      .attr("stroke","deepskyblue")
      .attr("x", function(d) {
        return x(d);
      })
      .attr("y", function(d) {
        return 0;
      });
  }

  render() {
    return <div id="availabilitybar" className="availabilitybar"></div>;
  }
}

export default AvailbilityBar
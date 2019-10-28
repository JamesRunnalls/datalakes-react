import React, { Component } from 'react';
import * as d3 from 'd3';
import { format } from "date-fns";
import { generateColor } from '../gradients/gradients';
import './heatmap.css';

class D3HeatMap extends Component {

    plotHeatMap = () => {
      try {
        d3.select("svg").remove();
      } catch (e) {};

      var { data, graphtype, bcolor, sgradient, egradient, yint, xint } = this.props;

      // Set graph size
      var margin = {top: 20, right: 20, bottom: 50, left: 50}
      , viswidth = d3.select("#heatmap").node().getBoundingClientRect().width
      , visheight = d3.select("#heatmap").node().getBoundingClientRect().height
      , width =  viswidth - margin.left - margin.right
      , height = visheight - margin.top - margin.bottom;

      // Get data extents
      if (graphtype === 'time') {
        var parseDate = d3.timeParse("%Y");
        var xdomain = d3.extent(data, function(d) {
                d.x = parseDate(d.x);
                return d.x; 
            });
      } else {
          var xdomain = d3.extent(data, function(d) {
              d.x = parseFloat(d.x);
              return d.x; 
          });
          
      }
      xdomain[0] = xdomain[0] - (parseDate(xint)/2);
      xdomain[1] = xdomain[1] + (parseDate(xint)/2);
      console.log(xdomain);

      var ydomain = d3.extent(data, function(d) {
              d.y = parseFloat(d.y);
              return d.y; 
          });
      ydomain[0] = ydomain[0] - (yint/2);
      ydomain[1] = ydomain[1] + (yint/2);
      
      var vdomain = d3.extent(data, function(d) {
            d.v = parseFloat(d.v);
            return d.v; 
        });

      // Set bar width and height
      var barWidth = width / (xdomain[1] - xdomain[0] +1 ),
      barHeight = height / (ydomain[1] - ydomain[0] +1 );

      // Set color gradients
      var ncolors = 100;
      var gradient = generateColor(this.props.sgradient,this.props.egradient,ncolors);
      var colorScale = d => {
          var i = Math.round(((d.v - vdomain[0])/(vdomain[1] - vdomain[0]))*(ncolors-1));
          return gradient[i];
      }

      // Format X-axis
      if (graphtype === 'time') {
        var parseDate = d3.timeParse("%Y");
        var x = d3.scaleTime()
            .range([0, width])
            .domain(xdomain);
      } else {
          var x = d3.scaleLinear()
          .range([0, width])
          .domain(xdomain);
      }  

      // Format Y-axis
      var y = d3.scaleLinear()
          .range([height, 0])
          .domain(ydomain);

      // Define the axes
      var xAxis = d3.axisBottom(x).ticks(5);
      var yAxis = d3.axisLeft(y).ticks(5);

      // Adds the svg canvas
      var svg = d3.select("#heatmap")
          .append("svg")
          .attr("id", "svg" )
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

      // Background color
      svg.append("rect")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("fill", bcolor)
        .attr("transform", 
            "translate(-" + margin.left + ",-" + margin.top + ")");

    // Set clip 
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0) 
        .attr("y", 0)

      // Add the X Axis
      if (graphtype === 'time') {
        svg.append("g")
        .attr("class", "x axis")
        .attr('id', "axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    } else {
        var xLabel = "";
        if ('xlabel' in this.props){
            xLabel = this.props.xlabel;
        }

        var xunits = "";
        if ('xunits' in this.props){
            xunits = this.props.xunits;
            xLabel = this.props.xlabel + " (" + xunits + ")";
        }

        svg.append("g")
            .attr("class", "x axis")
            .attr('id', "axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom/1.5) + ")")
            .attr("x", 6)
            .attr("dx", "1em")
            .style("text-anchor", "end")
            .text(xLabel);
    }

    // Add the Y Axis
    var yLabel = "";
    if ('ylabel' in this.props){
        yLabel = this.props.ylabel;
    }

    var yunits = "";
    if ('yunits' in this.props){
        yunits = this.props.yunits;
        yLabel = this.props.ylabel + " (" + yunits + ")";
    }

    svg.append("g")
        .attr("class", "y axis")
        .attr('id', "axis--y")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(yLabel);
    
  
    //Append heatmap bars, styles, and mouse events
    svg.selectAll('g')
      .data(data).enter().append('g')
      .append('rect')
      .attr('x', d => {return (d.x - xdomain[0]) * barWidth})
      .attr('y', d => {return (d.y - ydomain[0]) * barHeight})
      .style('fill', colorScale)
      .attr('width', barWidth)
      .attr('height', barHeight);
    }

    componentDidMount() {
      window.addEventListener("resize", this.plotHeatMap);
      this.plotHeatMap();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.plotHeatMap);
    }

    componentDidUpdate() {
        this.plotHeatMap();
    }

  render() {
        return(
            <div id="heatmap">

            </div>
          );
  }
}

export default D3HeatMap;
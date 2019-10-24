import React, { Component } from 'react';
import * as d3 from 'd3';
import datas from './data.json';
import './linegraph.css'

class D3LineGraph extends Component {

    componentDidMount() {
        // Set graph size
        var margin = {top: 20, right: 20, bottom: 50, left: 50}
        , width = d3.select("#vis").node().getBoundingClientRect().width - margin.left - margin.right // Use the window's width 
        , height = d3.select("#vis").node().getBoundingClientRect().height - margin.top - margin.bottom; // Use the window's height
      
        var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");

        // Set the ranges
        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        // Define the line
        var valueline = d3.line()
            .x(function(d) { return x(d.time); })
            .y(function(d) { return y(d.value); });

        // Define the axes
        var xAxis = d3.axisBottom(x).ticks(5);;
        var yAxis = d3.axisLeft(y).ticks(5);

        // Adds the svg canvas
        var svg = d3.select("#vis")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");

        // Set domain
        x.domain(d3.extent(datas, function(d) {
            if (typeof(d.time) == "string"){d.time = parseDate(d.time);};
            return d.time; 
        }));
        y.domain(d3.extent(datas, function(d) {
            d.value = parseFloat(d.value);
            return d.value; 
        }));

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);


        svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(datas));
       
        
    }
  
    render() {
        return(
            <div id="vis">

            </div>
        );
    }
}

export default D3LineGraph;
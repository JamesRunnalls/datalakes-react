import React, { Component } from 'react';
import * as d3 from 'd3';
import datas from './data.json';
import './linegraph.css'

class D3LineGraph extends Component {

    plotLineGraph = () => {
        try {
            d3.select("svg").remove();
        } catch (e) {};

        // Set graph size
        var margin = {top: 20, right: 20, bottom: 50, left: 50}
        , width = d3.select("#vis").node().getBoundingClientRect().width - margin.left - margin.right // Use the window's width 
        , height = d3.select("#vis").node().getBoundingClientRect().height - margin.top - margin.bottom; // Use the window's height
      
        var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");

        // Set the ranges
        var x = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(datas, function(d) {
                if (typeof(d.time) === "string"){d.time = parseDate(d.time);};
                return d.time; 
            }));
        var y = d3.scaleLinear()
            .range([height, 0])
            .domain(d3.extent(datas, function(d) {
                d.value = parseFloat(d.value);
                return d.value; 
            }));

        // Define the line
        var valueline = d3.line()
            .x(function(d) { return x(d.time); })
            .y(function(d) { return y(d.value); });

        // Define the axes
        var xAxis = d3.axisBottom(x).ticks(5);
        var yAxis = d3.axisLeft(y).ticks(5);

        // Adds the svg canvas
        var svg = d3.select("#vis")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");

        // Set clip 
        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width )
            .attr("height", height )
            .attr("x", 0) 
            .attr("y", 0); 
        
        // Add the X Axis
        svg.append("g")
           .attr("class", "x axis")
           .attr('id', "axis--x")
           .attr("transform", "translate(0," + height + ")")
           .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .attr('id', "axis--y")
            .call(yAxis);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "1em")
            .style("text-anchor", "end")
            .text("Y Label");

        // Add the line
        var line = svg.append("g")
            .attr("id", "scatterplot")
            .attr("clip-path", "url(#clip)");
        
        line.append("path")
            .attr("class", "line")
            .attr("d", valueline(datas));

        // Brushing
        var brush = d3.brush().extent([[0, 0], [width, height]]).on("end", brushended),
            idleTimeout,
            idleDelay = 350;
        
        line.append("g")
            .attr("class", "brush")
            .call(brush);

        function brushended() {
            var s = d3.event.selection;
            if (!s) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
                    x.domain(d3.extent(datas, function(d) {
                        if (typeof(d.time) === "string"){d.time = parseDate(d.time);};
                        return d.time; 
                    }));
                    y.domain(d3.extent(datas, function(d) {
                        d.value = parseFloat(d.value);
                        return d.value; 
                    }));
            } else {
                x.domain([s[0][0], s[1][0]].map(x.invert, x));
                y.domain([s[1][1], s[0][1]].map(y.invert, y));
                line.select(".brush").call(brush.move, null);
            }
            zoom();
        }
       
        function idled() {
            idleTimeout = null;
        }

        function zoom() {
            var t = line.transition().duration(750);
            svg.select("#axis--x").transition(t).call(xAxis);
            svg.select("#axis--y").transition(t).call(yAxis);
            line.selectAll("path").transition(t)
                .attr("d", valueline(datas));
        }
    }

    componentDidMount() {
        this.plotLineGraph();
        window.addEventListener("resize", this.plotLineGraph);
    }

    componentWillUnmount (){
        window.removeEventListener("resize", this.plotLineGraph);
    }
  
    render() {
        return(
            <div id="vis"> 

            </div>
        );
    }
}

export default D3LineGraph;
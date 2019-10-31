import React, { Component } from 'react';
import * as d3 from 'd3';
import { format } from "date-fns";
import download from './img/download.svg';
import './linegraph.css'

class D3LineGraph extends Component {

    plotLineGraph = () => {
        try {
            d3.select("svg").remove();
        } catch (e) {};

        var { data, graphtype, sequential, bcolor, lcolor, lweight } = this.props;

        // Set graph size
        var margin = {top: 20, right: 20, bottom: 50, left: 50}
        , viswidth = d3.select("#vis").node().getBoundingClientRect().width
        , visheight = d3.select("#vis").node().getBoundingClientRect().height - 5
        , width =  viswidth - margin.left - margin.right
        , height = visheight - margin.top - margin.bottom;

        // Format X-axis
        if (graphtype === 'time') {
            var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
            var x = d3.scaleTime()
                .range([0, width])
                .domain(d3.extent(data, function(d) {
                    if (typeof(d.x) === "string"){d.x = parseDate(d.x);};
                    return d.x; 
                }));
        } else {
            var x = d3.scaleLinear()
            .range([0, width])
            .domain(d3.extent(data, function(d) {
                d.x = parseFloat(d.x);
                return d.x; 
            }));
        }  

        // Format Y-axis
        var y = d3.scaleLinear()
            .range([height, 0])
            .domain(d3.extent(data, function(d) {
                d.y = parseFloat(d.y);
                return d.y; 
            }));

        // Define the line
        var valueline = d3.line()
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); });

        // Define the axes
        var xAxis = d3.axisBottom(x).ticks(5);
        var yAxis = d3.axisLeft(y).ticks(5);

        // Adds the svg canvas
        var svg = d3.select("#vis")
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

        // Add the line
        var line = svg.append("g")
            .attr("id", "scatterplot")
            .attr("clip-path", "url(#clip)");
        
        line.append("path")
            .attr("style", "fill:none;stroke:"+lcolor+"; stroke-width:"+lweight+"; fill-opacity:0; stroke-opacity:1;")
            .attr("d", valueline(data));

        // Brushing
        var brush = d3.brush().extent([[0, 0], [width, height]]).on("end", brushended),
            idleTimeout,
            idleDelay = 350;
        
        line.append("g")
            .attr("class", "brush")
            .call(brush);

        // Add Focus
        var focus = svg
            .append('g')
            .append('circle')
            .style("fill", "red")
            .attr("stroke", "red")
            .attr('r', 4)
            .style("opacity", 0)

        var bisectx = d3.bisector(function(d) { return d.x; }).left;

         // Add cursor catcher
         svg.select('.overlay')
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);

        function brushended() {
            mouseout();
            var s = d3.event.selection;
            if (!s) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
                    x.domain(d3.extent(data, function(d) {
                        if (typeof(d.x) === "string"){d.x = parseDate(d.x);};
                        return d.x; 
                    }));
                    y.domain(d3.extent(data, function(d) {
                        d.y = parseFloat(d.y);
                        return d.y; 
                    }));
            } else {
                x.domain([s[0][0], s[1][0]].map(x.invert, x));
                y.domain([s[1][1], s[0][1]].map(y.invert, y));
                line.select(".brush").call(brush.move, null);
            }
            zoom();
        }

        function mouseover() {
            focus.style("opacity", 1)
        }

        function mouseout() {
            focus.style("opacity", 0)
            document.getElementById("value").innerHTML = "";
        }

        function mousemove() {
            var selectedData = "";
            if (sequential === "y"){
                var y0 = y.invert(d3.mouse(this)[1]);
                var selectedData = data.sort(function(a,b){ 
                    return Math.abs(a.y-y0) - Math.abs(b.y-y0)
                })[0];
            } else {
                var x0 = x.invert(d3.mouse(this)[0]);
                var i = bisectx(data, x0, 1);

                var selectedData = data[i];
            }
            focus
                .attr("cx", x(selectedData.x))
                .attr("cy", y(selectedData.y))

            if (graphtype === "time"){
                document.getElementById("value").innerHTML = format(new Date(selectedData.x), "hh:mm dd MMM yy") + " | " + selectedData.y + yunits;
            } else {
                document.getElementById("value").innerHTML = selectedData.x + xunits+ " | " + selectedData.y + yunits;
            }      
        }
       
        function idled() {
            idleTimeout = null;
        }

        function zoom() {
            var t = line.transition().duration(750);
            svg.select("#axis--x").transition(t).call(xAxis);
            svg.select("#axis--y").transition(t).call(yAxis);
            line.selectAll("path").transition(t)
                .attr("d", valueline(data));
        }

        d3.select("#linegraph-download").on("click", function(){
            var s = new XMLSerializer();
            var str = s.serializeToString(document.getElementById("svg"));

            var canvas = document.createElement("canvas"),
                context = canvas.getContext("2d");

            canvas.width = viswidth;
            canvas.height = visheight;


            var image = new Image;
            image.onerror = function() {
                alert("Appologies .png download failed. Please download as .svg.");
            }
            image.onload = function() {
                context.drawImage(image, 0, 0);
                var a = document.createElement("a");
                a.download = "downloadgraph.png";
                a.href = canvas.toDataURL("image/png");
                a.click();
            };
            image.src = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(str);            
        });
    }

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
        
        return(
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
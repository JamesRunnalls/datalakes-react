import React, { Component } from "react";
import DateSlider from "../../../components/dateslider/dateslider";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import DataSelect from "../../../components/dataselect/dataselect";
import FilterBox from "../../../components/filterbox/filterbox";
import "../datadetail.css";

class LineGraph extends Component {
  state = {
    lcolor: "black",
    lweight: "0.5",
    bcolor: "#ffffff",
    xaxis: "x",
    yaxis: "y"
  };

  update = () => {
    var lcolor = document.getElementById("lcolor").value;
    var lweight = document.getElementById("lweight").value;
    var bcolor = document.getElementById("bcolor").value;
    this.setState({ lcolor, lweight, bcolor });
  };

  reset = () => {
    this.setState({
      lcolor: "black",
      lweight: "0.5",
      bcolor: "#ffffff"
    });
    document.getElementById("lweight").value = "";
  };

  handleAxisSelect = axis => event => {
    this.setState({ [axis]: event.value });
  };

  datetimeFilter = (data, lower, upper, min, max) => {
    if ((lower !== min && lower !== "") || (upper !== max && upper !== "")) {
      var l = 0;
      var u = data.x.length - 1;
      for (var i = 0; i < data.x.length; i++) {
        if (data.x[i] < lower) {
          l = i;
        }
        if (data.x[i] > upper && u === data.x.length - 1) {
          u = i;
        }
      }
      var x = data.x.slice(l, u);
      var y = data.y.slice(l, u);
      return { x: x, y: y };
    } else {
      return data;
    }
  };

  render() {
    var {
      onChange,
      parameters,
      getLabel,
      data,
      lower,
      upper,
      max,
      min
    } = this.props;
    const { lweight, bcolor, lcolor, xaxis, yaxis } = this.state;

    // Axis Options
    const xoptions = [];
    const yoptions = [];
    for (var j = 0; j < parameters.length; j++) {
      if (parameters[j]["axis"].includes("x")) {
        xoptions.push({
          value: parameters[j]["axis"],
          label: getLabel("parameters", parameters[j]["parameters_id"])
        });
      } else if (parameters[j]["axis"].includes("y")) {
        yoptions.push({
          value: parameters[j]["axis"],
          label: getLabel("parameters", parameters[j]["parameters_id"])
        });
      }
    }

    // Get data for selected options
    var plotdata = { x: data[xaxis], y: data[yaxis] };

    // Datetime filter
    plotdata = this.datetimeFilter(plotdata, lower, upper, min, max);

    // Get axis labels
    const xparam = parameters.find(x => x.axis === xaxis);
    const yparam = parameters.find(y => y.axis === yaxis);
    const xlabel = getLabel("parameters", xparam.parameters_id),
      ylabel = getLabel("parameters", yparam.parameters_id),
      xunits = xparam.unit,
      yunits = yparam.unit;

    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <D3LineGraph
              data={plotdata}
              xlabel={xlabel}
              ylabel={ylabel}
              xunits={xunits}
              yunits={yunits}
              sequential="x"
              lcolor={lcolor}
              lweight={lweight}
              bcolor={bcolor}
            />
          }
          rightNoScroll={
            <React.Fragment>
              <div>
                x:{" "}
                <div className="axis-select">
                  <DataSelect
                    value="value"
                    label="label"
                    dataList={xoptions}
                    defaultValue={xaxis}
                    onChange={this.handleAxisSelect("xaxis")}
                  />
                </div>
                {"\n"}y:{" "}
                <div className="axis-select">
                  <DataSelect
                    value="value"
                    label="label"
                    dataList={yoptions}
                    defaultValue={yaxis}
                    onChange={this.handleAxisSelect("yaxis")}
                  />
                </div>
              </div>
              <FilterBox
                title="Date Range"
                content={
                  <div className="side-date-slider">
                    <DateSlider
                      onChange={onChange}
                      min={min}
                      max={max}
                      lower={lower}
                      upper={upper}
                    />
                  </div>
                }
              />
              <FilterBox
                title="Display Options"
                content={
                  <div>
                    <table className="colors-table">
                      <tbody>
                        <tr>
                          <td></td>
                          <td>Color</td>
                          <td>Weight</td>
                        </tr>
                        <tr>
                          <td>Line</td>
                          <td>
                            <input
                              type="color"
                              id="lcolor"
                              defaultValue={lcolor}
                            />
                          </td>
                          <td>
                            <input
                              id="lweight"
                              type="number"
                              className="color-value"
                              defaultValue={lweight}
                            ></input>
                          </td>
                        </tr>
                        <tr>
                          <td>Background</td>
                          <td>
                            <input
                              type="color"
                              id="bcolor"
                              defaultValue={bcolor}
                            />
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="color-buttons">
                      <button className="color-button" onClick={this.update}>
                        Update
                      </button>
                      <button className="color-button" onClick={this.reset}>
                        Reset
                      </button>
                    </div>
                  </div>
                }
              />
              <FilterBox
                title="Download"
                content={
                  <button
                    id="linegraph-download"
                    className="download-button"
                    onClick={this.download}
                  >
                    Download as PNG
                  </button>
                }
              />
            </React.Fragment>
          }
          open="False"
        />
      </React.Fragment>
    );
  }
}

export default LineGraph;

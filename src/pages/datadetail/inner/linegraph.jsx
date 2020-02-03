import React, { Component } from "react";
import DateSlider from "../../../components/dateslider/dateslider";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import "../datadetail.css";

class LineGraph extends Component {
    state = {
      lcolor: "black",
      lweight: "0.5",
      bcolor: "#ffffff"
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
      const { lweight, bcolor, lcolor } = this.state;
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
        //var z = [];
        data = { x: x, y: y };
      }
      // Get axis labels
      const xparam = parameters.find(x => x.axis === "x");
      const yparam = parameters.find(y => y.axis === "y");
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
                data={data}
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
            right={
              <React.Fragment>
                <div className="info-title" style={{ paddingTop: "0" }}>
                  Set Date Range
                </div>
                <div className="side-date-slider">
                  <DateSlider
                    onChange={onChange}
                    min={min}
                    max={max}
                    lower={lower}
                    upper={upper}
                  />
                </div>
                <div className="info-title">Adjust Colors</div>
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
                        <input type="color" id="lcolor" defaultValue={lcolor} />
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
                        <input type="color" id="bcolor" defaultValue={bcolor} />
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
  
                <div className="info-title">Download Image</div>
                <button
                  id="linegraph-download"
                  className="download-button"
                  onClick={this.download}
                >
                  Download
                </button>
              </React.Fragment>
            }
            open="False"
          />
        </React.Fragment>
      );
    }
  }

  export default LineGraph;
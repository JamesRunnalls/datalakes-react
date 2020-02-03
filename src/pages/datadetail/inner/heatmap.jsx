import React, { Component } from "react";
import DateSlider from "../../../components/dateslider/dateslider";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";
import "../datadetail.css";

class HeatMap extends Component {
    state = {
      bcolor: "#ffffff",
      sgradient: "#0000ff",
      egradient: "#ff0000",
      minz: "",
      maxz: ""
    };
    onChangeBcolor = event => {
      var bcolor = event.hex;
      this.setState({ bcolor });
    };
  
    update = () => {
      var sgradient = document.getElementById("sgradient").value;
      var egradient = document.getElementById("egradient").value;
      var minz = document.getElementById("minz").value;
      var maxz = document.getElementById("maxz").value;
      var bcolor = document.getElementById("bcolor").value;
      this.setState({ sgradient, egradient, minz, maxz, bcolor });
    };
  
    reset = () => {
      this.setState({
        bcolor: "#ffffff",
        sgradient: "#0000ff",
        egradient: "#ff0000",
        minz: "",
        maxz: ""
      });
      document.getElementById("maxz").value = "";
      document.getElementById("minz").value = "";
    };
  
    isNumeric = n => {
      return !isNaN(parseFloat(n)) && isFinite(n);
    };
  
    render() {
      var { onChange, dataset, data, lower, upper, max, min } = this.props;
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
        var y = data.y;
        var z = [];
        for (var zl of data.z) {
          z.push(zl.slice(l, u));
        }
        data = { x: x, y: y, z: z };
      }
      const { units, axis } = dataset;
      const { bcolor, sgradient, egradient, minz, maxz } = this.state;
      const xlabel = axis.x,
        ylabel = axis.y,
        zlabel = axis.z,
        xunits = units.x,
        yunits = units.y,
        zunits = units.z;
      return (
        <React.Fragment>
          <SidebarLayout
            sidebartitle="Plot Controls"
            left={
              <D3HeatMap
                data={data}
                xlabel={xlabel}
                ylabel={ylabel}
                zlabel={zlabel}
                xunits={xunits}
                yunits={yunits}
                zunits={zunits}
                bcolor={bcolor}
                sgradient={sgradient}
                egradient={egradient}
                minz={minz}
                maxz={maxz}
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
                      <td></td>
                      <td>Color</td>
                      <td>Value ({zunits})</td>
                    </tr>
                    <tr>
                      <td rowSpan="2">Gradient</td>
                      <td>Max</td>
                      <td>
                        <input
                          type="color"
                          id="egradient"
                          defaultValue={egradient}
                        />
                      </td>
                      <td>
                        <input
                          id="maxz"
                          type="number"
                          className="color-value"
                        ></input>
                      </td>
                    </tr>
                    <tr>
                      <td>Min</td>
                      <td>
                        <input
                          type="color"
                          id="sgradient"
                          defaultValue={sgradient}
                        />
                      </td>
                      <td>
                        <input
                          id="minz"
                          type="number"
                          className="color-value"
                        ></input>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2">Background</td>
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
                  id="heatmap-download"
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

  export default HeatMap;
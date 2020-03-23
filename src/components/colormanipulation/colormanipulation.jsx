import React, { Component } from "react";
import "./colormanipulation.css";
import ColorRamp from "../colorramp/colorramp";
import ColorTable from "../colortable/colortable";
import ColorSlider from "../colorslider/colorslider";
import ColorSolid from "../colorsolid/colorsolid";

class ColorManipulation extends Component {
  state = {
    manipulation: "ramp"
  };

  setManipulation = manipulation => {
    if (manipulation !== this.state.manipulation) {
      this.setState({ manipulation });
    }
  };

  localColorChange = colors => {
    this.setState({ colors });
  };

  render() {
    var { manipulation } = this.state;
    var { onChange, array, colors } = this.props;
    return (
      <div>
        <div className="colormanipulation-headerbar">
          <div
            className={
              manipulation === "solid"
                ? "colormanipulation-header header-active"
                : "colormanipulation-header"
            }
            onClick={() => this.setManipulation("solid")}
          >
            Solid
          </div>
          <div
            className={
              manipulation === "ramp"
                ? "colormanipulation-header header-active"
                : "colormanipulation-header"
            }
            onClick={() => this.setManipulation("ramp")}
          >
            Ramp
          </div>
          <div
            className={
              manipulation === "table"
                ? "colormanipulation-header header-active"
                : "colormanipulation-header"
            }
            onClick={() => this.setManipulation("table")}
          >
            Table
          </div>
          {/*<div
            className={
              manipulation === "slider"
                ? "colormanipulation-header header-active"
                : "colormanipulation-header"
            }
            onClick={() => this.setManipulation("slider")}
          >
            Slider
          </div>*/}
        </div>
        <div>
          {manipulation === "solid" && (
            <ColorSolid onChange={onChange} colors={colors} />
          )}
          {manipulation === "ramp" && (
            <ColorRamp onChange={onChange} colors={colors} />
          )}
          {manipulation === "table" && (
            <ColorTable
              onChange={onChange}
              colors={colors}
              array={array}
              autoOptimise={true}
            />
          )}
          {manipulation === "slider" && (
            <ColorSlider onChange={onChange} colors={colors} array={array} />
          )}
        </div>
      </div>
    );
  }
}

export default ColorManipulation;

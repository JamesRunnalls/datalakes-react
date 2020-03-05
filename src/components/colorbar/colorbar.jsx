import React, { Component } from "react";
import "./colorbar.css";

class ColorBar extends Component {
    render() {
      var {
        setMin,
        setMax,
        min,
        max,
        minColor,
        maxColor,
        setMinColor,
        setMaxColor,
        unit
      } = this.props;
      const barStyle = {
        background: `linear-gradient(90deg,${minColor} 0%,${maxColor} 100%)`
      };
      return (
        <div id="colorbar">
          <div className="colorbar-inner">
            <input
              title="Edit minimum"
              type="text"
              defaultValue={min}
              onBlur={setMin}
            ></input>{" "}
            {unit}
            <div id="bar" style={barStyle} title="Legend colorbar">
              <input
                type="color"
                defaultValue={minColor}
                onFocus={setMinColor}
                className="color-picker"
                title="Edit minimum color"
              />
              <input
                type="color"
                defaultValue={maxColor}
                onFocus={setMaxColor}
                className="color-picker right"
                title="Edit maximum color"
              />
            </div>
            <input
              title="Edit maximum"
              type="text"
              defaultValue={max}
              onBlur={setMax}
            ></input>{" "}
            {unit}
          </div>
        </div>
      );
    }
  }

export default ColorBar
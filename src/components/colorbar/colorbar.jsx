import React, { Component } from "react";
import "./colorbar.css";
import ColorRamp from "../colorramp/colorramp";

class ColorBar extends Component {
  render() {
    var { min, max, unit, text, colors, onChange } = this.props;
    return (
      <div id="colorbar">
        {text && (
          <div>
            <table className="color-table" id="color-table">
              <tbody>
                <tr>
                  <td>Value:</td>
                  <td id="hoverValue"></td>
                  <td style={{ paddingLeft: "10px" }}>Lat:</td>
                  <td id="hoverLat"></td>
                  <td style={{ paddingLeft: "10px" }}>Lon:</td>
                  <td id="hoverLon"></td>
                </tr>
              </tbody>
            </table>
            <div className="colorbar-text">{`${text} (${unit})`}</div>
            <div className="colorbar-inner">
              <div className="colorbar-value" title="Minimum value">
                {min}
              </div>
              <div className="colorbar-ramp">
                <ColorRamp colors={colors} onChange={onChange} />
              </div>
              <div className="colorbar-value" title="Maximum value">
                {max}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ColorBar;

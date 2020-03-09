import React, { Component } from "react";
import "./colorbar.css";

class ColorBar extends Component {
  linearGradient = colors => {
    if (colors) {
      var lineargradient = [];
      for (var i = 0; i < colors.length; i++) {
        lineargradient.push(`${colors[i].color} ${colors[i].point * 100}%`);
      }
      return `linear-gradient(90deg,${lineargradient.join(",")})`;
    }
  };
  render() {
    var { min, max, unit, text, colors } = this.props;
    const barStyle = {
      background: this.linearGradient(colors)
    };
    return (
      <div id="colorbar">
        {text && (
          <div>
            <div className="colorbar-text">{`${text} (${unit})`}</div>
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
            <div className="colorbar-inner">
              <div className="colorbar-value" title="Minimum value">
                {min}
              </div>
              <div id="bar" style={barStyle} title="Legend colorbar"></div>
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

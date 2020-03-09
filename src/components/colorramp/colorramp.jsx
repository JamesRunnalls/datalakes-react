import React, { Component } from "react";
import "./colorramp.css";

class ColorRamp extends Component {
  state = {
    gradients: [
      {
        name: "Rainbow",
        data: [
          { color: "#000080", point: 0 },
          { color: "#3366FF", point: 0.142857142857143 },
          { color: "#00B0DC", point: 0.285714285714286 },
          { color: "#009933", point: 0.428571428571429 },
          { color: "#FFFF5B", point: 0.571428571428571 },
          { color: "#E63300", point: 0.714285714285714 },
          { color: "#CC0000", point: 0.857142857142857 },
          { color: "#800000", point: 1 }
        ]
      },
      {
        name: "Blue Red",
        data: [
          { color: "#ff0000", point: 0 },
          { color: "#0000ff", point: 1 }
        ]
      }
    ]
  };
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
    var { gradients } = this.state;
    return (
      <div>
        <select className="colorramp-selct">
          {gradients.map((gradient, index) => {
            var style = {
              background: this.linearGradient(gradient.data)
            };
            return <option className="colorramp-option" key={gradient.name} style={style}></option>;
          })}
        </select>
      </div>
    );
  }
}

export default ColorRamp;

import React, { Component } from "react";
import "./legend.css";

class MarkerLegendItem extends Component {
  render() {
    var { min, max, unit, colors, markerFixedSize, markerSymbol } = this.props;
    var minSize = 10,
      maxSize = 40,
      inner = [],
      color,
      fontSize,
      symbolDiv;

    if (markerSymbol === "circle") symbolDiv = <div>&#9679;</div>;
    if (markerSymbol === "square") symbolDiv = <div>&#9724;</div>;
    if (markerSymbol === "triangle") symbolDiv = <div>&#9650;</div>;
    if (markerSymbol === "arrow") symbolDiv = <div className="arrow"></div>;

    var fixedColor = false;
    if (colors.length === 2 && colors[0].color === colors[1].color) {
      fixedColor = true;
    }

    if (markerFixedSize && fixedColor) {
      inner.push(
        <tr>
          <td className="markerdisplay-symbol">
            <div
              className={markerSymbol}
              style={{
                height: minSize,
                width: minSize,
                backgroundColor: colors[0].color,
                margin: "auto"
              }}
            ></div>
          </td>
          <td>Fixed size and color</td>
        </tr>
      );
    } else {
      for (var i = 0; i < colors.length; i++) {
        var value =
          Math.round((min + (max - min) * colors[i].point) * 100) / 100;
        if (markerFixedSize) {
          fontSize = minSize
        } else {
          fontSize = minSize + (maxSize - minSize) * (i / colors.length);
        }
        if (fixedColor) {
          color = colors[0].color;
        } else {
          // Check possibility of color bars
          if (i < colors.length - 1) {
            var color1 = colors[i].color;
            var color2 = colors[i + 1].color;
            if (color1 === color2) {
              value =
                value +
                " - " +
                Math.round((min + (max - min) * colors[i + 1].point) * 100) /
                  100;
              i++;
            }
          }
          color = colors[i].color;
        }
        // Check possibility of tiny change
        if (i === 0) {
          if (colors[1].point < 0.0001) {
            continue;
          }
        }
        if (i === colors.length - 1) {
          if (1 - colors[colors.length - 2].point < 0.0001) {
            continue;
          }
        }
        inner.push(
          <tr key={i}>
            <td className="markerdisplay-symbol">
              <div
                className={markerSymbol}
                style={{
                  height: fontSize,
                  width: fontSize,
                  backgroundColor: color,
                  margin: "auto"
                }}
              ></div>
            </td>
            <td>{value}</td>
            <td>{i === 0 && unit}</td>
          </tr>
        );
      }
    }
    return (
      <table>
        <tbody>{inner}</tbody>
      </table>
    );
  }
}

export default MarkerLegendItem;

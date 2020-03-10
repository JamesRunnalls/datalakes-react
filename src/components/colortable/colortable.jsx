import React, { Component } from "react";
import "./colortable.css";

class ColorTable extends Component {
  state = {
    colors: this.props.colors
  };

  deleteRow = row => {
    var { colors } = this.state;
    colors.splice(row, 1);
    this.setState({ colors });
  };

  addRow = () => {
    var { colors } = this.state;
    colors.push({ color: "#000000", point: 1 });
    this.setState({ colors });
  };

  updateColors = row => {
    var { colors } = this.state;
    colors[row].color = event.target.value;
    this.setState({ colors });
  };

  updatePoint = (row, min, max) => {
    var { colors } = this.state;
    colors[row].point = (event.target.value - min) / (max - min);
    this.setState({ colors });
  };

  optimisePoints = () => {
    if ("array" in this.props) {
      var { colors } = this.state;
      var { array, onChange } = this.props;
      var min = Math.min(...array);
      var max = Math.max(...array);
      var q, val, point;
      for (var i = 0; i < colors.length; i++) {
        if (i === 0) colors[i].point = 0;
        else if (i === colors.length - 1) colors[i].point = 1;
        else {
          q = (1 / (colors.length - 1)) * i;
          val = this.quantile(array, q);
          point = (val - min) / (max - min);
          colors[i].point = point;
        }
      }
      this.setState({ colors }, () => {
        document.getElementById("colortable").reset();
        onChange(colors)
      });
    }
  };

  quantile = (arr, q) => {
    const sorted = arr.slice(0).sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.colors !== this.props.colors) {
      this.setState({ colors: this.props.colors });
    }
  }

  render() {
    var { onChange, array } = this.props;
    var { colors } = this.state;

    var min = Math.min(...array);
    var max = Math.max(...array);

   

    return (
      <form id="colortable" className="colortable">
        <table>
          <tbody>
            {colors.map((color, index) => {
              var value = min + color.point * (max - min);
              return (
                <tr key={index}>
                  <td style={{ width: "45%" }}>
                    <input
                      type="color"
                      value={color.color}
                      onChange={() => this.updateColors(index)}
                    ></input>
                  </td>
                  <td style={{ width: "45%" }}>
                    {index === 0 || index === colors.length - 1 ? (
                      <div>{value}</div>
                    ) : (
                      <input
                        type="text"
                        defaultValue={value}
                        onChange={() => this.updatePoint(index, min, max)}
                      ></input>
                    )}
                  </td>
                  <td style={{ width: "10%" }}>
                    {index === colors.length - 1 ? (
                      <div
                        className="colortable-deleterow"
                        title="Add extra color"
                        onClick={this.addRow}
                      >
                        +
                      </div>
                    ) : (
                      <div
                        className="colortable-deleterow"
                        title="Delete color"
                        onClick={() => this.deleteRow(index)}
                      >
                        -
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td>
                <button
                  type="button"
                  title="Update plot color scheme"
                  onClick={() => onChange(colors)}
                >
                  Update Plot
                </button>
              </td>
              <td>
                <button
                  type="button"
                  title="Optimise point distribution"
                  onClick={this.optimisePoints}
                >
                  Optimise Points
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    );
  }
}

export default ColorTable;

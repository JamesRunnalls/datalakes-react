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

  componentDidUpdate(prevProps) {
    if (prevProps.min !== this.props.min || prevProps.max !== this.props.max) {
      document.getElementById("colortable").reset();
    }
  }

  render() {
    var { updateParentColors, min, max } = this.props;
    var { colors } = this.state;

    if (min === undefined) min = 0;
    if (max === undefined) max = 1;

    return (
      <form id="colortable" className="colortable">
        <table>
          <tbody>
            {colors.map((color, index) => {
              var value = min + color.point * (max - min);
              var ends = index === 0 || index === colors.length - 1;
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
          </tbody>
        </table>
        <button
          type="button"
          title="Update plot color scheme"
          onClick={() => updateParentColors(colors)}
        >
          Update Plot
        </button>
      </form>
    );
  }
}

export default ColorTable;

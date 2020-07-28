import React, { Component } from "react";
import ColorManipulation from "../colormanipulation/colormanipulation";
import "./maplayers.css";

class EditSettings extends Component {
  state = {
    display: JSON.parse(
      JSON.stringify(this.props.display ? this.props.display : [])
    ),
  };
  localColorChange = (colors) => {
    var { display } = this.state;
    display.colors = colors;
    this.setState({ display });
  };
  localMarkerLabelChange = () => {
    var { display } = this.state;
    display.markerLabel = !display.markerLabel;
    this.setState({ display });
  };
  localLegendChange = () => {
    var { display } = this.state;
    display.legend = !display.legend;
    this.setState({ display });
  };
  localMovingAverageChange = (event) => {
    var { display } = this.state;
    display.movingAverage = event.target.value;
    this.setState({ display });
  }
  localMarkerSymbolChange = (event) => {
    var { display } = this.state;
    display.markerSymbol = event.target.value;
    this.setState({ display });
  };
  localMarkerFixedSizeChange = (event) => {
    var { display } = this.state;
    var markerFixedSize = false;
    if (event.target.value === "true") markerFixedSize = true;
    display.markerFixedSize = markerFixedSize;
    this.setState({ display });
  };
  localMarkerSizeChange = (event) => {
    var { display } = this.state;
    display.markerSize = event.target.value;
    this.setState({ display });
  };
  localVectorArrowColorChange = (event) => {
    var { display } = this.state;
    var vectorArrowColor = false;
    if (event.target.value === "true") vectorArrowColor = true;
    display.vectorArrowColor = vectorArrowColor;
    this.setState({ display });
  };
  localVectorFlowColorChange = (event) => {
    var { display } = this.state;
    var vectorFlowColor = false;
    if (event.target.value === "true") vectorFlowColor = true;
    display.vectorFlowColor = vectorFlowColor;
    this.setState({ display });
  };
  localVectorArrowsChange = () => {
    var { display } = this.state;
    display.vectorArrows = !display.vectorArrows;
    this.setState({ display });
  };
  localVectorFlowChange = () => {
    var { display } = this.state;
    display.vectorFlow = !display.vectorFlow;
    this.setState({ display });
  };
  localVectorMagnitudeChange = () => {
    var { display } = this.state;
    display.vectorMagnitude = !display.vectorMagnitude;
    this.setState({ display });
  };
  updateDisplay = () => {
    var { onUpdate, displayGroup } = this.props;
    var { display } = this.state;
    var index = displayGroup.findIndex((x) => x.id === display.id);
    displayGroup[index] = display;
    onUpdate(displayGroup);
  };
  render() {
    var { display } = this.state;
    var {
      movingAverage,
      colors,
      markerLabel,
      legend,
      markerSymbol,
      markerFixedSize,
      markerSize,
      mapplot,
      vectorMagnitude,
      vectorArrows,
      vectorFlow,
      vectorArrowColor,
      vectorFlowColor,
    } = display;
    var { removeSelected, id, display: displayProps } = this.props;
    var { array } = displayProps;
    return (
      <div className="editsettings">
        {["marker", "group"].includes(mapplot) && (
          <div className="editsettings-markeroptions">
            <div className="editsettings-title">Marker Options</div>
            <table className="editsettings-table">
              <tbody>
                <tr>
                  <td>Symbol</td>
                  <td>
                    <select
                      value={markerSymbol}
                      onChange={this.localMarkerSymbolChange}
                    >
                      <option value="circle">&#9679; Circle</option>
                      <option value="square">&#9632; Square</option>
                      <option value="triangle">&#9650; Triangle</option>
                      <option value="arrow">Arrow</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Size</td>
                  <td>
                    <select
                      value={markerFixedSize}
                      onChange={this.localMarkerFixedSizeChange}
                    >
                      <option value="true">Fixed</option>
                      <option value="false">By Value</option>
                    </select>
                  </td>
                  <td>
                    {markerFixedSize && (
                      <input
                        type="text"
                        value={markerSize}
                        onChange={this.localMarkerSizeChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Show Labels</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={markerLabel}
                      onChange={this.localMarkerLabelChange}
                    ></input>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {["field", "group"].includes(mapplot) && (
          <div className="editsettings-fieldoptions">
            <div className="editsettings-title">Field Options</div>
            <table>
              <tbody>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      checked={vectorMagnitude}
                      onChange={this.localVectorMagnitudeChange}
                    ></input>
                  </td>
                  <td>Magnitude Raster</td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      checked={vectorArrows}
                      onChange={this.localVectorArrowsChange}
                    ></input>
                  </td>
                  <td>Directional Arrows</td>
                  <td>
                    <select
                      value={vectorArrowColor}
                      onChange={this.localVectorArrowColorChange}
                    >
                      <option value="true">Color Ramp</option>
                      <option value="false">Fixed Color</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="checkbox"
                      checked={vectorFlow}
                      onChange={this.localVectorFlowChange}
                    ></input>
                  </td>
                  <td>Flow Path</td>
                  <td>
                    <select
                      value={vectorFlowColor}
                      onChange={this.localVectorFlowColorChange}
                    >
                      <option value="true">Color Ramp</option>
                      <option value="false">Fixed Color</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {movingAverage && (
          <div>
            <table>
              <tbody>
                <tr>
                  <td>Moving Averge:</td>
                  <td>
                    <select value={movingAverage} onChange={this.localMovingAverageChange}>
                      <option value="none">None</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="editsettings-title">Color Options</div>
        <ColorManipulation
          colors={colors}
          array={array}
          onChange={this.localColorChange}
        />
        Show in Legend{" "}
        <input
          type="checkbox"
          checked={legend}
          onChange={this.localLegendChange}
        ></input>
        <div className="editsettings-button">
          <button
            type="button"
            title="Update mapplot settings"
            onClick={this.updateDisplay}
          >
            Update Plot
          </button>
          {removeSelected && (
            <button
              type="button"
              title="Delete layer"
              onClick={() => removeSelected(id)}
            >
              Delete Layer
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default EditSettings;

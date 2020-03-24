import React, { Component } from "react";
import "./maplayers.css";
import { SortableContainer, SortableElement, arrayMove } from "react-sortable-hoc";
import ColorManipulation from "../colormanipulation/colormanipulation";
import RasterLegendItem from '../legend/rasterlegenditem';
import MarkerLegendItem from '../legend/markerlegenditem';

class DropDown extends Component {
  state = {
    open: this.props.defaultOpen,
    settings: false
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  toggleSettings = () => {
    this.setState({ settings: !this.state.settings });
  };
  render() {
    var { open, settings } = this.state;
    var {
      name,
      content,
      allowSettings,
      display,
      removeSelected,
      id,
      hidden,
      onUpdate,
      displayGroup,
      toggleLayerView
    } = this.props;
    return (
      <div className="maplayers-dropdown">
        <table className="maplayers-dropdown-table">
          <tbody>
            <tr className="maplayers-dropdown-title">
              <td
                className="maplayers-symbol"
                onClick={this.toggleOpen}
                style={{ width: "10px" }}
              >
                {open ? "▿" : "▹"}
              </td>
              <td style={{ width: "10px" }}>
                {" "}
                <input
                  className="maplayers-checkbox"
                  type="checkbox"
                  onChange={() => toggleLayerView(id)}
                  checked={!hidden.includes(id)}
                />
              </td>
              <td style={{ width: "100%" }} onClick={this.toggleOpen}>
                {name}
              </td>
              {allowSettings && (
                <td
                  onClick={this.toggleSettings}
                  style={{ width: "10px" }}
                  className="maplayers-settings"
                >
                  &#9881;
                </td>
              )}
            </tr>
          </tbody>
        </table>
        <div
          className={
            settings
              ? "maplayers-dropdown-content"
              : "maplayers-dropdown-content hide"
          }
        >
          <EditSettings
            display={display}
            removeSelected={removeSelected}
            id={id}
            onUpdate={onUpdate}
            displayGroup={displayGroup}
          />
        </div>
        <div
          className={
            open
              ? "maplayers-dropdown-content"
              : "maplayers-dropdown-content hide"
          }
        >
          {content}
        </div>
      </div>
    );
  }
}

class GroupDisplay extends Component {
  state = {};
  render() {
    var { display } = this.props;
    var {
      plot,
      min,
      max,
      unit,
      sourcelink,
      sourcetext,
      description,
      colors,
      markerFixedSize,
      markerSymbol
    } = display;
    var inner = <div></div>;
    if (plot === "marker")
      inner = (
        <MarkerLegendItem
          min={min}
          max={max}
          unit={unit}
          colors={colors}
          markerFixedSize={markerFixedSize}
          markerSymbol={markerSymbol}
        />
      );
    if (plot === "raster")
      inner = <RasterLegendItem min={min} max={max} unit={unit} colors={colors} />;
    if (plot === "field")
      inner = <RasterLegendItem min={min} max={max} unit={unit} colors={colors} />;
    return (
      <div>
        <div>{description}</div>
        {inner}
        Source:{" "}
        <a href={sourcelink} target="_blank">
          {sourcetext}
        </a>
      </div>
    );
  }
}

class EditSettings extends Component {
  state = {
    display: JSON.parse(
      JSON.stringify(this.props.display ? this.props.display : [])
    )
  };
  localColorChange = colors => {
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
  localMarkerSymbolChange = () => {
    var { display } = this.state;
    display.markerSymbol = event.target.value;
    this.setState({ display });
  };
  localMarkerFixedSizeChange = () => {
    var { display } = this.state;
    var markerFixedSize = false;
    if (event.target.value === "true") markerFixedSize = true;
    display.markerFixedSize = markerFixedSize;
    this.setState({ display });
  };
  localMarkerSizeChange = () => {
    var { display } = this.state;
    display.markerSize = event.target.value;
    this.setState({ display });
  };
  localVectorArrowColorChange = () => {
    var { display } = this.state;
    var vectorArrowColor = false;
    if (event.target.value === "true") vectorArrowColor = true;
    display.vectorArrowColor = vectorArrowColor;
    this.setState({ display });
  };
  localVectorFlowColorChange = () => {
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
    var index = displayGroup.findIndex(x => x.id === display.id);
    displayGroup[index] = display;
    onUpdate(displayGroup);
  };
  render() {
    var { display } = this.state;
    var {
      colors,
      markerLabel,
      legend,
      markerSymbol,
      markerFixedSize,
      markerSize,
      array,
      plot,
      vectorMagnitude,
      vectorArrows,
      vectorFlow,
      vectorArrowColor,
      vectorFlowColor
    } = display;
    var { removeSelected, id } = this.props;
    return (
      <div className="editsettings">
        {["marker", "group"].includes(plot) && (
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
        {["field", "group"].includes(plot) && (
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
                      disabled
                    ></input>
                  </td>
                  <td>Directional Arrows</td>
                  <td>
                    <select
                      value={vectorArrowColor}
                      onChange={this.localVectorArrowColorChange}
                      disabled
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
                      disabled
                    ></input>
                  </td>
                  <td>Flow Path</td>
                  <td>
                    <select
                      value={vectorFlowColor}
                      onChange={this.localVectorFlowColorChange}
                      disabled
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
            title="Update plot settings"
            onClick={this.updateDisplay}
          >
            Update Plot
          </button>
          <button
            type="button"
            title="Delete layer"
            onClick={() => removeSelected([id])}
          >
            Delete Layer
          </button>
        </div>
      </div>
    );
  }
}

const SortableItem = SortableElement(({ layer, props }) => {
  var { id, name } = layer;
  var {
    maplayers,
    removeSelected,
    hidden,
    updateMapLayers,
    toggleLayerView
  } = props;
  return (
    <li tabIndex={0}>
      <DropDown
        key={id}
        name={name}
        allowSettings={true}
        display={layer}
        displayGroup={maplayers}
        removeSelected={removeSelected}
        id={id}
        hidden={hidden}
        onUpdate={updateMapLayers}
        toggleLayerView={toggleLayerView}
        content={<GroupDisplay key={id} display={layer} />}
      />
    </li>
  );
});

const SortableList = SortableContainer(({ props }) => {
  var { maplayers, selected } = props;
  if (maplayers.length < 1) selected = [];
    var selectlayers = selected.map(id =>
      maplayers.find(layer => layer.id === id)
    );
  return (
    <ul className="maplayers-list">
      {selectlayers.map((layer, index) => (
        <SortableItem
          key={`item-${index}`}
          index={index}
          layer={layer}
          props={props}
        />
      ))}
    </ul>
  );
});

class MapLayers extends Component {
  onSortEnd = ({ oldIndex, newIndex }) => {
    var { selected, setSelected } = this.props;
    selected = arrayMove(selected, oldIndex, newIndex);
    setSelected(selected);
  };
  render() {
    return (
      <SortableList
        props={this.props}
        onSortEnd={this.onSortEnd}
        distance={1}
      />
    );
  }
}

export default MapLayers;

import React, { Component } from "react";
import "./maplayers.css";
import FilterBox from "../filterbox/filterbox";
import ColorManipulation from "../colormanipulation/colormanipulation";

class Contents extends Component {
  state = {};
  render() {
    var {
      maplayers,
      parameters,
      selected,
      updateMapLayers,
      updateParameters,
      removeSelected
    } = this.props;
    var selectlayers = maplayers.filter(layer => selected.includes(layer.id));
    var selectlayersparameterid = selectlayers.map(layer => layer.parameter_id);
    var visibleparameters = parameters.filter(param =>
      selectlayersparameterid.includes(param.id)
    );
    var selectparameters = visibleparameters.map(x => {
      x.layers = selectlayers.filter(layer => layer.parameter_id === x.id);
      return x;
    });
    return (
      <div className="maplayers-contents">
        {selectparameters.map(parameter => {
          var layers1 = parameter.layers.filter(
            layer => layer.type === "measurement"
          );
          var layers2 = parameter.layers.filter(
            layer => layer.type === "satellite"
          );
          var layers3 = parameter.layers.filter(
            layer => layer.type === "model"
          );
          return (
            <DropDown
              name={parameter.name}
              key={parameter.id}
              marker={true}
              defaultOpen={true}
              allowSettings={true}
              display={parameter}
              displayGroup={parameters}
              removeSelected={removeSelected}
              ids={parameter.layers.map(layer => layer.id)}
              onUpdate={updateParameters}
              content={
                <React.Fragment>
                  {layers1.length > 0 && (
                    <DropDown
                      name={"Measurement Value"}
                      defaultOpen={true}
                      allowSettings={false}
                      display={parameter}
                      displayGroup={parameters}
                      removeSelected={removeSelected}
                      ids={[]}
                      content={
                        <React.Fragment>
                          {layers1.map(layer => (
                            <DropDown
                              name={layer.name}
                              allowSettings={true}
                              key={layer.id}
                              display={layer}
                              displayGroup={maplayers}
                              marker={true}
                              removeSelected={removeSelected}
                              ids={[layer.id]}
                              onUpdate={updateMapLayers}
                              content={
                                <MarkerDisplay
                                  key={layer.id}
                                  min={parameter.min}
                                  max={parameter.max}
                                  unit={parameter.unit}
                                  display={layer}
                                />
                              }
                            />
                          ))}
                        </React.Fragment>
                      }
                    />
                  )}
                  {layers2.length > 0 && (
                    <DropDown
                      name={"Satellite Data"}
                      defaultOpen={true}
                      allowSettings={false}
                      display={parameter}
                      displayGroup={parameters}
                      removeSelected={removeSelected}
                      ids={[]}
                      content={
                        <React.Fragment>
                          {layers2.map(layer => (
                            <DropDown
                              key={layer.id}
                              display={layer}
                              displayGroup={maplayers}
                              name={layer.name}
                              defaultOpen={false}
                              allowSettings={true}
                              removeSelected={removeSelected}
                              ids={[layer.id]}
                              onUpdate={updateMapLayers}
                              content={
                                <RasterDisplay
                                  key={layer.id}
                                  min={parameter.min}
                                  max={parameter.max}
                                  unit={parameter.unit}
                                  display={layer}
                                />
                              }
                            />
                          ))}
                        </React.Fragment>
                      }
                    />
                  )}
                  {layers3.length > 0 && (
                    <DropDown
                      name={"Lake Simulations"}
                      defaultOpen={true}
                      allowSettings={false}
                      display={parameter}
                      displayGroup={parameters}
                      removeSelected={removeSelected}
                      ids={[]}
                      content={
                        <React.Fragment>
                          {layers3.map(layer => (
                            <DropDown
                              key={layer.id}
                              display={layer}
                              displayGroup={maplayers}
                              name={layer.name}
                              defaultOpen={false}
                              allowSettings={true}
                              removeSelected={removeSelected}
                              ids={[layer.id]}
                              onUpdate={updateMapLayers}
                              content={
                                <RasterDisplay
                                  key={layer.id}
                                  min={parameter.min}
                                  max={parameter.max}
                                  unit={parameter.unit}
                                  display={layer}
                                />
                              }
                            />
                          ))}
                        </React.Fragment>
                      }
                    />
                  )}
                </React.Fragment>
              }
            />
          );
        })}
      </div>
    );
  }
}

class DropDown extends Component {
  state = {
    open: this.props.defaultOpen,
    visible: true,
    settings: false
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  toggleVisible = () => {
    this.setState({ visible: !this.state.visible });
  };
  toggleSettings = () => {
    this.setState({ settings: !this.state.settings });
  };
  render() {
    var { open, visible, settings } = this.state;
    var {
      name,
      content,
      allowSettings,
      marker,
      display,
      removeSelected,
      ids,
      onUpdate,
      displayGroup
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
                {open ? "◢" : "▹"}
              </td>
              <td style={{ width: "10px" }}>
                {" "}
                <input
                  className="maplayers-checkbox"
                  type="checkbox"
                  onChange={this.toggleVisible}
                  checked={visible}
                />
              </td>
              <td style={{ width: "100%" }}>{name}</td>
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
            marker={marker}
            display={display}
            removeSelected={removeSelected}
            ids={ids}
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

class MarkerDisplay extends Component {
  render() {
    var { min, max, unit, display } = this.props;
    var {
      colors,
      markerFixedSize,
      markerSymbol,
      description,
      sourcetext,
      sourcelink
    } = display;
    var minSize = 10,
      maxSize = 40,
      inner = [],
      color,
      fontSize,
      symbolDiv;

    if (markerSymbol === "circle") symbolDiv = <div>&#9679;</div>;
    if (markerSymbol === "square") symbolDiv = <div>&#9724;</div>;
    if (markerSymbol === "triangle") symbolDiv = <div>&#9650;</div>;

    var fixedColor = false;
    if (colors.length === 2 && colors[0].color === colors[1].color) {
      fixedColor = true;
    }

    if (markerFixedSize && fixedColor) {
      inner.push(
        <tr>
          <td
            className="markerdisplay-symbol"
            style={{ fontSize: maxSize, color: colors[0].color }}
          >
            {symbolDiv}
          </td>
          <td>Fixed size and color</td>
        </tr>
      );
    } else {
      for (var i = 0; i < colors.length; i++) {
        var value =
          Math.round((min + (max - min) * colors[i].point) * 100) / 100;
        if (markerFixedSize) {
          fontSize = (maxSize + minSize) / 2;
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
            <td
              className="markerdisplay-symbol"
              style={{ fontSize: fontSize, color: color }}
            >
              {symbolDiv}
            </td>
            <td>{value}</td>
            <td>{i === 0 && unit}</td>
          </tr>
        );
      }
    }
    return (
      <div>
        <div>{description}</div>
        <table>
          <tbody>{inner}</tbody>
        </table>
        Source:{" "}
        <a href={sourcelink} target="_blank">
          {sourcetext}
        </a>
      </div>
    );
  }
}

class RasterDisplay extends Component {
  linearGradient = colors => {
    if (colors) {
      var lineargradient = [];
      for (var i = 0; i < colors.length; i++) {
        lineargradient.push(`${colors[i].color} ${colors[i].point * 100}%`);
      }
      return `linear-gradient(180deg,${lineargradient.join(",")})`;
    }
  };
  render() {
    var { min, max, unit, display } = this.props;
    var { colors, description, sourcelink, sourcetext } = display;
    var inner = [];
    var fixedColor = false;
    if (colors.length === 2 && colors[0].color === colors[1].color) {
      fixedColor = true;
    }
    if (fixedColor) {
      var selectStyle = {
        background: colors[0].color
      };
      inner.push(
        <tr key={0}>
          <td className="rasterdisplay-colorbar" style={selectStyle}></td>
          <td>Fixed color</td>
        </tr>
      );
    } else {
      var selectStyle = {
        background: this.linearGradient(colors),
        border: "1px solid black",
        borderTop: "22px solid white",
        borderBottom: "22px solid white"
      };
      inner.push(
        <tr key={0}>
          <td
            className="rasterdisplay-colorbar"
            style={selectStyle}
            rowSpan={6}
          ></td>
          <td className="rasterdisplay-bar">&#9472;</td>
          <td>{min}</td>
          <td>{unit}</td>
        </tr>
      );
      inner.push(
        <tr
          key={1}
          style={{
            height: "60px"
          }}
        >
          <td className="rasterdisplay-bar">&#9472;</td>
          <td className="rasterdisplay-innerlabel">{(max + min) / 2}</td>
        </tr>
      );
      inner.push(
        <tr key={2}>
          <td className="rasterdisplay-bar">&#9472;</td>
          <td>{max}</td>
        </tr>
      );
    }
    return (
      <div>
        <div>{description}</div>
        <table className="rasterdisplay-table">
          <tbody>{inner}</tbody>
        </table>
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
    ),
    colors: JSON.parse(
      JSON.stringify(this.props.display.colors ? this.props.display.colors : [])
    ),
    markerLabel: this.props.display.markerLabel,
    legend: this.props.display.legend,
    markerSymbol: this.props.display.markerSymbol,
    markerFixedSize: this.props.display.markerFixedSize,
    markerSize: this.props.display.markerSize
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
      markerSize
    } = display;
    var { marker, removeSelected, ids } = this.props;
    return (
      <div className="editsettings">
        {marker && (
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
        <div className="editsettings-title">Color Options</div>
        <ColorManipulation colors={colors} onChange={this.localColorChange} />
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
            onClick={() => removeSelected(ids)}
          >
            {ids.length > 1 ? "Delete Layer Group" : "Delete Layer"}
          </button>
        </div>
      </div>
    );
  }
}

class AddLayers extends Component {
  render() {
    var { maplayers, parameters, addSelected, type } = this.props;
    var cmaplayers = JSON.parse(JSON.stringify(maplayers));
    var cparameters = JSON.parse(JSON.stringify(parameters));
    var mlayers = cmaplayers.filter(layer => layer.type === type);
    var layers = mlayers.map(layer => layer.parameter_id);
    layers = [...new Set(layers)];
    var availableparameters = cparameters.filter(p => layers.includes(p.id));
    availableparameters = availableparameters.map(x => {
      x.layerids = mlayers.filter(y => y.parameter_id === x.id).map(z => z.id);
      return x;
    });
    return (
      <div className="maplayers-box">
        {availableparameters.map(layer => (
          <div
            key={layer.id}
            className="maplayers-layer"
            onClick={() => addSelected(layer.layerids)}
            title={layer.layerids}
          >
            {layer.name}
          </div>
        ))}
      </div>
    );
  }
}

class MapLayers extends Component {
  state = {};
  render() {
    var {
      maplayers,
      selected,
      parameters,
      updateMapLayers,
      updateParameters,
      addSelected,
      removeSelected
    } = this.props;
    return (
      <div>
        <Contents
          maplayers={maplayers}
          parameters={parameters}
          selected={selected}
          removeSelected={removeSelected}
          updateMapLayers={updateMapLayers}
          updateParameters={updateParameters}
        />
        <FilterBox
          title="Add Layers"
          inner="true"
          content={
            <React.Fragment>
              <FilterBox
                title="Measured Values"
                inner="true"
                content={
                  <AddLayers
                    maplayers={maplayers}
                    parameters={parameters}
                    addSelected={addSelected}
                    type="measurement"
                  />
                }
              />
              <FilterBox
                title="Satellite Data"
                inner="true"
                content={
                  <AddLayers
                    maplayers={maplayers}
                    parameters={parameters}
                    addSelected={addSelected}
                    type="satellite"
                  />
                }
              />
              <FilterBox
                title="Lake Simulations"
                inner="true"
                content={
                  <AddLayers
                    maplayers={maplayers}
                    parameters={parameters}
                    addSelected={addSelected}
                    type="model"
                  />
                }
              />
            </React.Fragment>
          }
        />
      </div>
    );
  }
}

export default MapLayers;

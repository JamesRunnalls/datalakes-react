import React, { Component } from "react";
import "./maplayers.css";
import FilterBox from "../filterbox/filterbox";
import { getColor } from "../../components/gradients/gradients";

class Contents extends Component {
  state = {};
  render() {
    var {
      maplayers,
      parameters,
      selected,
      addSelected,
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
              defaultOpen={true}
              allowSettings={true}
              content={
                <React.Fragment>
                  {layers1.length > 0 && (
                    <DropDown
                      name={"Measurement Value"}
                      defaultOpen={true}
                      allowSettings={false}
                      content={
                        <React.Fragment>
                          {layers1.map(layer => (
                            <DropDown
                              name={layer.name}
                              allowSettings={true}
                              key={layer.id}
                              content={
                                <MarkerDisplay
                                  key={layer.id}
                                  fixedSize={layer.fixedSize}
                                  fixedColor={layer.fixedColor}
                                  min={parameter.min}
                                  max={parameter.max}
                                  symbol={layer.symbol}
                                  unit={parameter.unit}
                                  colors={layer.colors}
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
                      content={
                        <React.Fragment>
                          {layers2.map(layer => (
                            <DropDown
                              key={layer.id}
                              name={layer.name}
                              defaultOpen={false}
                              allowSettings={true}
                              content={
                                <RasterDisplay
                                  key={layer.id}
                                  fixedColor={layer.fixedColor}
                                  min={parameter.min}
                                  max={parameter.max}
                                  unit={parameter.unit}
                                  colors={layer.colors}
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
                      content={
                        <React.Fragment>
                          {layers3.map(layer => (
                            <DropDown
                              key={layer.id}
                              name={layer.name}
                              defaultOpen={false}
                              allowSettings={true}
                              content={
                                <RasterDisplay
                                  key={layer.id}
                                  fixedColor={layer.fixedColor}
                                  min={parameter.min}
                                  max={parameter.max}
                                  unit={parameter.unit}
                                  colors={layer.colors}
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
    var { name, content, allowSettings } = this.props;
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
                <td onClick={this.toggleSettings} style={{ width: "10px" }} className="maplayers-settings">
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
          <EditSettings />
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
    var { fixedSize, fixedColor, min, max, colors, symbol, unit } = this.props;
    var values = 5,
      minSize = 10,
      maxSize = 40,
      inner = [],
      color,
      fontSize,
      symbolDiv;

    if (symbol === "circle") symbolDiv = <div>&#9679;</div>;
    if (symbol === "square") symbolDiv = <div>&#9724;</div>;
    if (symbol === "triangle") symbolDiv = <div>&#9650;</div>;

    if (fixedSize && fixedColor) {
      inner.push(
        <tr>
          <td
            className="markerdisplay-symbol"
            style={{ fontSize: maxSize, color: fixedColor }}
          >
            {symbolDiv}
          </td>
        </tr>
      );
    } else {
      for (var i = 0; i < values; i++) {
        var value = max - (max - min) * (i / 4);
        if (fixedColor) {
          color = fixedColor;
        } else {
          color = getColor(value, min, max, colors);
        }
        if (fixedSize) {
          fontSize = (maxSize + minSize) / 2;
        } else {
          fontSize = maxSize - (maxSize - minSize) * (i / 4);
        }
        inner.push(
          <tr key={i}>
            <td
              className="markerdisplay-symbol"
              style={{ fontSize: fontSize, color: color }}
            >
              {symbolDiv}
            </td>
            <td>
              {value}
              {i === 0 && unit}
            </td>
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
    var { fixedColor, min, max, colors, unit } = this.props;
    var values = 5,
      inner = [],
      value;
      var selectStyle = {
        background: this.linearGradient(colors)
      };
    if (fixedColor) {
      inner.push(
        <tr>
          <td>
            <div></div>
          </td>
        </tr>
      );
    } else {
      inner.push(
        <tr key={0}>
          <td rowSpan={values} className="rasterdisplay-colorbar" style={selectStyle}></td>
          <td>{max + " " + unit}</td>
        </tr>
      );
      for (var i = 1; i < values; i++) {
        value = max - (max - min) * (i / 4);
        inner.push(
          <tr key={i}>
            <td>{value}</td>
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

class EditSettings extends Component {
  state = {};
  render() {
    return (
      <table>
        <tbody>
          <tr>
            <td>Symbol</td>
            <td>
              <select>
                <option value="circle">&#9679; Circle</option>
                <option value="square">&#9632; Square</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Size</td>
            <td>
              <select>
                <option value="circle">Fixed</option>
                <option value="square">By Parameter</option>
              </select>
            </td>
            <td>
              <input type="text"></input>px
            </td>
          </tr>
          <tr>
            <td>Color</td>
            <td>
              <select>
                <option value="circle">Fixed</option>
                <option value="square">By Parameter</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Labels</td>
            <td>
              <input type="checkbox"></input>
            </td>
          </tr>
          <tr>
            <td>Legend</td>
            <td>
              <input type="checkbox"></input>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

class ContentsVis extends Component {
  state = {};
  render() {
    return <div></div>;
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
      addSelected,
      removeSelected,
      getParameterDetails
    } = this.props;
    return (
      <div>
        <Contents
          maplayers={maplayers}
          parameters={parameters}
          selected={selected}
          addSelected={addSelected}
          removeSelected={removeSelected}
          updateMapLayers={updateMapLayers}
          getParameterDetails={getParameterDetails}
        />
        <div>Add Layers</div>
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
      </div>
    );
  }
}

export default MapLayers;

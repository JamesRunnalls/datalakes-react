import React, { Component } from "react";
import "./maplayers.css";
import FilterBox from "../filterbox/filterbox";
import { getColor } from "../../components/gradients/gradients";
import ColorManipulation from "../colormanipulation/colormanipulation";

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
              colors={parameter.colors}
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
                              colors={layer.colors}
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
                              colors={layer.colors}
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
                              colors={layer.colors}
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
    var { name, content, allowSettings, colors } = this.props;
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
          <EditSettings colors={colors} />
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
    console.log(colors);
    var minSize = 10,
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
          <td>Fixed Size and Color</td>
        </tr>
      );
    } else {
      for (var i = 0; i < colors.length; i++) {
        var value =
          Math.round((min + (max - min) * colors[i].point) * 100) / 100;
        if (fixedSize) {
          fontSize = (maxSize + minSize) / 2;
        } else {
          fontSize = minSize + (maxSize - minSize) * (i / colors.length);
        }
        if (fixedColor) {
          color = fixedColor;
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
        console.log(colors[i].color, colors[i].point * 100);
        lineargradient.push(`${colors[i].color} ${colors[i].point * 100}%`);
      }
      return `linear-gradient(180deg,${lineargradient.join(",")})`;
    }
  };
  render() {
    var { fixedColor, min, max, colors, unit } = this.props;
    var len = colors.length,
      inner = [],
      value;
    if (fixedColor) {
      var selectStyle = {
        background: fixedColor
      };
      inner.push(
        <tr>
          <td style={selectStyle}></td>
          <td>Fixed Color</td>
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
      <table className="rasterdisplay-table">
        <tbody>{inner}</tbody>
      </table>
    );
  }
}

class EditSettings extends Component {
  state = {};
  render() {
    var { colors } = this.props;
    return (
      <div>
        <div className="editsettings-markeroptions">
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
        </div>
        <ColorManipulation colors={colors} />
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

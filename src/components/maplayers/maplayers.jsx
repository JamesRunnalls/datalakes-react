import React, { Component } from "react";
import "./maplayers.css";
import FilterBox from "../filterbox/filterbox";
import ColorManipulation from "../colormanipulation/colormanipulation";

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
                {open ? "◢" : "▹"}
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
    var { display, min, max, unit } = this.props;
    if (display.plot === "marker") {
      return (
        <MarkerDisplay min={min} max={max} unit={unit} display={display} />
      );
    } else if (display.plot === "raster") {
      return (
        <RasterDisplay min={min} max={max} unit={unit} display={display} />
      );
    } else if (display.plot === "field") {
      return <FieldDisplay min={min} max={max} unit={unit} display={display} />;
    } else {
      return <div></div>;
    }
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
    var selectStyle;
    if (colors.length === 2 && colors[0].color === colors[1].color) {
      fixedColor = true;
    }
    if (fixedColor) {
      selectStyle = {
        background: colors[0].color
      };
      inner.push(
        <tr key={0}>
          <td className="rasterdisplay-colorbar" style={selectStyle}></td>
          <td>Fixed color</td>
        </tr>
      );
    } else {
      selectStyle = {
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

class FieldDisplay extends Component {
  render() {
    var { min, max, unit, display } = this.props;
    var { colors, description, sourcelink, sourcetext } = display;
    return (
      <div>
        <div>{description}</div>
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
  localFieldChange = () => {
    var { display } = this.state;
    display.field = event.target.value;
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
      field
    } = display;
    var { removeSelected, id } = this.props;
    return (
      <div className="editsettings">
        {["marker", "group"].includes(display.plot) && (
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
        {["field", "group"].includes(display.plot) && (
          <div className="editsettings-fieldoptions">
            <div className="editsettings-title">Field Options</div>
            <table>
              <tbody>
                <tr>
                  <td>Display</td>
                  <td>
                    <select value={field} onChange={this.localFieldChange}>
                      <option value="vector">Animated Vector Field</option>
                      <option value="scalar">Static Scalar Field</option>
                    </select>
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
            onClick={() => removeSelected([id])}
          >
            Delete Layer
          </button>
        </div>
      </div>
    );
  }
}

class MapLayers extends Component {
  dragStart = e => {
    this.dragged = e.currentTarget;
    e.dataTransfer.effectAllowed = "move";
    // Firefox requires calling dataTransfer.setData
    // for the drag to properly work
    e.dataTransfer.setData("text/html", e.currentTarget);
  };
  dragEnd = e => {
    this.dragged.style.display = "block";
    // Update state
    var data = this.state.data;
    var from = Number(this.dragged.dataset.id);
    var to = Number(this.over.dataset.id);
    if (from < to) to--;
    data.splice(to, 0, data.splice(from, 1)[0]);
    console.log(data);
  };
  dragOver = e => {
    e.preventDefault();
    this.dragged.style.display = "none";
  };
  render() {
    var {
      maplayers,
      parameters,
      selected,
      hidden,
      updateMapLayers,
      updateParameters,
      removeSelected,
      toggleLayerView,
    } = this.props;
    var selectlayers = maplayers.filter(layer => selected.includes(layer.id));
    selectlayers = selectlayers.map(layer => {
      var parameter = parameters.find(
        parameter => parameter.id === layer.parameters_id
      );
      layer.min = parameter.min;
      layer.max = parameter.max;
      return layer;
    });
    return (
      <div className="maplayers-contents">
        <ul className="maplayers-list" onDragOver={this.dragOver}>
          {/* Loop over layers */}
          {selectlayers.map(layer => (
            <li
              key={layer.id}
              draggable="true"
              onDragEnd={this.dragEnd}
              onDragStart={this.dragStart}
            >
              <DropDown
                key={layer.id}
                name={layer.name}
                allowSettings={true}
                display={layer}
                displayGroup={maplayers}
                removeSelected={removeSelected}
                id={layer.id}
                hidden={hidden}
                onUpdate={updateMapLayers}
                toggleLayerView={toggleLayerView}
                content={
                  <GroupDisplay
                    key={layer.id}
                    min={layer.min}
                    max={layer.max}
                    unit={layer.unit}
                    display={layer}
                  />
                }
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default MapLayers;

import React, { Component } from "react";
import "./maplayers.css";
import FilterBox from "../filterbox/filterbox";

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
        {selectparameters.map(parameter => (
          <ContentsInner parameter={parameter} />
        ))}
      </div>
    );
  }
}

class ContentsInner extends Component {
  state = {
    open: true,
    visible: true
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  toggleVisible = () => {
    this.setState({ visible: !this.state.visible });
  };
  render() {
    var { parameter } = this.props;
    var { open, visible } = this.state;
    return (
      <div className="maplayers-contents-inner1">
        <div className="contentssymbol" onClick={this.toggleOpen}>
          {open ? "◢" : "▹"}
        </div>
        <input
          className="checkbox"
          type="checkbox"
          onChange={this.toggleVisible}
          checked={visible}
        />
        {parameter.name}
        <div
          className={
            open
              ? "maplayers-contents-inner2"
              : "maplayers-contents-inner2 hide"
          }
        >
          <ContentsInnerInner
            parameter={parameter}
            name="Measurement Value"
            type="measurement"
          />
          <ContentsInnerInner
            parameter={parameter}
            name="Satellite Data"
            type="satellite"
          />
          <ContentsInnerInner
            parameter={parameter}
            name="Lake Simulations"
            type="model"
          />
          <ContentsVis />
        </div>
      </div>
    );
  }
}

class ContentsInnerInner extends Component {
  state = {
    open: true,
    visible: true
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  toggleVisible = () => {
    this.setState({ visible: !this.state.visible });
  };
  render() {
    var { parameter, name, type } = this.props;
    var { open, visible } = this.state;
    var layers = parameter.layers.filter(layer => layer.type === type);
    if (layers.length > 0) {
      return (
        <React.Fragment>
          <div className="contentssymbol" onClick={this.toggleOpen}>
            {open ? "◢" : "▹"}
          </div>
          <input
            className="checkbox"
            type="checkbox"
            onChange={this.toggleVisible}
            checked={visible}
          />
          {name}
          <div
            className={
              open
                ? "maplayers-contents-inner2"
                : "maplayers-contents-inner2 hide"
            }
          >
            {layers.map(layer => {
              if ((type = "measurement")) {
                return <ContentsMarker layer={layer} key={layer.id} />;
              } else {
                return <ContentsRaster layer={layer} key={layer.id} />;
              }
            })}
          </div>
        </React.Fragment>
      );
    } else {
      return <div></div>;
    }
  }
}

class ContentsMarker extends Component {
  state = {
    open: false,
    visible: true
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  toggleVisible = () => {
    this.setState({ visible: !this.state.visible });
  };
  render() {
    var { layer } = this.props;
    var { open, visible } = this.state;
    return (
      <div className="maplayers-contents-inner3">
        <div className="contentssymbol" onClick={this.toggleOpen}>
          {open ? "◢" : "▹"}
        </div>
        <input
          className="checkbox"
          type="checkbox"
          onChange={this.toggleVisible}
          checked={visible}
        />
        {layer.name}
        <div
          className={
            open
              ? "maplayers-contents-inner4"
              : "maplayers-contents-inner4 hide"
          }
        >
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
      </div>
    );
  }
}

class ContentsRaster extends Component {
  state = {
    open: true,
    visible: true
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  toggleVisible = () => {
    this.setState({ visible: !this.state.visible });
  };
  render() {
    var { layer } = this.props;
    var { open, visible } = this.state;
    return (
      <div className="maplayers-contents-inner3">
        <div className="contentssymbol" onClick={this.toggleOpen}>
          {open ? "◢" : "▹"}
        </div>
        <input
          className="checkbox"
          type="checkbox"
          onChange={this.toggleVisible}
          checked={visible}
        />
        {layer.name}
        <div
          className={
            open
              ? "maplayers-contents-inner4"
              : "maplayers-contents-inner4 hide"
          }
        >
          tbd
        </div>
      </div>
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

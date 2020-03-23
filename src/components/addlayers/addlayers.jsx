import React, { Component } from "react";
import "./addlayers.css";
import FilterBox from "../filterbox/filterbox";

class AddLayersInnerInner extends Component {
  state = {
    open: false
  };
  toggle = () => {
    this.setState({ open: !this.state.open });
  };
  render() {
    var { open } = this.state;
    var { layer, layers, addSelected } = this.props;
    var layers = layers.filter(lay => lay.parameters_id === layer.id);
    return (
      <div key={layer.id} className="addlayers-layer">
        <div className="addlayers-titlebar">
          <div
            className="addlayers-title"
            onClick={() => addSelected(layer.layerids)}
            title="Add layer group"
          >
            {layer.name}
          </div>
          <div
            className="addlayers-symbol"
            title="See individual layers"
            onClick={this.toggle}
          >
            {open ? "-" : "+"}
          </div>
        </div>

        {open && (
          <div className="addlayers-content">
            {layers.map(lay => {
              return (
                <div
                  onClick={() => addSelected([lay.id])}
                  className="addlayers-detail"
                  key={lay.id}
                  title="Add layer"
                >
                  {lay.name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

class AddLayersInner extends Component {
  render() {
    var { maplayers, parameters, addSelected, type } = this.props;
    var cmaplayers = JSON.parse(JSON.stringify(maplayers));
    var cparameters = JSON.parse(JSON.stringify(parameters));
    var mlayers = cmaplayers.filter(layer => layer.type === type);
    var layers = mlayers.map(layer => layer.parameters_id);
    layers = [...new Set(layers)];
    var availableparameters = cparameters.filter(p => layers.includes(p.id));
    availableparameters = availableparameters.map(x => {
      x.layerids = mlayers.filter(y => y.parameters_id === x.id).map(z => z.id);
      return x;
    });

    return (
      <div className="addlayers-box">
        {availableparameters.map(layer => (
          <AddLayersInnerInner
            layer={layer}
            key={layer.id}
            addSelected={addSelected}
            layers={mlayers}
          />
        ))}
      </div>
    );
  }
}
class AddLayers extends Component {
  state = {};
  render() {
    var { maplayers, parameters, addSelected } = this.props;
    return (
      <React.Fragment>
        <FilterBox
          title="Measured Values"
          inner="true"
          content={
            <AddLayersInner
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
            <AddLayersInner
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
            <AddLayersInner
              maplayers={maplayers}
              parameters={parameters}
              addSelected={addSelected}
              type="model"
            />
          }
        />
      </React.Fragment>
    );
  }
}

export default AddLayers;

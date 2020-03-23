import React, { Component } from "react";
import "./addlayers.css";
import FilterBox from "../filterbox/filterbox";

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

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
  render() {
    var { parameter } = this.props;
    return (
      <div className="maplayers-contentsinner">
          <div className="contentssymbol">&#9660;</div><input className="checkbox" type="checkbox" />{parameter.name}
        <ContentsMeasurement parameter={parameter}/>
        <ContentsSatellite />
        <ContentsModel />
        <ContentsVis />
      </div>
    );
  }
}
class ContentsMeasurement extends Component {
  state = {};
  render() {
    var { parameter } = this.props;
    var layers = parameter.layers.filter(layer => layer.type === "measurement")
    return <div></div>;
  }
}
class ContentsSatellite extends Component {
  state = {};
  render() {
    return <div></div>;
  }
}
class ContentsModel extends Component {
  state = {};
  render() {
    return <div></div>;
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
    var mlayers = maplayers.filter(layer => layer.type === type);
    var layers = mlayers.map(layer => layer.parameter_id);
    layers = [...new Set(layers)];
    var availableparameters = parameters.filter(p => layers.includes(p.id));
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
            title="Add layer to map"
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

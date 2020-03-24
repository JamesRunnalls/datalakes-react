import React, { Component } from "react";
//import { Link } from "react-router-dom";
import GISMap from "../../graphs/leaflet/gis_map";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import axios from "axios";
import { apiUrl } from "../../../config.json";
import FilterBox from "../../components/filterbox/filterbox";
import "./live.css";
import MapLayers from "../../components/maplayers/maplayers";
import AddLayers from "../../components/addlayers/addlayers";
import Legend from "../../components/legend/legend";

class Live extends Component {
  state = {
    parameters: [],
    maplayers: [],
    selected: [0,1],
    hidden: []
  };

  setSelected = selected => {
    this.setState({ selected });
  };

  addSelected = async ids => {
    function maplayersfind(maplayers, id) {
      return maplayers.find(x => x.id === id);
    }
    var { selected, maplayers, parameters } = this.state;
    for (var i = 0; i < ids.length; i++) {
      if (!selected.includes(ids[i])) {
        if (!("data" in maplayersfind(maplayers, ids[i]))) {
          maplayers = await this.downloadFile(ids[i], maplayers);
          ({ maplayers, parameters } = this.updateMinMax(
            ids[i],
            maplayers,
            parameters
          ));
        }
        selected.unshift(ids[i]);
      }
    }
    this.setState({ selected, maplayers, parameters });
  };

  removeSelected = ids => {
    function selectedfilter(selected, id) {
      return selected.filter(selectid => selectid !== id);
    }
    var { selected, hidden } = this.state;
    for (var i = 0; i < ids.length; i++) {
      selected = selectedfilter(selected, ids[i]);
      hidden = selectedfilter(hidden, ids[i]);
    }
    this.setState({ selected, hidden });
  };

  toggleLayerView = id => {
    var { hidden } = this.state;
    if (hidden.includes(id)) {
      hidden = hidden.filter(selectid => selectid !== id);
    } else {
      hidden.push(id);
    }
    this.setState({ hidden });
  };

  updateMapLayers = maplayers => {
    this.setState({ maplayers });
  };

  updateParameters = parameters => {
    this.setState({ parameters });
  };

  downloadFile = async (id, maplayers) => {
    var index = maplayers.findIndex(x => x.id === id);
    var { data } = await axios.get(maplayers[index].api);
    maplayers[index].data = data;
    return maplayers;
  };

  meteoSwissMarkersMinMax = layer => {
    var array = layer.data.features;
    array = array.map(x => x.properties.value);
    array = array.filter(x => x !== 9999);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { min: min, max: max, array: array };
  };

  simstratMinMax = layer => {
    var array = layer.data;
    array = array.map(x => x.value);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { min: min, max: max, array: array };
  };

  remoteSensingMinMax = layer => {
    var array = layer.data;
    array = array.v;
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { min: min, max: max, array: array };
  };

  meteolakesScalarMinMax = layer => {
    var inarray = layer.data;
    var min = Infinity;
    var max = -Infinity;
    var flat;
    var array = [];
    for (var i = 0; i < inarray.length; i++) {
      flat = inarray[i].data.flat();
      flat = flat.filter(item => item !== null);
      flat = flat.map(item => item[2]);
      min = Math.min(min, this.getMin(flat));
      max = Math.max(max, this.getMax(flat));
      array = array.concat(flat);
    }
    return { min: min, max: max, array: array };
  };

  meteolakesVectorMinMax = layer => {
    var inarray = layer.data;
    var min = Infinity;
    var max = -Infinity;
    var flat;
    var array = [];
    for (var i = 0; i < inarray.length; i++) {
      flat = inarray[i].data.flat();
      flat = flat.filter(item => item !== null);
      flat = flat.map(item =>
        Math.abs(Math.sqrt(Math.pow(item[2], 2) + Math.pow(item[3], 2)))
      );
      min = Math.min(min, this.getMin(flat));
      max = Math.max(max, this.getMax(flat));
      array = array.concat(flat);
    }
    return { min: min, max: max, array: array };
  };

  updateMinMax = (id, maplayers, parameters) => {
    var index = maplayers.findIndex(x => x.id === id);
    var layer = JSON.parse(JSON.stringify(maplayers[index]));
    var parameterIndex = parameters.findIndex(
      x => x.id === layer.parameters_id
    );
    var plotFunction = layer.plotFunction;
    var min, max, array;

    if (plotFunction === "meteoSwissMarkers") {
      ({ min, max, array } = this.meteoSwissMarkersMinMax(layer));
    }
    if (plotFunction === "simstrat") {
      ({ min, max, array } = this.simstratMinMax(layer));
    }
    if (plotFunction === "remoteSensing") {
      ({ min, max, array } = this.remoteSensingMinMax(layer));
    }
    if (plotFunction === "meteolakesScalar") {
      ({ min, max, array } = this.meteolakesScalarMinMax(layer));
    }
    if (plotFunction === "meteolakesVector") {
      ({ min, max, array } = this.meteolakesVectorMinMax(layer));
    }

    maplayers[index].array = array;

    if (parameters[parameterIndex].min) {
      parameters[parameterIndex].min = Math.min(
        parameters[parameterIndex].min,
        min
      );
    } else {
      parameters[parameterIndex].min = min;
    }
    if (parameters[parameterIndex].max) {
      parameters[parameterIndex].max = Math.max(
        parameters[parameterIndex].max,
        max
      );
    } else {
      parameters[parameterIndex].max = max;
    }
    return { maplayers: maplayers, parameters: parameters };
  };

  getMax = arr => {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
      max = arr[len] > max ? arr[len] : max;
    }
    return max;
  };

  getMin = arr => {
    let len = arr.length;
    let min = Infinity;

    while (len--) {
      min = arr[len] < min ? arr[len] : min;
    }
    return min;
  };

  async componentDidMount() {
    // Get parameter details
    var { data: parameters } = await axios.get(
      apiUrl + "/selectiontables/parameters"
    );

    // Add default display settings for parameters
    parameters.map(x => {
      if (!("plot" in x)) x.plot = "group";
      if (!("colors" in x)) {
        x.colors = [
          { color: "#000080", point: 0.0 },
          { color: "#3366ff", point: 0.0033388981636060114 },
          { color: "#00b0dc", point: 0.015025041736227053 },
          { color: "#009933", point: 0.04006677796327214 },
          { color: "#ffff5b", point: 0.0818030050083473 },
          { color: "#e63300", point: 0.16527545909849758 },
          { color: "#cc0000", point: 0.4156928213689484 },
          { color: "#800000", point: 1.0 }
        ];
      }
      if (!("markerLabel" in x)) x.markerLabel = true;
      if (!("legend" in x)) x.legend = true;
      if (!("markerSymbol" in x)) x.markerSymbol = "circle";
      if (!("markerFixedSize" in x)) x.markerFixedSize = true;
      if (!("markerSize" in x)) x.markerSize = 10;
      if (!("vectorMagnitude" in x)) x.vectorMagnitude = true;
      if (!("vectorArrows" in x)) x.vectorArrows = false;
      if (!("vectorFlow" in x)) x.vectorFlow = false;
      if (!("vectorArrowColor" in x)) x.vectorArrowColor = false;
      if (!("vectorFlowColor" in x)) x.vectorFlowColor = false;
      return x;
    });

    // Get maplayers
    var { data: maplayers } = await axios.get(apiUrl + "/maplayers");

    // Add default color settings for maplayers if non already
    maplayers.map(x => {
      if (!("colors" in x)) {
        x.colors = [
          { color: "#000080", point: 0.0 },
          { color: "#3366ff", point: 0.0033388981636060114 },
          { color: "#00b0dc", point: 0.015025041736227053 },
          { color: "#009933", point: 0.04006677796327214 },
          { color: "#ffff5b", point: 0.0818030050083473 },
          { color: "#e63300", point: 0.16527545909849758 },
          { color: "#cc0000", point: 0.4156928213689484 },
          { color: "#800000", point: 1.0 }
        ];
      }
      if (!("markerLabel" in x)) x.markerLabel = false;
      if (!("legend" in x)) x.legend = true;
      if (!("markerSymbol" in x)) x.markerSymbol = "circle";
      if (!("markerFixedSize" in x)) x.markerFixedSize = true;
      if (!("markerSize" in x)) x.markerSize = 10;
      if (!("vectorMagnitude" in x)) x.vectorMagnitude = true;
      if (!("vectorArrows" in x)) x.vectorArrows = false;
      if (!("vectorFlow" in x)) x.vectorFlow = false;
      if (!("vectorArrowColor" in x)) x.vectorArrowColor = false;
      if (!("vectorFlowColor" in x)) x.vectorFlowColor = false;
      return x;
    });

    // Download default layers
    var { selected } = this.state;
    for (var i = 0; i < selected.length; i++) {
      maplayers = await this.downloadFile(selected[i], maplayers);
      ({ maplayers, parameters } = this.updateMinMax(
        selected[i],
        maplayers,
        parameters
      ));
    }

    this.setState({
      parameters,
      maplayers
    });
  }

  render() {
    document.title = "Live - Datalakes";
    var { maplayers, parameters, selected, hidden } = this.state;
    maplayers = maplayers.map(layer => {
      var parameter = parameters.find(
        parameter => parameter.id === layer.parameters_id
      );
      layer.min = parameter.min;
      layer.max = parameter.max;
      layer.unit = parameter.unit;
      return layer;
    });
    if (maplayers.length < 1) selected = [];
    var selectlayers = selected.map(id =>
      maplayers.find(layer => layer.id === id)
    );
    return (
      <React.Fragment>
        <h1>Live Conditions</h1>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <React.Fragment>
              <GISMap
                maplayers={selectlayers}
                hidden={hidden}
                legend={<Legend maplayers={selectlayers} />}
                selector={<div className="live-dataselector"></div>}
              />
            </React.Fragment>
          }
          rightNoScroll={
            <React.Fragment>
              <FilterBox
                title="Map Layers"
                preopen="true"
                content={
                  <MapLayers
                    maplayers={maplayers}
                    selected={selected}
                    hidden={hidden}
                    setSelected={this.setSelected}
                    removeSelected={this.removeSelected}
                    toggleLayerView={this.toggleLayerView}
                    updateMapLayers={this.updateMapLayers}
                    updateParameters={this.updateParameters}
                  />
                }
              />
              <FilterBox
                title="Add Layers"
                content={
                  <AddLayers
                    maplayers={maplayers}
                    parameters={parameters}
                    addSelected={this.addSelected}
                  />
                }
              />
            </React.Fragment>
          }
        />
      </React.Fragment>
    );
  }
}

export default Live;

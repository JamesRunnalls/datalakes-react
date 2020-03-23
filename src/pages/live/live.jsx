import React, { Component } from "react";
import { Link } from "react-router-dom";
import LiveMap from "../../graphs/leaflet/live_map";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import axios from "axios";
import { apiUrl } from "../../../config.json";
import ColorBar from "../../components/colorbar/colorbar";
import DataSelect from "../../components/dataselect/dataselect";
import FilterBox from "../../components/filterbox/filterbox";
import "./live.css";
import MapLayers from "../../components/maplayers/maplayers";

class LakeStations extends Component {
  render() {
    if (this.props.datalist) {
      return (
        <React.Fragment>
          {this.props.datalist.map(data => (
            <div className="lakestation" title="See live data" key={data.name}>
              <Link to={"/live/" + String(data.link)}>
                {data.name}
                <div className="description">{data.description}</div>
              </Link>
            </div>
          ))}
        </React.Fragment>
      );
    } else {
      return <div></div>;
    }
  }
}

class MapLegend extends Component {
  state = {};
  render() {
    return <div className="leaflet-legend"></div>;
  }
}

class Live extends Component {
  state = {
    parameters: [],
    maplayers: [],
    selected: [1,2,3,8,9],
    plotted: [1,2]
  };

  addSelected = async id => {
    function maplayersfind(maplayers, id) {
      return maplayers.find(x => x.id === id);
    }
    var { selected, maplayers, parameters } = this.state;
    for (var i = 0; i < id.length; i++) {
      if (!selected.includes(id[i])) {
        if (!("data" in maplayersfind(maplayers, id[i]))) {
          maplayers = await this.downloadFile(id[i], maplayers);
          parameters = this.updateMinMax(id[i], maplayers, parameters);
        }
        selected.push(id[i]);
      }
    }
    this.setState({ selected, maplayers, parameters });
  };

  removeSelected = id => {
    function selectedfilter(selected, id) {
      return selected.filter(selectid => selectid !== id);
    }
    var { selected } = this.state;
    for (var i = 0; i < id.length; i++) {
      selected = selectedfilter(selected, id[i]);
    }
    this.setState({ selected });
  };

  addPlotted = async id => {
    function maplayersfind(maplayers, id) {
      return maplayers.find(x => x.id === id);
    }
    var { plotted, maplayers, parameters } = this.state;
    for (var i = 0; i < id.length; i++) {
      if (!plotted.includes(id[i])) {
        if (!("data" in maplayersfind(maplayers, id[i]))) {
          maplayers = await this.downloadFile(id[i], maplayers);
          parameters = this.updateMinMax(id[i], maplayers, parameters);
        }
        plotted.push(id[i]);
      }
    }
    this.setState({ plotted, maplayers, parameters });
  };

  removePlotted = id => {
    function plottedfilter(plotted, id) {
      return plotted.filter(selectid => selectid !== id);
    }
    var { plotted } = this.state;
    for (var i = 0; i < id.length; i++) {
      plotted = plottedfilter(plotted, id[i]);
    }
    this.setState({ plotted });
  };

  updateMapLayers = maplayers => {
    this.setState({ maplayers });
  };

  updateParameters = parameters => {
    this.setState({ parameters });
  };

  hoverFunc = (target, type) => {
    if (type === "over") {
      document.getElementById("color-table").style.display = "block";
      document.getElementById("hoverValue").innerHTML =
        Math.round(parseFloat(target.options.title) * 100) / 100 +
        this.state.unit;
      document.getElementById("hoverLat").innerHTML =
        Math.round(parseFloat(target._latlngs[0][0].lat) * 1000) / 1000;
      document.getElementById("hoverLon").innerHTML =
        Math.round(parseFloat(target._latlngs[0][0].lng) * 1000) / 1000;
    } else {
      document.getElementById("color-table").style.display = "none";
    }
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
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { min: min, max: max };
  };

  simstratMinMax = layer => {
    var array = layer.data;
    array = array.map(x => x.value);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { min: min, max: max };
  };

  remoteSensingMinMax = layer => {
    var array = layer.data;
    array = array.v;
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { min: min, max: max };
  };

  meteolakesScalarMinMax = layer => {
    var array = layer.data;
    
    return { min: 0, max: 10 };
  };

  updateMinMax = (id, maplayers, parameters) => {
    var index = maplayers.findIndex(x => x.id === id);
    var layer = JSON.parse(JSON.stringify(maplayers[index]));
    var parameterIndex = parameters.findIndex(
      x => x.id === layer.parameters_id
    );
    var plotFunction = layer.plotFunction;

    if (plotFunction === "meteoSwissMarkers") {
      var { min, max } = this.meteoSwissMarkersMinMax(layer);
    }
    if (plotFunction === "simstrat") {
      var { min, max } = this.simstratMinMax(layer);
    }
    if (plotFunction === "remoteSensing") {
      var { min, max } = this.remoteSensingMinMax(layer);
    }
    if (plotFunction === "meteolakesScalar") {
      var { min, max } = this.meteolakesScalarMinMax(layer);
    }

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
    return parameters;
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
          { color: "#000080", point: 0 },
          { color: "#3366FF", point: 0.142857142857143 },
          { color: "#00B0DC", point: 0.285714285714286 },
          { color: "#009933", point: 0.428571428571429 },
          { color: "#FFFF5B", point: 0.571428571428571 },
          { color: "#E63300", point: 0.714285714285714 },
          { color: "#CC0000", point: 0.857142857142857 },
          { color: "#800000", point: 1 }
        ];
      }
      if (!("markerLabel" in x)) x.markerLabel = true;
      if (!("legend" in x)) x.legend = true;
      if (!("markerSymbol" in x)) x.markerSymbol = "circle";
      if (!("markerFixedSize" in x)) x.markerFixedSize = true;
      if (!("markerSize" in x)) x.markerSize = 10;
      if (!("field" in x)) x.field = "vector";
      return x;
    });

    // Get maplayers
    var { data: maplayers } = await axios.get(apiUrl + "/maplayers");

    // Add default color settings for maplayers if non already
    maplayers.map(x => {
      if (!("colors" in x)) {
        x.colors = [
          { color: "#000080", point: 0 },
          { color: "#3366FF", point: 0.142857142857143 },
          { color: "#00B0DC", point: 0.285714285714286 },
          { color: "#009933", point: 0.428571428571429 },
          { color: "#FFFF5B", point: 0.571428571428571 },
          { color: "#E63300", point: 0.714285714285714 },
          { color: "#CC0000", point: 0.857142857142857 },
          { color: "#800000", point: 1 }
        ];
      }
      if (!("markerLabel" in x)) x.markerLabel = false;
      if (!("legend" in x)) x.legend = true;
      if (!("markerSymbol" in x)) x.markerSymbol = "circle";
      if (!("markerFixedSize" in x)) x.markerFixedSize = true;
      if (!("markerSize" in x)) x.markerSize = 10;
      if (!("field" in x)) x.field = "vector";
      return x;
    });

    // Download default layers
    var { selected } = this.state;
    for (var i = 0; i < selected.length; i++) {
      maplayers = await this.downloadFile(selected[i], maplayers);
      parameters = this.updateMinMax(selected[i], maplayers, parameters);
    }

    this.setState({
      parameters,
      maplayers
    });
  }

  render() {
    document.title = "Live - Datalakes";
    var { maplayers, parameters, selected, plotted } = this.state;
    return (
      <React.Fragment>
        <h1>Live Conditions</h1>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <React.Fragment>
              <LiveMap
                maplayers={maplayers}
                parameters={parameters}
                selected={plotted}
                hoverFunc={this.hoverFunc}
                legend={<div className="legend"></div>}
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
                    parameters={parameters}
                    selected={selected}
                    plotted={plotted}
                    addSelected={this.addSelected}
                    removeSelected={this.removeSelected}
                    updateMapLayers={this.updateMapLayers}
                    updateParameters={this.updateParameters}
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

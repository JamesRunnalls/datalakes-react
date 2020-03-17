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
    list: [{ name: "" }],
    dataArray: [],
    min: "",
    max: "",
    dataIndex: 0,
    loading: false,
    unit: "",
    markerData: {},
    visibleMarkers: [],
    stations: [],
    colors: [
      { color: "#000080", point: 0 },
      { color: "#3366FF", point: 0.142857142857143 },
      { color: "#00B0DC", point: 0.285714285714286 },
      { color: "#009933", point: 0.428571428571429 },
      { color: "#FFFF5B", point: 0.571428571428571 },
      { color: "#E63300", point: 0.714285714285714 },
      { color: "#CC0000", point: 0.857142857142857 },
      { color: "#800000", point: 1 }
    ],
    parameters: [],
    maplayers: [
      {
        id: 0,
        type: "measurement",
        api: "http://...",
        array: [],
        parameter_id: 5,
        sourcelink: "http://...",
        sourcetext: "Lexplore Lake Platform",
        description: "Here is a description of the data",
        name: "Lexplore Lake Platform"
      },
      {
        id: 1,
        type: "measurement",
        api: "http://...",
        array: [],
        parameter_id: 5,
        sourcelink: "http://...",
        sourcetext: "FOEN",
        description: "Here is a description of the data",
        name: "FOEN Water Temperature"
      },
      {
        id: 3,
        type: "measurement",
        api: "http://...",
        array: [],
        parameter_id: 2,
        sourcelink: "http://...",
        sourcetext: "FOEN",
        description: "Here is a description of the data",
        name: "Some name"
      },
      {
        id: 4,
        type: "satellite",
        api: "http://...",
        array: [],
        parameter_id: 5,
        sourcelink: "http://...",
        sourcetext: "FOEN",
        description: "Here is a description of the data",
        name: "Some name"
      },
      {
        id: 5,
        type: "model",
        api: "http://...",
        array: [],
        parameter_id: 5,
        sourcelink: "http://...",
        sourcetext: "FOEN",
        description: "Here is a description of the data",
        name: "Some name"
      },
      {
        id: 6,
        type: "satellite",
        api: "http://...",
        array: [],
        parameter_id: 8,
        sourcelink: "http://...",
        sourcetext: "FOEN",
        description: "Here is a description of the data",
        name: "Some name"
      }
    ],
    selected: [0, 1]
  };

  addSelected = id => {
    var { selected } = this.state;
    for (var i = 0; i < id.length; i++) {
      if (!selected.includes(id[i])) {
        selected.push(id[i]);
      }
    }
    this.setState({ selected });
  };

  removeSelected = id => {
    var { selected } = this.state;
    for (var i = 0; i < id.length; i++) {
      selected = selected.filter(selectid => selectid !== id[i]);
    }
    this.setState({ selected });
  };

  optimisePoints = (colors, array) => {
    var min = Math.min(...array);
    var max = Math.max(...array);
    var q, val, point;
    for (var i = 0; i < colors.length; i++) {
      if (i === 0) colors[i].point = 0;
      else if (i === colors.length - 1) colors[i].point = 1;
      else {
        q = (1 / (colors.length - 1)) * i;
        val = this.quantile(array, q);
        point = (val - min) / (max - min);
        colors[i].point = point;
      }
    }
    return colors;
  };

  quantile = (arr, q) => {
    const sorted = arr.slice(0).sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
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

  downloadFile = async dataIndex => {
    this.setState({ loading: true });
    var { list, dataArray } = this.state;
    const { data } = await axios.get(
      apiUrl + "/rs/" + list[dataIndex].endpoint
    );
    dataArray[dataIndex] = data[0];
    var min = Math.round(Math.min(...dataArray[dataIndex].v) * 100) / 100;
    var max = Math.round(Math.max(...dataArray[dataIndex].v) * 100) / 100;
    var unit = list[dataIndex].unit;
    this.setState({ dataArray, min, max, loading: false, unit });
  };

  handleSelect = async event => {
    var {
      list,
      dataIndex: oldDataIndex,
      dataArray,
      min,
      max,
      unit
    } = this.state;
    var dataIndex = list.findIndex(x => x.name === event.value);
    if (oldDataIndex !== dataIndex) {
      if (dataArray[dataIndex] === 0) {
        this.setState({ dataIndex, loading: true });
        this.downloadFile(dataIndex);
      } else {
        min = Math.round(Math.min(...dataArray[dataIndex].v) * 100) / 100;
        max = Math.round(Math.max(...dataArray[dataIndex].v) * 100) / 100;
        unit = list[dataIndex].unit;
        this.setState({ dataIndex, min, max, unit });
      }
    }
  };

  updateParentColors = colors => {
    var { dataArray, dataIndex } = this.state;
    colors = this.optimisePoints(colors, dataArray[dataIndex].v);
    this.setState({ colors });
  };

  makerChange = event => {
    var { visibleMarkers } = this.state;
    var value = event.target.value;
    if (visibleMarkers.includes(value)) {
      visibleMarkers = visibleMarkers.filter(x => x !== value);
    } else {
      visibleMarkers.push(value);
    }
    this.setState({ visibleMarkers });
  };

  stationPopup = info => {
    console.log(info);
    if ("update" in info) {
      return (
        "<b>" +
        info.name +
        "</b><br>" +
        info.description +
        '<br><a title="See live data" href="/live/' +
        info.link +
        '">See live data</a>'
      );
    } else {
      return (
        "<b>" +
        info.name +
        "</b><br>" +
        info.type +
        "<br>Elevation: " +
        info.elevation +
        'mAOD<br><a target="_blank" href="' +
        info.link +
        '">See live data</a>'
      );
    }
  };

  async componentDidMount() {
    // Get parameter details
    const { data: parameters } = await axios.get(
      apiUrl + "/selectiontables/parameters"
    );

    // Add default display settings for parameters
    parameters.map(x => {
      x.symbol = "circle";
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
      x.min = 0;
      x.max = 1;
      return x;
    });

    // Get maplayers 
    //const { data: maplayers } = await axios.get(apiUrl + "/maplayers");
    var maplayers = this.state.maplayers; // temporary

    // Add default display settings for maplayers
    maplayers.map(x => {
      x.fixedColor = false;
      x.fixedSize = false;
      x.symbol = "circle";
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
      return x;
    });

    // Get list of available layers
    const { data: list } = await axios.get(apiUrl + "/rs");
    var dataArray = new Array(list.length).fill(0);

    // Download meteo stations
    const { data: stations } = await axios.get(apiUrl + "/live");

    var markerData = {};

    for (var stationType of stations) {
      const { data } = await axios.get(apiUrl + "/" + stationType.endpoint);
      markerData[stationType.value] = data;
    }

    // Download first layer
    const { data } = await axios.get(apiUrl + "/rs/" + list[0].endpoint);

    var min = Math.round(Math.min(...data[0].v) * 100) / 100;
    var max = Math.round(Math.max(...data[0].v) * 100) / 100;
    var unit = list[0].unit;
    dataArray[0] = data[0];

    this.setState({
      list,
      dataArray,
      min,
      max,
      unit,
      markerData,
      stations,
      parameters,
      maplayers
    });
  }

  render() {
    document.title = "Live - Datalakes";
    var {
      list,
      dataArray,
      dataIndex,
      min,
      max,
      loading,
      markerData,
      visibleMarkers,
      stations,
      colors,
      maplayers,
      parameters,
      selected
    } = this.state;
    var unit = list[dataIndex].unit;
    return (
      <React.Fragment>
        <h1>Live Conditions</h1>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <React.Fragment>
              <LiveMap
                polygon={dataArray[dataIndex]}
                polygonOpacity={1}
                hoverFunc={this.hoverFunc}
                unit={unit}
                loading={loading}
                visibleMarkers={visibleMarkers}
                markerData={markerData}
                markerGroups={stations}
                markerOpacity={1}
                popup={this.stationPopup}
                colors={colors}
                min={min}
                max={max}
                legend={
                  <div className="legend">
                    <ColorBar
                      min={min}
                      max={max}
                      colors={colors}
                      unit={unit}
                      text={list[dataIndex].description}
                      onChange={this.updateParentColors}
                    />
                  </div>
                }
                selector={
                  <div className="live-dataselector">
                    <DataSelect
                      value="name"
                      label="name"
                      dataList={list}
                      defaultValue={list[dataIndex].name}
                      onChange={this.handleSelect}
                    />
                  </div>
                }
              />
            </React.Fragment>
          }
          rightNoScroll={
            <React.Fragment>
              <FilterBox
                title="Lake Stations"
                content={<LakeStations datalist={markerData.lakestations} />}
              />
              <FilterBox
                title="Map Layers"
                preopen="true"
                content={
                  <MapLayers
                    maplayers={maplayers}
                    parameters={parameters}
                    selected={selected}
                    addSelected={this.addSelected}
                    removeSelected={this.removeSelected}
                    updateMapLayers={this.updateMapLayers}
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

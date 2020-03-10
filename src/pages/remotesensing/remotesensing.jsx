import React, { Component } from "react";
import RemoteSensingMap from "../../graphs/leaflet/rs_map";
import axios from "axios";
import { apiUrl } from "../../../config.json";
import ColorBar from "../../components/colorbar/colorbar";
import DataSelect from "../../components/dataselect/dataselect";
import ColorSlider from "../../components/colorslider/colorslider";
import FilterBox from "../../components/filterbox/filterbox";
import "./remotesensing.css";
import ColorTable from "../../components/colortable/colortable";
import ColorRamp from "../../components/colorramp/colorramp";

class RemoteSensingSidebar extends Component {
  state = {
    open: window.innerWidth > 500
  };
  toggle = () => {
    this.setState({ open: !this.state.open });
  };
  render() {
    var {
      list,
      dataIndex,
      handleSelect,
      array,
      colors,
      min,
      max,
      updateParentColors
    } = this.props;
    var { open } = this.state;
    return (
      <div className={open ? "map-sidebar" : "map-sidebar minimised"}>
        <div
          className="map-sidebar-symbol"
          onClick={this.toggle}
          title="Toggle Sidebar"
        >
          {open ? "\u2715" : "\u2630"}
        </div>
        <div className="map-sidebar-content">
          <FilterBox
            title="Layers"
            content={
              <DataSelect
                value="name"
                label="name"
                dataList={list}
                defaultValue={list[dataIndex].name}
                onChange={handleSelect}
              />
            }
            preopen="true"
          />
          <FilterBox
            preopen="true"
            title="Color Ramp"
            content={<ColorRamp onChange={updateParentColors} />}
          />
          <FilterBox
            title="Color Table"
            content={
              <ColorTable
                colors={colors}
                min={min}
                max={max}
                updateParentColors={updateParentColors}
              />
            }
          />
          <FilterBox
            title="Color Sliders"
            content={<ColorSlider array={array} colors={colors} />}
          />
        </div>
      </div>
    );
  }
}

class RemoteSensing extends Component {
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
    ]
  };

  setMin = event => {
    const min = parseFloat(event.target.value);
    if (this.isNumeric(min)) {
      this.setState({ min });
    }
  };

  setMax = event => {
    const max = parseFloat(event.target.value);
    if (this.isNumeric(max)) {
      this.setState({ max });
    }
  };

  updateParentColors = colors => {
    this.setState({ colors });
  };

  isNumeric = n => {
    return !isNaN(parseFloat(n)) && isFinite(n);
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

  async componentDidMount() {
    // Get list of available layers
    const { data: list } = await axios.get(apiUrl + "/rs");
    var dataArray = new Array(list.length).fill(0);

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
      unit
    });
  }

  render() {
    document.title = "Remote Sensing - Datalakes";
    var { list, dataArray, dataIndex, min, max, loading, colors } = this.state;
    var unit = list[dataIndex].unit;

    var array = [];
    if (dataArray[dataIndex]) array = dataArray[dataIndex].v;

    return (
      <React.Fragment>
        <h1>Remote Sensing</h1>
        <RemoteSensingMap
          polygon={dataArray[dataIndex]}
          polygonOpacity={1}
          min={min}
          max={max}
          hoverFunc={this.hoverFunc}
          unit={unit}
          loading={loading}
          popup={this.stationPopup}
          colors={colors}
          sidebar={
            <RemoteSensingSidebar
              list={list}
              dataIndex={dataIndex}
              handleSelect={this.handleSelect}
              array={array}
              colors={colors}
              min={min}
              max={max}
              updateParentColors={this.updateParentColors}
            />
          }
          legend={
            <ColorBar
              min={min}
              max={max}
              colors={colors}
              unit={unit}
              text={list[dataIndex].description}
            />
          }
        />
      </React.Fragment>
    );
  }
}

export default RemoteSensing;

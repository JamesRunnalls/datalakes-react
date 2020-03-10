import React, { Component } from "react";
import { Link } from "react-router-dom";
import LiveMap from "../../graphs/leaflet/live_map";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import { generateColorRGB } from "../../components/gradients/gradients";
import axios from "axios";
import { apiUrl } from "../../../config.json";
import ColorBar from "../../components/colorbar/colorbar";
import DataSelect from "../../components/dataselect/dataselect";
import FilterBox from "../../components/filterbox/filterbox";
import ColorRamp from "../../components/colorramp/colorramp";

class WeatherStation extends Component {
  render() {
    var link = "/live/" + String(this.props.url);
    return (
      <div className="weatherstation" title="See live data">
        <Link to={link}>
          <b>{this.props.name}</b>
          <div className="desc">{this.props.desc}</div>
        </Link>
      </div>
    );
  }
}

class WeatherStations extends Component {
  render() {
    return (
      <React.Fragment>
        {this.props.datalist.map(data => (
          <WeatherStation
            key={data.name}
            url={data.url}
            name={data.name}
            desc={data.description}
            imgname={data.imgname}
          />
        ))}
      </React.Fragment>
    );
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

  color = (minColor, maxColor, value, min, max) => {
    var gradient = generateColorRGB(minColor, maxColor, 100);
    var pixelcolor = "";
    if (value > max) {
      pixelcolor = "transparent";
    } else if (value < min) {
      pixelcolor = "transparent";
    } else {
      pixelcolor =
        gradient[parseInt(gradient.length / ((max - min) / (value - min)), 10)];
    }
    return pixelcolor;
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

  updateParentColors = colors => {
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
    if ("parameters" in info) {
      return (
        "<b>" +
        info.name +
        "</b><br>Surface Temperature: " +
        info.parameters.watertemperature.value +
        '&deg;C<br><a title="See live data" href="/live/' +
        info.url +
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
      stations
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
      colors
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
          }
          rightNoScroll={
            <React.Fragment>
              <table>
                <tbody>
                  {stations.map(station => (
                    <tr key={station.value}>
                      <td>
                        <input
                          type="checkbox"
                          id={station.value}
                          value={station.value}
                          onChange={this.makerChange}
                        />
                      </td>
                      <td>{station.name}</td>
                      <td>
                        <div className={station.shape}></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <FilterBox
                title="Satellite Data"
                content={
                  <React.Fragment>
                    <DataSelect
                      value="name"
                      label="name"
                      dataList={list}
                      defaultValue={list[dataIndex].name}
                      onChange={this.handleSelect}
                    />
                    <Link to="remotesensing">
                      <button style={{ width: "100%" }}>
                        Advanced remote sensing features
                      </button>
                    </Link>
                  </React.Fragment>
                }
                preopen="true"
              />
              <FilterBox
                title="Lake Stations"
                content={
                  <React.Fragment>
                    <WeatherStations datalist={markerData.lakestations} />
                  </React.Fragment>
                }
              />
              <FilterBox
                title="Display Settings"
                content={
                  <ColorRamp
                    onChange={this.updateParentColors}
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

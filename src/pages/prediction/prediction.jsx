import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import ColorBar from "../../components/colorbar/colorbar";
import { apiUrl } from "../../../config.json";
import "./prediction.css";
import PredictionMap from "../../graphs/leaflet/prediction_map";
import FilterBox from "../../components/filterbox/filterbox";
import ColorRamp from "../../components/colorramp/colorramp";

class ModelInfo extends Component {
  sendPanInfo = geometry => {
    var lat = [];
    var lon = [];
    for (var x of geometry[0]) {
      lat.push(x[1]);
      lon.push(x[0]);
    }
    var zoom = [
      [Math.max.apply(Math, lat), Math.min.apply(Math, lon)],
      [Math.min.apply(Math, lat), Math.max.apply(Math, lon)]
    ];
    var latc =
      Math.min.apply(Math, lat) +
      (Math.max.apply(Math, lat) - Math.min.apply(Math, lat)) / 2;
    var lonc =
      Math.min.apply(Math, lon) +
      (Math.max.apply(Math, lon) - Math.min.apply(Math, lon)) / 2;
    this.props.panTo([latc, lonc], zoom);
  };

  render() {
    var datalakes = "model";
    var meteolakes = "model";
    var simstrat = "model";
    if (this.props.datalakes === "") {
      datalakes = "model hide";
    }
    if (this.props.meteolakes === "") {
      meteolakes = "model hide";
    }
    if (this.props.simstrat === "") {
      simstrat = "model hide";
    }
    return (
      <div className="modellist">
        <div
          className="top"
          onClick={() => this.sendPanInfo(this.props.geometry)}
          title={"Pan to " + this.props.name}
        >
          <div className="lakeTitle">
            <h4>{this.props.name}</h4>
          </div>
          <div>
            <div>Surface Temperature: {this.props.surfacetemperature} °C</div>
          </div>
        </div>
        <ul>
          <li className={datalakes}>
            <Link to={this.props.datalakes}>Five Day Forecast (Datalakes)</Link>
          </li>
          <li className={meteolakes}>
            <a href={this.props.meteolakes}>Three Day Forecast (Meteolakes)</a>
          </li>
          <li className={simstrat}>
            <a href={this.props.simstrat}>1D Lake Simulation (Simstrat)</a>
          </li>
        </ul>
      </div>
    );
  }
}

class ModelList extends Component {
  render() {
    return (
      <div className="modellist-parent">
        {this.props.geojson.map(data => (
          <ModelInfo
            key={data.properties.id}
            name={data.properties.name}
            elevation={data.properties.elevation}
            depth={data.properties.depth}
            surfacetemperature={data.properties.surfacetemperature}
            simstrat={data.properties.simstrat}
            meteolakes={data.properties.meteolakes}
            datalakes={data.properties.datalakes}
            panTo={this.props.panTo}
            geometry={data.geometry.coordinates}
          />
        ))}
      </div>
    );
  }
}

class Predictions extends Component {
  state = {
    geojson: [],
    meteolakes: [],
    map: "",
    search: "",
    MinTemp: "",
    MaxTemp: "",
    Temp: "",
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

  async componentDidMount() {
    // Lake Models
    const { data: geojson } = await axios.get(apiUrl + "/predictions");

    // Simstrat Data
    try {
      const { data: simstratSurfaceTemperature } = await axios.get(
        apiUrl + "/predictions/simstrat"
      );
      var temp = [];

      const simfind = (sim, lake) => {
        return sim.find(c => c.urlID === lake.properties.simstrat);
      };

      for (var lake of geojson) {
        var laketemp = simfind(simstratSurfaceTemperature, lake);
        lake.properties.surfacetemperature = parseFloat(
          laketemp.surfacetemperature
        );
        temp.push(parseFloat(laketemp.surfacetemperature));
      }

      var MinTemp = Math.floor(Math.min(...temp));
      var MaxTemp = Math.ceil(Math.max(...temp));
      this.setState({ geojson, MinTemp, MaxTemp });
    } catch (e) {
      console.log(e);
      this.setState({ geojson });
    }

    // Meteolakes Data
    try {
      const { data: meteolakes } = await axios.get(
        apiUrl + "/predictions/meteolakes"
      );
      var tempMin, tempMax;
      for (var i = 0; i < meteolakes.length; i++) {
        tempMin = Math.floor(this.getMinMeteolakes(meteolakes[i].data));
        tempMax = Math.ceil(this.getMaxMeteolakes(meteolakes[i].data));
        if (tempMin < MinTemp) MinTemp = tempMin;
        if (tempMax > MaxTemp) MaxTemp = tempMax;
      }
      this.setState({ meteolakes, MinTemp, MaxTemp });
    } catch (e) {
      console.log(e);
    }
  }

  getMinMeteolakes = data => {
    return data.reduce((min, p) => (p.v < min ? p.v : min), data[0].v);
  };

  getMaxMeteolakes = data => {
    return data.reduce((max, p) => (p.v > max ? p.v : max), data[0].v);
  };

  isNumeric = n => {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  hoverFunc = (target, type) => {
    if (type === "over") {
      document.getElementById("color-table").style.display = "block";
      document.getElementById("hoverValue").innerHTML =
        Math.round(parseFloat(target.options.title) * 100) / 100 + "°C";
      document.getElementById("hoverLat").innerHTML =
        Math.round(parseFloat(target._latlngs[0][0].lat) * 1000) / 1000;
      document.getElementById("hoverLon").innerHTML =
        Math.round(parseFloat(target._latlngs[0][0].lng) * 1000) / 1000;
    } else {
      document.getElementById("color-table").style.display = "none";
    }
  };

  setMinTemp = event => {
    const MinTemp = parseFloat(event.target.value);
    if (this.isNumeric(MinTemp) && MinTemp > -5) {
      this.setState({ MinTemp });
    }
  };

  setTemp = Temp => {
    ReactDOM.findDOMNode(this.refs.hoverTemp).style.display = "block";
    ReactDOM.findDOMNode(this.refs.hoverTemp).innerHTML =
      Math.round(parseFloat(Temp) * 100) / 100 + "°C";
  };

  setMaxTemp = event => {
    const MaxTemp = parseFloat(event.target.value);
    if (this.isNumeric(MaxTemp) && MaxTemp < 40) {
      this.setState({ MaxTemp });
    }
  };

  setMap = map => {
    this.setState({ map: map });
  };

  panTo = (latlon, bounds) => {
    var zoom = this.state.map.getBoundsZoom(bounds);
    this.state.map.flyTo(latlon, zoom);
  };

  searchDatasets = event => {
    this.setState({ search: event.target.value });
  };

  propertiesPopup = prop => {
    var model = "";
    if (prop.datalakes !== "") {
      model =
        model +
        '<br><a href="' +
        prop.datalakes +
        '">Five Day Forecast (Datalakes)</a>';
    }
    if (prop.meteolakes !== "") {
      model =
        model +
        '<br><a href="' +
        prop.meteolakes +
        '">Three Day Forecast (Meteolakes)</a>';
    }
    if (prop.simstrat !== "") {
      model =
        model +
        '<br><a href="' +
        prop.simstrat +
        '">1D Lake Simulation (Simstrat)</a>';
    }
    return (
      "<div> <b>" +
      prop.name +
      "</b><br> Elevation: " +
      prop.elevation +
      "m <br> Depth: " +
      prop.depth +
      "m <br> Surface Temperature: " +
      prop.surfacetemperature +
      "°C <b>" +
      model +
      "</b>"
    );
  };

  keyPress = (e, data) => {
    if (e.keyCode === 13) {
      var dataset = data.properties;
      if (dataset.datalakes !== "") {
        window.location.href = dataset.datalakes;
      } else if (dataset.meteolakes !== "") {
        window.location.href = dataset.meteolakes;
      } else if (dataset.simstrat !== "") {
        window.location.href = dataset.simstrat;
      }
    }
  };

  updateParentColors = colors => {
    this.setState({ colors });
  };

  render() {
    document.title = "Predictions - Datalakes";
    var { MaxTemp, MinTemp, colors } = this.state;

    // Filter lakes
    var lowercasedSearch = this.state.search.toLowerCase();
    var filteredData = this.state.geojson.filter(item => {
      return item.properties.name.toLowerCase().includes(lowercasedSearch);
    });

    return (
      <React.Fragment>
        <h1>Model Predictions</h1>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <React.Fragment>
              <PredictionMap
                geojson={this.state.geojson}
                popupfunction={this.propertiesPopup}
                colors={colors}
                min={MinTemp}
                max={MaxTemp}
                setMap={this.setMap}
                setTemp={this.setTemp}
                threeD={this.state.meteolakes}
                hoverFunc={this.hoverFunc}
                legend={
                  <ColorBar
                    min={MinTemp}
                    max={MaxTemp}
                    colors={colors}
                    unit="°C"
                    text="Lake surface temperature"
                  />
                }
              />
            </React.Fragment>
          }
          right={
            <React.Fragment>
              <FilterBox
                title="Lake Models"
                preopen="true"
                content={
                  <React.Fragment>
                    <input
                      onChange={this.searchDatasets}
                      onKeyDown={e => this.keyPress(e, filteredData[0])}
                      type="search"
                      placeholder="Search"
                      className="modelSearch"
                    ></input>
                    <ModelList
                      geojson={filteredData}
                      panTo={this.panTo}
                      onSearch={this.searchDatasets}
                    />
                  </React.Fragment>
                }
              />
              <FilterBox
                title="Display Options"
                preopen="true"
                content={<ColorRamp onChange={this.updateParentColors} />}
              />
            </React.Fragment>
          }
        />
      </React.Fragment>
    );
  }
}

export default Predictions;

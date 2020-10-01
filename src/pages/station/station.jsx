import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../../src/config.json";
import D3LineGraph from "../../graphs/d3/linegraph/linegraph";
import "./station.css";

class LiveParameterSummary extends Component {
  render() {
    var { dataset, selected, select } = this.props;
    return (
      <div className="live-parameter-container">
        {dataset.map((parameter, index) => {
          return (
            <LiveParameter
              key={parameter.label}
              index={index}
              parameter={parameter}
              selected={selected}
              select={select}
            />
          );
        })}
      </div>
    );
  }
}

class LiveParameter extends Component {
  render() {
    var { index, parameter, selected, select } = this.props;
    var title = "See " + parameter.label + " timeseries";
    var paramClass = "parameter-block";
    if (index === selected) {
      paramClass = "parameter-block selected";
    }
    if (parameter.label === "Time") {
      var a = new Date(parameter.value[parameter.value.length - 1] * 1000);
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var time =
        (hour < 10 ? "0" + hour : hour) + ":" + (min < 10 ? "0" + min : min);

      return (
        <div className={paramClass} title={title}>
          <div className="value">{time}</div>
          <div className="units">{date + " " + month}</div>
          <div className="label">{year}</div>
        </div>
      );
    } else {
      return (
        <div className={paramClass} title={title} onClick={() => select(index)}>
          <div className="value">
            {Math.round(parameter.value[parameter.value.length - 1] * 10) / 10}
          </div>
          <div className="units">{this.props.parameter.units}</div>
          <div className="label">{this.props.parameter.label}</div>
        </div>
      );
    }
  }
}

class WeatherStationGraph extends Component {
  render() {
    var { dataset, datainfo, selected } = this.props;
    if (dataset.length > 0) {
      var x = dataset
        .find((x) => x.label === "Time")
        .value.map((i) => i * 1000);
      var y = dataset[selected].value.map((i) => i * 1);
      var data = { x: x, y: y };
      return (
        <div className="weatherstation-right">
          {dataset[selected].label !== "Time" && (
            <div className="weatherstation-graph">
              <D3LineGraph
                data={data}
                title={""}
                xlabel={"Time"}
                ylabel={dataset[selected].label}
                xunits={"Time"}
                yunits={dataset[selected].units}
                lcolor={"black"}
                lweight={1}
                bcolor={"white"}
                xscale={"Time"}
                yscale={"Linear"}
              />
            </div>
          )}
          <div>{datainfo.description}</div>
          <div>{datainfo.update}</div>
          <a href={dataset[selected].link}>
            <button>Explore meteostation data</button>
          </a>
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}

class Station extends Component {
  state = {
    dataset: [],
    datainfo: [],
    error: false,
    selected: 1,
  };

  setSelectedState = (selected) => {
    this.setState({ selected });
  };

  async componentDidMount() {
    const url = this.props.location.pathname.split("/").slice(-1)[0];
    const { data: datainfo } = await axios
      .get(apiUrl + "/externaldata/lakestations/" + url)
      .catch((error) => {
        this.setState({ error: true });
      });
    const { data: dataset } = await axios
      .get(apiUrl + "/externaldata/lakestations/" + url + "?get=data")
      .catch((error) => {
        this.setState({ error: true });
      });
    this.setState({ dataset, datainfo });
  }

  render() {
    var { dataset, datainfo, selected, error } = this.state;
    if (error) {
      return <Redirect to="/" />;
    } else {
      document.title = datainfo.name + " Live - Datalakes";
      return (
        <React.Fragment>
          <h1>{datainfo.name} Live</h1>

          <LiveParameterSummary
            dataset={dataset}
            selected={selected}
            select={this.setSelectedState}
          />
          <div className="webcam">
            <a href="https://www.pully.ch/fr/footer/webcam-medias/">
              <img
                src="https://www.pully.ch/media/64410/w_prieure.jpg?Cache=No&format=png"
                alt="Webcam at Pully"
              />
            </a>
            <div>Image Copywrite Ville de Pully</div>
          </div>
          <WeatherStationGraph
            dataset={dataset}
            datainfo={datainfo}
            selected={selected}
          />
        </React.Fragment>
      );
    }
  }
}

export default Station;

import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import { apiUrl } from "../../../config.json";
import "./weatherstationdetail.css";
import { Select } from "react-select";

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
        "Dec"
      ];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var time =
        (hour < 10 ? "0" + hour : hour) +
        ":" +
        (min < 10 ? "0" + min : min);

        
      return (
        <div className={paramClass} title={title} onClick={() => select(index)}>
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

class WeatherStationRight extends Component {
  render() {
    var link = this.props.selected.link;
    if ("time" in this.props.data) {
      return (
        <div className="timeseries">
          <div>{this.props.data.update}</div>
          <div>Last Updated: {this.props.data.time}</div>
          <div className="graph-container"></div>
          <a href={link}>
            <div className="view-download">
              View and Dowload Timeseries Data
            </div>
          </a>
        </div>
      );
    } else {
      return "";
    }
  }
}

class WeatherStationDetail extends Component {
  state = {
    dataset: [],
    datainfo: [],
    error: false,
    selected: 0
  };

  setSelectedState = selected => {
    this.setState({ selected });
  };

  async componentDidMount() {
    const url = this.props.location.pathname.split("/").slice(-1)[0];
    const { data: datainfo } = await axios
      .get(apiUrl + "/live/lakestations/" + url)
      .catch(error => {
        this.setState({ error: true });
      });
    const { data: dataset } = await axios
      .get(apiUrl + "/live/lakestations/" + url + "?get=data")
      .catch(error => {
        this.setState({ error: true });
      });
    this.setState({ dataset, datainfo });
  }

  render() {
    var { dataset, datainfo, selected, error } = this.state;
    if (error) {
      return <Redirect to="/live" />;
    } else {
      document.title = datainfo.name + " Weather Station - Datalakes";
      return (
        <React.Fragment>
          <h1>{datainfo.name} Weather Station</h1>
          <SidebarLayout
            sidebartitle="Time Series"
            left={
              <LiveParameterSummary
                dataset={dataset}
                selected={selected}
                select={this.setSelectedState}
              />
            }
            right={<WeatherStationRight data={dataset} selected={selected} />}
          />
        </React.Fragment>
      );
    }
  }
}

export default WeatherStationDetail;

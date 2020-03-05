import React, { Component } from "react";
import ReactDOM from "react-dom";
import RSmap from "../../graphs/leaflet/rsmap";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import { generateColorRGB } from "../../components/gradients/gradients";
import axios from "axios";
import { apiUrl } from "../../../config.json";
import "./remotesensing.css";
import ColorBar from "../../components/colorbar/colorbar";
import DataSelect from "../../components/dataselect/dataselect";

class RemoteSensing extends Component {
  state = {
    list: [{ name: "" }],
    dataArray: [],
    min: "",
    max: "",
    minColor: "#0000FF",
    maxColor: "#FF0000",
    dataIndex: 0,
    loading: false,
    unit: ""
  };

  setMinColor = event => {
    var { minColor } = this.state;
    if (minColor !== event.target.value) {
      this.setState({ minColor: event.target.value });
    }
  };

  setMaxColor = event => {
    var { maxColor } = this.state;
    if (maxColor !== event.target.value) {
      this.setState({ maxColor: event.target.value });
    }
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

  hoverFunc = (value, type) => {
    if (type === "over") {
      ReactDOM.findDOMNode(this.refs.hoverTemp).style.display = "block";
      ReactDOM.findDOMNode(this.refs.hoverTemp).innerHTML =
        Math.round(parseFloat(value) * 100) / 100 + this.state.unit;
    } else {
      ReactDOM.findDOMNode(this.refs.hoverTemp).style.display = "none";
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

    this.setState({ list, dataArray, min, max, unit });
  }

  render() {
    document.title = "Remote Sensing - Datalakes";
    var {
      list,
      dataArray,
      dataIndex,
      min,
      max,
      minColor,
      maxColor,
      loading
    } = this.state;
    var colorbar = {
      max: max,
      min: min,
      minColor: minColor,
      maxColor: maxColor
    };
    var unit = list[dataIndex].unit;
    return (
      <React.Fragment>
        <h1>Remote Sensing</h1>
        <SidebarLayout
          sidebartitle="Settings"
          left={
            <React.Fragment>
              <RSmap
                data={dataArray[dataIndex]}
                colorbar={colorbar}
                color={this.color}
                hoverFunc={this.hoverFunc}
                hover={<div ref="hoverTemp" className="hoverTemp"></div>}
                unit={unit}
                loading={loading}
                legend={
                  <ColorBar
                    min={min}
                    max={max}
                    setMax={this.setMax}
                    setMin={this.setMin}
                    minColor={minColor}
                    maxColor={maxColor}
                    setMinColor={this.setMinColor}
                    setMaxColor={this.setMaxColor}
                    unit={unit}
                  />
                }
              />
            </React.Fragment>
          }
          rightNoScroll={
            <DataSelect
              value="name"
              label="name"
              dataList={list}
              defaultValue={list[dataIndex].name}
              onChange={this.handleSelect}
            />
          }
        />
      </React.Fragment>
    );
  }
}

export default RemoteSensing;

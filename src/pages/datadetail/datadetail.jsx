import React, { Component } from "react";
import axios from "axios";
import * as d3 from "d3";
import HeatMap from "./inner/heatmap";
import LineGraph from "./inner/linegraph";
import Download from "./inner/download";
import Information from "./inner/information";
import Pipeline from "./inner/pipeline";
import Preview from "./inner/preview";
import DataSubMenu from "./datasubmenu";
import { apiUrl } from "../../../config.json";
import "./datadetail.css";

class DataDetail extends Component {
  state = {
    selection: "",
    dataset: [],
    parameters: [],
    error: false,
    min: "",
    max: "",
    lower: "",
    upper: "",
    files: [],
    data: "",
    step: "",
    allowedStep: ["preview", "download", "pipeline", "information"]
  };

  onChangeTime = values => {
    const lower = values[0] / 1000;
    const upper = values[1] / 1000;
    if (
      Math.round(lower) !== Math.round(this.state.lower) ||
      Math.round(upper) !== Math.round(this.state.upper)
    ) {
      this.setState({ lower, upper });
    }
  };

  getDropdowns = async () => {
    const { data: dropdown } = await axios.get(apiUrl + "/selectiontables");
    this.setState({
      dropdown
    });
  };

  getLabel = (input, id) => {
    const { dropdown } = this.state;
    try {
      return dropdown[input].find(x => x.id === id).name;
    } catch (e) {
      console.log(input, id, e);
      return "NA";
    }
  };

  parameterDetails = (dropdown, parameters, x) => {
    return dropdown.parameters.find(
      item => item.id === parameters[x].parameters_id
    );
  };

  async componentDidMount() {
    var { step, allowedStep } = this.state;
    const dataset_id = this.props.location.pathname.split("/").slice(-1)[0];
    let server = await Promise.all([
      axios.get(apiUrl + "/datasets/" + dataset_id),
      axios.get(apiUrl + "/files?datasets_id=" + dataset_id),
      axios.get(apiUrl + "/datasetparameters?datasets_id=" + dataset_id),
      axios.get(apiUrl + "/selectiontables")
    ]).catch(error => {
      this.setState({ error: true });
    });

    var dataset = server[0].data;
    var files = server[1].data;
    var parameters = server[2].data;
    var dropdown = server[3].data;

    // Add parameter details
    var details;
    for (var p in parameters) {
      try {
        details = this.parameterDetails(dropdown, parameters, p);
        parameters[p]["name"] = details.name;
        parameters[p]["characteristic"] = details.characteristic;
      } catch (err) {
        parameters[p]["name"] = null;
        parameters[p]["characteristic"] = null;
      }
    }

    // Logic for graphs
    var x = parameters.filter(param => param.axis === "x").length > 0;
    var y = parameters.filter(param => param.axis === "y").length > 0;
    var z = parameters.filter(param => param.axis === "z").length > 0;

    if (x && y && z) {
      allowedStep.push("heatmap");
      step = "heatmap";
    } else if (x && y) {
      allowedStep.push("linegraph");
      step = "linegraph";
    } else {
      step = "preview";
    }

    // Filter for only json files
    files = files.filter(file => file.filetype === "json");

    const { data } = await axios
      .get(apiUrl + "/files/" + files[0].id + "?get=raw")
      .catch(error => {
        this.setState({ error: true });
      });

    var xe = d3.extent(data.x),
      min = xe[0],
      max = xe[1],
      lower = xe[0],
      upper = xe[1];

    this.setState({
      dataset,
      parameters,
      files,
      data,
      min,
      max,
      lower,
      upper,
      dropdown,
      step,
      allowedStep
    });
  }

  updateSelectedState = step => {
    this.setState({ step });
  };

  render() {
    const {
      dataset,
      parameters,
      data,
      min,
      max,
      lower,
      upper,
      step,
      allowedStep
    } = this.state;
    document.title = dataset.title + " - Datalakes";
    const url = this.props.location.pathname.split("/").slice(-1)[0];
    var title = <h1>{dataset.title ? dataset.title : "Loading Data..."}</h1>;

    switch (step) {
      default:
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
            />
          </React.Fragment>
        );
      case "heatmap":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
            />
            <HeatMap
              onChange={this.onChangeTime}
              dataset={dataset}
              data={data}
              lower={lower}
              upper={upper}
              max={max}
              min={min}
            />
          </React.Fragment>
        );
      case "linegraph":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
            />
            <LineGraph
              onChange={this.onChangeTime}
              dataset={dataset}
              getLabel={this.getLabel}
              parameters={parameters}
              data={data}
              lower={lower}
              upper={upper}
              max={max}
              min={min}
            />
          </React.Fragment>
        );
      case "preview":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
            />
            <Preview
              data={data}
              getLabel={this.getLabel}
              parameters={parameters}
            />
          </React.Fragment>
        );
      case "download":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
            />
            <Download
              dataset={dataset}
              onChange={this.onChangeTime}
              getLabel={this.getLabel}
              lower={lower}
              upper={upper}
              max={max}
              min={min}
              url={url}
              apiUrl={apiUrl}
            />
          </React.Fragment>
        );
      case "pipeline":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
            />
            <Pipeline dataset={dataset} />
          </React.Fragment>
        );
      case "information":
        return (
          <React.Fragment>
            {title}
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
            />
            <Information
              dataset={dataset}
              parameters={parameters}
              getLabel={this.getLabel}
            />
          </React.Fragment>
        );
    }
  }
}

export default DataDetail;

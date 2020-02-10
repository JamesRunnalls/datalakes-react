import React, { Component } from "react";
import axios from "axios";
import * as d3 from "d3";
import { mergeWith } from "lodash";
import HeatMap from "./inner/heatmap";
import LineGraph from "./inner/linegraph";
import Download from "./inner/download";
import Information from "./inner/information";
import Pipeline from "./inner/pipeline";
import Preview from "./inner/preview";
import DataSubMenu from "./datasubmenu";
import Loading from "../../components/loading/loading";
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
    allowedStep: ["preview", "download", "pipeline", "information"],
    downloadNumber: 0,
    file: 0
  };

  async componentDidMount() {
    this._isMounted = true;
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

    // Sort by value (ascending)
    files.sort(this.numAscending);

    // Download first file
    var dataArray = [];
    var { data } = await axios
      .get(apiUrl + "/files/" + files[0].id + "?get=raw")
      .catch(error => {
        this.setState({ error: true });
      });
    dataArray.push(data);
    var { lower, upper, min, max } = this.dataBounds(dataArray);

    this.setState({
      dataset,
      parameters,
      files,
      data: dataArray,
      min,
      max,
      lower,
      upper,
      dropdown,
      step,
      allowedStep
    });

    // Download rest of files async
    //this.downloadData(dataArray, files, apiUrl, dataset, parameters);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Download data
  downloadData = async () => {
    this.downloadData = () => {}; // Only possible to fire once.
    var { data: dataArray, files, dataset, parameters } = this.state;
    for (var j = 1; j < files.length; j++) {
      var { data } = await axios
        .get(apiUrl + "/files/" + files[j].id + "?get=raw")
        .catch(error => {
          this.setState({ error: true });
        });
      dataArray.push(data);
      if (
        dataset.fileconnect === "time" &&
        parameters.find(p => p.parameters_id === 1).axis !== "M"
      ) {
        dataArray = [this.combineTimeseries(dataArray)];
      }
      var { lower, upper, min, max } = this.dataBounds(dataArray);
      if (this._isMounted) {
        this.setState({
          data: dataArray,
          downloadNumber: j + 1,
          min,
          max,
          upper,
          lower
        });
      } else {
        return false;
      }
    }
  };

  // Update state based on actions

  updateSelectedState = step => {
    this.setState({ step });
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

  onChangeFile = values => {
    var { data } = this.state;
    var file = values[0];
    if (file <= data.length) {
      this.setState({ file });
    }
  };

  onChangeUpper = value => {
    var upper = value.getTime() / 1000;
    this.setState({ upper });
  };

  onChangeLower = value => {
    var lower = value.getTime() / 1000;
    this.setState({ lower });
  };

  // Get data from API

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

  // Number functions

  numAscending = (a, b) => {
    var numA = parseFloat(a.value);
    var numB = parseFloat(b.value);
    var compare = 0;
    if (numA > numB) {
      compare = -1;
    } else if (numA < numB) {
      compare = 1;
    }
    return compare;
  };

  getAve = arr => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length || 0;
  };

  dataBounds = dataArray => {
    var xe = d3.extent(dataArray[0].x);
    var min = xe[0],
      max = xe[1],
      lower = xe[0],
      upper = xe[1];
    return { upper: upper, lower: lower, min: min, max: max };
  };

  combineTimeseries = arr => {
    arr.sort((a, b) => {
      return this.getAve(a.x) - this.getAve(b.x);
    });
    var combinedArr = arr[0];
    for (var i = 1; i < arr.length; i++) {
      combinedArr = mergeWith(combinedArr, arr[i], this.customizer);
    }
    return combinedArr;
  };

  customizer = (objValue, srcValue) => {
    return objValue.concat(srcValue);
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
      allowedStep,
      files,
      file,
      downloadNumber
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
            <table className="loading-table">
              <tbody>
                <tr>
                  <td>
                    <Loading />
                    <h3>Downloading Data</h3>
                  </td>
                </tr>
              </tbody>
            </table>
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
              onChangeTime={this.onChangeTime}
              onChangeFile={this.onChangeFile}
              onChangeLower={this.onChangeLower}
              onChangeUpper={this.onChangeUpper}
              dataset={dataset}
              getLabel={this.getLabel}
              parameters={parameters}
              data={data}
              lower={lower}
              upper={upper}
              max={max}
              min={min}
              files={files}
              file={file}
              downloadNumber={downloadNumber}
              downloadData={this.downloadData}
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
              onChangeLower={this.onChangeLower}
              onChangeUpper={this.onChangeUpper}
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

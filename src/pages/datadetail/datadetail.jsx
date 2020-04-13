import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import * as d3 from "d3";
import { mergeWith } from "lodash";
import HeatMap from "./inner/heatmap";
import LineGraph from "./inner/linegraph";
import Download from "./inner/download";
import Information from "./inner/information";
import Pipeline from "./inner/pipeline";
import External from './inner/external';
import Preview from "./inner/preview";
import DataSubMenu from "./datasubmenu";
import Loading from "../../components/loading/loading";
import { apiUrl } from "../../../src/config.json";
import "./datadetail.css";

class DataDetail extends Component {
  state = {
    selection: "",
    dataset: [],
    parameters: [],
    error: false,
    mindatetime: "",
    maxdatetime: "",
    mindepth: "",
    maxdepth: "",
    lower: "",
    upper: "",
    files: [],
    data: "",
    step: "",
    allowedStep: ["preview", "download", "pipeline", "information"],
    file: 0,
    innerLoading: false,
    combined: [],
  };

  async componentDidMount() {
    this._isMounted = true;
    var { step, allowedStep } = this.state;
    const dataset_id = this.props.location.pathname.split("/").slice(-1)[0];
    let server = await Promise.all([
      axios.get(apiUrl + "/datasets/" + dataset_id),
      axios.get(apiUrl + "/files?datasets_id=" + dataset_id),
      axios.get(apiUrl + "/datasetparameters?datasets_id=" + dataset_id),
      axios.get(apiUrl + "/selectiontables"),
    ]).catch((error) => {
      this.setState({ step: "error" });
    });

    var dataset = server[0].data;
    var files = server[1].data;
    var parameters = server[2].data;
    var dropdown = server[3].data;

    // Internal vs External Data source
    if (dataset.datasource === "internal") {
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
      var x = parameters.filter((param) => param.axis === "x").length > 0;
      var y = parameters.filter((param) => param.axis === "y").length > 0;
      var z = parameters.filter((param) => param.axis === "z").length > 0;

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
      files = files.filter((file) => file.filetype === "json");

      // Get add average time
      files = this.addAverageTime(files);

      // Sort by value (descending)
      files.sort(this.numDescending);

      // Get min and max
      var { mindatetime, maxdatetime, mindepth, maxdepth } = dataset;
      mindatetime = new Date(mindatetime).getTime() / 1000;
      maxdatetime = new Date(maxdatetime).getTime() / 1000;

      // Download first file
      var dataArray = new Array(files.length).fill(0);
      var { data } = await axios
        .get(apiUrl + "/files/" + files[0].id + "?get=raw")
        .catch((error) => {
          this.setState({ step: "error" });
        });
      dataArray[0] = data;
      var combined = data;
      var { lower, upper } = this.dataBounds(dataArray);

      // Get Renku Data
      var renku = false;
      if (dataset.renku === 0){
        ({ data: renku } = await axios
        .post(apiUrl + "/renku",{url:dataset.datasourcelink})
        .catch((error) => {
          renku = false
        }));
      }

      this.setState({
        renku,
        dataset,
        parameters,
        files,
        data: dataArray,
        mindatetime,
        maxdatetime,
        mindepth,
        maxdepth,
        lower,
        upper,
        dropdown,
        step,
        allowedStep,
        combined,
      });
    } else {
      this.setState({
        dataset,
        parameters,
        dropdown,
        files,
        step: "external",
        allowedStep: ["external"],
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Download data

  downloadData = async () => {
    this.downloadData = () => {}; // Only possible to fire once.
    var { data: dataArray, files, combined } = this.state;
    for (var j = 0; j < files.length; j++) {
      if (dataArray[j] === 0) {
        var { data } = await axios
          .get(apiUrl + "/files/" + files[j].id + "?get=raw")
          .catch((error) => {
            this.setState({ error: true });
          });
        dataArray[j] = data;
        if (files[0].connect === "join") {
          combined = this.combineTimeseries(dataArray);
        }
        if (this._isMounted) {
          this.setState({
            data: dataArray,
            combined,
          });
        } else {
          return false;
        }
      }
    }
  };

  downloadFile = async (index) => {
    var { data: dataArray, files } = this.state;
    var { data } = await axios
      .get(apiUrl + "/files/" + files[index].id + "?get=raw")
      .catch((error) => {
        this.setState({ error: true });
      });
    dataArray[index] = data;
    if (this._isMounted) {
      this.setState({
        data: dataArray,
        innerLoading: false,
      });
    } else {
      return false;
    }
  };

  downloadMultipleFiles = async (arr) => {
    var { data: dataArray, files, combined } = this.state;
    for (var j = 0; j < arr.length; j++) {
      if (dataArray[arr[j]] === 0) {
        var { data } = await axios
          .get(apiUrl + "/files/" + files[arr[j]].id + "?get=raw")
          .catch((error) => {
            this.setState({ error: true });
          });
        dataArray[arr[j]] = data;
      }
    }
    if (files[0].connect === "join") {
      combined = this.combineTimeseries(dataArray);
    }
    if (this._isMounted) {
      this.setState({
        data: dataArray,
        innerLoading: false,
        combined,
      });
    } else {
      return false;
    }
  };
  // Update state based on actions

  updateSelectedState = (step) => {
    this.setState({ step });
  };

  onChangeFileInt = (values) => {
    var { file: oldFile, data } = this.state;
    var file = values;
    if (file !== oldFile && this.isInt(file)) {
      if (file >= 0 && file <= data.length) {
        if (data[file] === 0) {
          this.setState({ file, innerLoading: true });
          this.downloadFile(file);
        } else {
          this.setState({ file });
        }
      }
    }
  };

  onChangeFile = (values) => {
    var { files, file: oldFile, data } = this.state;
    let filedict = files.map((a) => a.ave.getTime());
    var file = this.closest(values[0], filedict);
    if (file !== oldFile && this.isInt(values[0])) {
      if (data[file] === 0) {
        this.setState({ file, innerLoading: true });
        this.downloadFile(file);
      } else {
        this.setState({ file });
      }
    }
  };

  selectedFiles = (upper, lower, files, data) => {
    if (data === "download") {
      data = new Array(files.length).fill(0);
    }
    var fileList = [];
    for (var i = 0; i < files.length; i++) {
      if ((new Date(files[i].mindatetime).getTime() / 1000) < upper && (new Date(files[i].maxdatetime).getTime() / 1000) > lower && data[i] === 0) {
        fileList.push(i);
      }
    }
    return fileList;
  };

  onChangeTime = (values) => {
    var { files, data } = this.state;
    const lower = values[0] / 1000;
    const upper = values[1] / 1000;
    if (
      Math.round(lower) !== Math.round(this.state.lower) ||
      Math.round(upper) !== Math.round(this.state.upper)
    ) {
      var toDownload = this.selectedFiles(upper, lower, files, data);
      if (toDownload.length > 0) {
        this.setState({ innerLoading: true });
        this.downloadMultipleFiles(toDownload);
      }
      this.setState({ lower, upper });
    }
  };

  onChangeUpper = (value) => {
    var { files, data, lower } = this.state;
    var upper = value.getTime() / 1000;
    var toDownload = this.selectedFiles(upper, lower, files, data);
    if (toDownload.length > 0) {
      this.setState({ innerLoading: true });
      this.downloadMultipleFiles(toDownload);
    }
    this.setState({ upper });
  };

  onChangeLower = (value) => {
    var { files, data, upper } = this.state;
    var lower = value.getTime() / 1000;
    var toDownload = this.selectedFiles(upper, lower, files, data);
    if (toDownload.length > 0) {
      this.setState({ innerLoading: true });
      this.downloadMultipleFiles(toDownload);
    }
    this.setState({ lower });
  };

  // Get data from API

  getDropdowns = async () => {
    const { data: dropdown } = await axios.get(apiUrl + "/selectiontables");
    this.setState({
      dropdown,
    });
  };

  getLabel = (input, id, prop) => {
    const { dropdown } = this.state;
    try {
      return dropdown[input].find((x) => x.id === id)[prop];
    } catch (e) {
      console.error(input, id, e);
      return "NA";
    }
  };

  parameterDetails = (dropdown, parameters, x) => {
    return dropdown.parameters.find(
      (item) => item.id === parameters[x].parameters_id
    );
  };

  // Number functions

  closest = (num, arr) => {
    var diff = Infinity;
    var index = 0;
    for (var i = 0; i < arr.length; i++) {
      var newdiff = Math.abs(num - arr[i]);
      if (newdiff < diff) {
        diff = newdiff;
        index = i;
      }
    }
    return index;
  };

  isInt = (value) => {
    if (/^[-+]?(\d+|Infinity)$/.test(value)) {
      return true;
    } else {
      return false;
    }
  };

  numDescending = (a, b) => {
    var numA = a.ave.getTime();
    var numB = b.ave.getTime();
    var compare = 0;
    if (numA > numB) {
      compare = -1;
    } else if (numA < numB) {
      compare = 1;
    }
    return compare;
  };

  dataBounds = (dataArray) => {
    var xe = d3.extent(dataArray[0].x);
    var lower = xe[0],
      upper = xe[1];
    return { upper: upper, lower: lower };
  };

  addAverageTime = (array) => {
    for (var i = 0; i < array.length; i++) {
      array[i].ave = new Date(
        (parseFloat(new Date(array[i].mindatetime).getTime()) +
          parseFloat(new Date(array[i].maxdatetime).getTime())) /
          2
      );
    }
    return array;
  };

  fileBounds = (array) => {
    var min = Math.min.apply(
      Math,
      array.map(function (o) {
        return o.min;
      })
    );
    var max = Math.max.apply(
      Math,
      array.map(function (o) {
        return o.max;
      })
    );
    return { min: min, max: max };
  };

  getAve = (arr) => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length || 0;
  };

  getMax = (arr) => {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
      max = arr[len] > max ? arr[len] : max;
    }
    return max;
  };

  getMin = (arr) => {
    let len = arr.length;
    let min = Infinity;

    while (len--) {
      min = arr[len] < min ? arr[len] : min;
    }
    return min;
  };

  combineTimeseries = (arr) => {
    var arrCopy = Object.values(Object.assign({}, arr));
    arrCopy = arrCopy.filter(function (value) {
      return value !== 0;
    });
    arrCopy.sort((a, b) => {
      return this.getAve(a.x) - this.getAve(b.x);
    });

    var combinedArr = Object.assign({}, arrCopy[0]);
    for (var i = 1; i < arrCopy.length; i++) {
      combinedArr = mergeWith(combinedArr, arrCopy[i], this.customizer);
    }
    return combinedArr;
  };

  customizer = (objValue, srcValue) => {
    return objValue.concat(srcValue);
  };

  render() {
    const {
      renku,
      dataset,
      parameters,
      data,
      mindatetime,
      maxdatetime,
      lower,
      upper,
      step,
      allowedStep,
      files,
      file,
      innerLoading,
      combined,
    } = this.state;
    document.title = dataset.title
      ? dataset.title + " - Datalakes"
      : "Datalakes";

    switch (step) {
      default:
        return (
          <React.Fragment>
            <table className="loading-table">
              <tbody>
                <tr>
                  <td>
                    <Loading />
                    <h3>Loading Data</h3>
                  </td>
                </tr>
              </tbody>
            </table>
          </React.Fragment>
        );
      case "heatmap":
        return (
          <React.Fragment>
            <h1>{dataset.title}</h1>
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
              max={maxdatetime}
              min={mindatetime}
            />
          </React.Fragment>
        );
      case "linegraph":
        return (
          <React.Fragment>
            <h1>{dataset.title}</h1>
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
            />
            <LineGraph
              onChangeTime={this.onChangeTime}
              onChangeFile={this.onChangeFile}
              onChangeFileInt={this.onChangeFileInt}
              onChangeLower={this.onChangeLower}
              onChangeUpper={this.onChangeUpper}
              dataset={dataset}
              getLabel={this.getLabel}
              parameters={parameters}
              data={data}
              lower={lower}
              upper={upper}
              max={maxdatetime}
              min={mindatetime}
              files={files}
              file={file}
              downloadData={this.downloadData}
              loading={innerLoading}
              combined={combined}
            />
          </React.Fragment>
        );
      case "preview":
        return (
          <React.Fragment>
            <h1>{dataset.title}</h1>
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
            <h1>{dataset.title}</h1>
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
            />
            <Download
              dataset={dataset}
              files={files}
              selectedFiles={this.selectedFiles}
              getLabel={this.getLabel}
              max={maxdatetime}
              min={mindatetime}
              apiUrl={apiUrl}
            />
          </React.Fragment>
        );
      case "pipeline":
        return (
          <React.Fragment>
            <h1>{dataset.title}</h1>
            <DataSubMenu
              step={step}
              allowedStep={allowedStep}
              updateSelectedState={this.updateSelectedState}
            />
            <Pipeline dataset={dataset} renku={renku} />
          </React.Fragment>
        );
      case "information":
        return (
          <React.Fragment>
            <h1>{dataset.title}</h1>
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
      case "external":
        return (
          <React.Fragment>
            <h1>{dataset.title}</h1>
            <External
              dataset={dataset}
              parameters={parameters}
              getLabel={this.getLabel}
            />
          </React.Fragment>
        );
      case "error":
        return (
          <React.Fragment>
            <table className="loading-table">
              <tbody>
                <tr>
                  <td>
                    <h3>Error that dataset could not be found.</h3>
                    <Link to="/dataportal">
                      <h2>Head back to the data portal</h2>
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </React.Fragment>
        );
    }
  }
}

export default DataDetail;

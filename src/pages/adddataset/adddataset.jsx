import React, { Component } from "react";
import "./adddataset.css";
import axios from "axios";
import Fuse from "fuse.js";
import { apiUrl } from "../../../config.json";
import AddData from "./steps/adddata";
import ReviewData from "./steps/reviewdata";
import ReviewLineage from "./steps/reviewlineage";
import AddMetadata from "./steps/addmetadata";
import Publish from "./steps/publish";
import ProgressBar from "./progressbar";

class AddDataset extends Component {
  state = {
    step: 1,
    allowedStep: [1, 1, 1, 1, 1],
    fileInformation: "",
    renkuResponse: "",
    dropdown: {},
    dataset: {
      id: "",
      git: "",
      start_time: "",
      end_time: "",
      latitude: "",
      longitude: "",
      depth: "",
      lakes_id: "",
      persons_id: "",
      projects_id: "",
      organisations_id: "",
      title: "",
      renku: "",
      pre_file: "",
      pre_script: "",
      licenses_id: "",
      citation: "",
      liveconnect: "false",
      fileconnect: "no",
      repository_id: ""
    },
    datasetparameters: [],
    files_list: [],
    file: {}
  };

  getDropdowns = async () => {
    const { data: dropdown } = await axios.get(apiUrl + "/selectiontables");
    this.setState({
      dropdown
    });
  };

  componentDidMount() {
    this.getDropdowns();
  }

  // 1) Process input file
  validateFile = async () => {
    var { dataset, step, dropdown } = this.state;

    // Add blank row to datasets table
    var { data: data1 } = await axios
      .post(apiUrl + "/datasets", {})
      .catch(error => {
        console.error(error.message);
        this.setState({ allowedStep: [1, 0, 0, 0, 0] });
        throw new Error("Process failed please try again");
      });

    // Clone git repo and add files to files table
    var reqObj = this.parseUrl(dataset.git);
    reqObj["id"] = data1.id;
    var { data: data2 } = await axios
      .post(apiUrl + "/sparsegitclone", reqObj)
      .catch(error => {
        console.error(error.message);
        this.setState({ allowedStep: [1, 0, 0, 0, 0] });
        throw new Error("Unable to clone repository please try again.");
      });

    // Parse variable and attribute information from incoming file
    var { repo_id, file, files } = data2;
    if (file) {
      var { data: fileInformation } = await axios
        .get(apiUrl + "/files/" + file.id + "?get=metadata")
        .catch(error => {
          console.error(error.message);
          this.setState({ allowedStep: [1, 0, 0, 0, 0] });
          throw new Error(
            "Failed to parse file please check the file structure and try again."
          );
        });
    } else {
      this.setState({ allowedStep: [1, 0, 0, 0, 0] });
      throw new Error(
        "File not found in repository please check the link and try again."
      );
    }
    dataset["id"] = reqObj.id;
    dataset["repository_id"] = repo_id;

    // Set initial dataset parameters
    var datasetparameters = this.setDatasetParameters(
      fileInformation,
      dropdown
    );

    this.setState({
      allowedStep: [1, 2, 0, 0, 0],
      fileInformation: fileInformation,
      step: step + 1,
      dataset,
      datasetparameters,
      files_list: files,
      file: file
    });
    return;
  };

  // 2) Validate data parse and get lineage from Renku

  validateData = async () => {
    const { step, datasetparameters, dataset, file, files_list } = this.state;

    // Clean folder
    await axios.get(apiUrl + "/files/clean/" + dataset.id).catch(error => {
      console.error(error.message);
    });

    // Check all table filled
    for (var row of datasetparameters) {
      if (!this.noEmptyString(row)) {
        this.setState({ allowedStep: [1, 2, 0, 0, 0] });
        throw new Error("Please complete all the fields.");
      }
    }

    // Lineage from Renku
    var { data: renkuData } = await axios
      .get(apiUrl + "/renku/" + encodeURIComponent(dataset.git))
      .catch(error => {
        console.error(error.message);
        this.setState({ allowedStep: [1, 2, 0, 0, 0] });
        throw new Error(
          "There was an error connecting to the Renku API please try again."
        );
      });
    dataset["renku"] = 1;
    if ("data" in renkuData) {
      if (renkuData.data.lineage !== null) {
        dataset["renku"] = 0;
        dataset["pre_file"] = "NA";
        dataset["pre_script"] = "NA";
      }
    }

    // Set real axis values
    var axis = [];
    var parseAxis;
    var updateAxis;
    var j;
    for (var i = 0; i < datasetparameters.length; i++) {
      if (datasetparameters[i]["included"]) {
        parseAxis = datasetparameters[i]["axis"];
        updateAxis = parseAxis;
        j = 1;
        while (axis.includes(updateAxis)) {
          updateAxis = parseAxis + j;
          j++;
        }
        axis.push(updateAxis);
        datasetparameters[i]["rAxis"] = updateAxis;
      }
    }

    // Convert single or multiple files
    if (dataset.fileconnect === "no" || dataset.fileconnect === "mix") {
      const { id } = file;
      var data = await this.convertFile(
        apiUrl,
        id,
        datasetparameters,
        dataset.fileconnect
      );
      var { start_time, end_time, depth, longitude, latitude } = data;
    } else {
      var arr_start_time = [];
      var arr_end_time = [];
      var arr_depth = [];
      var arr_longitude = [];
      var arr_latitude = [];
      for (var k = 0; k < files_list.length; k++) {
        data = await this.convertFile(
          apiUrl,
          files_list[k].id,
          datasetparameters,
          dataset.fileconnect
        );
        arr_start_time.push(data.start_time);
        arr_end_time.push(data.end_time);
        arr_depth.push(data.depth);
        arr_longitude.push(data.longitude);
        arr_latitude.push(data.latitude);
      }
      start_time = this.getMin(arr_start_time);
      end_time = this.getMax(arr_end_time);
      depth = this.allEqual() ? arr_depth[0] : this.getAve(arr_depth);
      longitude = this.getAve(arr_longitude);
      latitude = this.getAve(arr_latitude);
    }

    // Logic for continuing to next step
    dataset["start_time"] = start_time;
    dataset["end_time"] = end_time;
    dataset["depth"] = depth;
    dataset["longitude"] = longitude;
    dataset["latitude"] = latitude;
    this.setState({
      renkuResponse: renkuData,
      datasetparameters,
      allowedStep: [1, 2, 3, 0, 0],
      dataset,
      step: step + 1
    });
    return;
  };

  convertFile = async (apiUrl, id, datasetparameters, fileconnect) => {
    var { data } = await axios
      .post(apiUrl + "/convert", {
        id: id,
        variables: datasetparameters,
        fileconnect: fileconnect
      })
      .catch(error => {
        console.error(error.message);
        this.setState({ allowedStep: [1, 2, 0, 0, 0] });
        throw new Error(
          "Unable to convert file to JSON format. Please contact the developer."
        );
      });
    return data;
  };

  // 3) Validate lineage

  validateLineage = async () => {
    const { dataset, step } = this.state;
    if (dataset["pre_script"] !== "" && dataset["pre_file"] !== "") {
      this.setState({ allowedStep: [1, 2, 3, 4, 0], step: step + 1 });
    } else {
      throw new Error("Please complete all the fields.");
    }
    return;
  };

  // 4) Validate metadata

  validateMetadata = async () => {
    const { dataset, step } = this.state;
    if (this.noEmptyString(dataset)) {
      this.setState({ allowedStep: [1, 2, 3, 4, 5], step: step + 1 });
    } else {
      throw new Error("Please complete all the fields.");
    }
  };

  // 5) Publish

  publish = async () => {
    const { dataset, datasetparameters } = this.state;
    await axios
      .post(apiUrl + "/datasetparameters", {
        id: dataset.id,
        datasetparameters: datasetparameters
      })
      .catch(error => {
        throw new Error("Failed to publish please try again.");
      });
    await axios.put(apiUrl + "/datasets", dataset).catch(error => {
      throw new Error("Failed to publish please try again.");
    });
    window.location.href = "/datadetail/" + dataset.id;
  };

  // Progress Bar

  prevStep = () => {
    const { step } = this.state;
    this.setState({
      step: step - 1
    });
  };

  setStep = step => {
    if (step !== 0) {
      this.setState({ step });
    }
  };

  // Check nothing in dictionary is empty string
  noEmptyString = dict => {
    var out = true;
    for (var key of Object.keys(dict)) {
      if (dict[key] === "") {
        out = false;
      }
    }
    return out;
  };

  // Parse url
  parseUrl = url => {
    var ssh;
    var dir;
    var branch;
    var file;
    if (url.includes("renkulab.io/gitlab")) {
      const path = url.split("/blob/")[1].split("/");
      const loc = url.split("/blob/")[0].split("/");
      const repo = loc[loc.length - 1];
      branch = path[0];
      ssh =
        "git@renkulab.io:" +
        url
          .split("/blob/")[0]
          .split("renkulab.io/gitlab/")
          .pop();
      dir = path.slice(1, path.length - 1);
      dir.unshift(repo);
      dir = dir.join("/");
      file = path[path.length - 1];
    }
    return {
      ssh: ssh,
      dir: dir,
      branch: branch,
      file: file
    };
  };

  fuseSearch = (keys, list, find) => {
    var options = {
      keys: keys,
      shouldSort: true,
      threshold: 0.9,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1
    };
    var fuse = new Fuse(list, options);
    var match = find.split("_").join(" ");
    var search = fuse.search(match);
    var defaultValue = "";
    if (search.length !== 0) {
      defaultValue = search[0].id;
    }
    return defaultValue;
  };

  findUnits = (parameters, defaultParameter) => {
    return parameters.find(x => x.id === defaultParameter).unit;
  };

  getMax = arr => {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
      max = arr[len] > max ? arr[len] : max;
    }
    return max;
  };

  getMin = arr => {
    let len = arr.length;
    let min = Infinity;

    while (len--) {
      min = arr[len] < min ? arr[len] : min;
    }
    return min;
  };

  getAve = arr => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length || 0;
  };

  allEqual = arr => {
    try {
      return arr.every(v => v === arr[0]);
    } catch (e) {
      return "";
    }
  };

  setDatasetParameters = (fileInformation, dropdown) => {
    const { parameters, sensors } = dropdown;
    const { variables, attributes } = fileInformation;

    // Initial data parse and auto field matching
    var parseParameter = "";
    var parseUnit = "";
    var parseSensor = "";
    var variableAttributes = "";
    var variable = {};
    var datasetparameters = [];

    // Loop over variables in nc file
    for (var key in variables) {
      parseParameter = key;
      parseUnit = "NA";
      parseSensor = "NA";
      variableAttributes = variables[key].attributes;

      // Look for names in nc file.
      if ("units" in variableAttributes) {
        parseUnit = variableAttributes["units"].value;
      }
      if ("standard_name" in variableAttributes) {
        parseParameter = variableAttributes["standard_name"].value;
      }
      if ("long_name" in variableAttributes) {
        parseParameter = variableAttributes["long_name"].value;
      }
      if ("sensor" in attributes) {
        parseSensor = attributes["sensor"].value;
      }

      // Search for matching names in database to define default values
      var defaultParameter = this.fuseSearch(
        ["name"],
        parameters,
        parseParameter
      );

      var defaultSensor = this.fuseSearch(["name"], sensors, parseSensor);
      var defaultAxis = "y";

      // Fallback to parameter units if none provided in nc file
      var defaultUnit;
      if (parseUnit === "NA") {
        defaultUnit = this.findUnits(parameters, defaultParameter);
      } else {
        defaultUnit = parseUnit;
      }

      // Logic for default axis assignment
      if (defaultParameter === 1) {
        defaultAxis = "x";
      }

      // Summarise data
      variable = {
        parseParameter: key,
        parseUnit: parseUnit,
        parseSensor: parseSensor,
        parameters_id: defaultParameter,
        unit: defaultUnit,
        axis: defaultAxis,
        sensors_id: defaultSensor,
        included: true
      };
      datasetparameters.push(variable);
    }
    return datasetparameters;
  };

  // Handle changes to inputs

  handleChange = input => event => {
    var values = this.state.values;
    values[input] = event.target.value;
    this.setState({ values });
  };

  handleDataset = input => event => {
    var dataset = this.state.dataset;
    dataset[input] = event.value ? event.value : event.target.value;
    this.setState({ dataset });
  };

  handleParameter = (a, b) => event => {
    var datasetparameters = this.state.datasetparameters;
    datasetparameters[a][b] = event.value ? event.value : event.target.value;
    this.setState({ datasetparameters });
  };

  handleParameterCheck = (a, b) => event => {
    var { datasetparameters, dataset } = this.state;
    datasetparameters[a][b] = !datasetparameters[a][b];
    dataset.fileconnect = "no";
    this.setState({ datasetparameters, dataset });
  };

  render() {
    document.title = "Add Data - Datalakes";
    const {
      step,
      allowedStep,
      fileInformation,
      renkuResponse,
      dropdown,
      dataset,
      datasetparameters,
      files_list
    } = this.state;

    switch (step) {
      default:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <AddData
              nextStep={this.validateFile}
              handleChange={this.handleDataset}
              dataset={dataset}
            />
          </React.Fragment>
        );
      case 1:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <AddData
              nextStep={this.validateFile}
              handleChange={this.handleDataset}
              dataset={dataset}
            />
          </React.Fragment>
        );
      case 2:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <ReviewData
              datasetparameters={datasetparameters}
              dropdown={dropdown}
              fileconnect={dataset.fileconnect}
              liveconnect={dataset.liveconnect}
              fileInformation={fileInformation}
              files_list={files_list}
              nextStep={this.validateData}
              prevStep={this.prevStep}
              handleSelect={this.handleParameter}
              handleChange={this.handleParameter}
              handleDataset={this.handleDataset}
              handleCheck={this.handleParameterCheck}
              getDropdowns={this.getDropdowns}
            />
          </React.Fragment>
        );
      case 3:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <ReviewLineage
              dataset={dataset}
              renkuResponse={renkuResponse}
              nextStep={this.validateLineage}
              prevStep={this.prevStep}
              handleChange={this.handleDataset}
            />
          </React.Fragment>
        );
      case 4:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <AddMetadata
              dataset={dataset}
              dropdown={dropdown}
              nextStep={this.validateMetadata}
              prevStep={this.prevStep}
              handleChange={this.handleDataset}
              handleSelect={this.handleDataset}
              getDropdowns={this.getDropdowns}
            />
          </React.Fragment>
        );
      case 5:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <Publish
              nextStep={this.publish}
              prevStep={this.prevStep}
              datasetparameters={datasetparameters}
              dataset={dataset}
              dropdown={dropdown}
            />
          </React.Fragment>
        );
    }
  }
}

export default AddDataset;

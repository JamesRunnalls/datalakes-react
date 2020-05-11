import React, { Component } from "react";
import "./adddataset.css";
import axios from "axios";
import Fuse from "fuse.js";
import { apiUrl } from "../../../src/config.json";
import AddData from "./steps/adddata";
import ReviewData from "./steps/reviewdata";
import ReviewLineage from "./steps/reviewlineage";
import AddMetadata from "./steps/addmetadata";
import Publish from "./steps/publish";
import ProgressBar from "./progressbar";

class AddDataset extends Component {
  state = {
    step: 3,
    allowedStep: [1, 2, 3, 1, 1],
    allFiles: [
      "git/12/introduction-to-datalakes-data-processing/Dockerfile",
      "git/12/introduction-to-datalakes-data-processing/README.md",
      "git/12/introduction-to-datalakes-data-processing/data/Lexplore_WeatherData-Copy1.dat",
      "git/12/introduction-to-datalakes-data-processing/data/Lexplore_WeatherData.dat",
      "git/12/introduction-to-datalakes-data-processing/data/output/lexploreweather.nc",
      "git/12/introduction-to-datalakes-data-processing/data/output/lexploreweather2.nc",
      "git/12/introduction-to-datalakes-data-processing/environment.yml",
      "git/12/introduction-to-datalakes-data-processing/notebooks/process.py",
      "git/12/introduction-to-datalakes-data-processing/papers/Physical_Limnology.pdf",
      "git/12/introduction-to-datalakes-data-processing/requirements.txt",
    ],
    fileInformation: "",
    renkuResponse: "",
    dropdown: {},
    dataset: {
      id: "",
      title: "",
      description: "",
      origin: "measurement",
      mapplot: "marker",
      mapplotfunction: "gitPlot",
      datasource: "internal",
      datasourcelink: "",
      plotproperties: {
        colors: "Rainbow",
        markerLabel: true,
        markerSymbol: "circle",
        markerFixedSize: true,
        markerSize: 10,
        vectorMagnitude: false,
        vectorArrows: false,
        vectorFlow: false,
        vectorArrowColor: false,
        vectorFlowColor: false,
        legend: false,
      },
      citation: "",
      downloads: 0,
      fileconnect: "false",
      liveconnect: "no",
      renku: "",
      accompanyingdata: [],
      mindatetime: "",
      maxdatetime: "",
      latitude: "",
      longitude: "",
      licenses_id: "",
      organisations_id: "",
      repositories_id: "",
      lakes_id: "",
      persons_id: "",
      projects_id: "",
      embargo: 0,
      password: "none",
    },
    datasetparameters: [],
    files_list: [],
    file: {},
  };

  // 0) Get dropdowns

  getDropdowns = async () => {
    const { data: dropdown } = await axios.get(apiUrl + "/selectiontables");
    this.setState({
      dropdown,
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
      .catch((error) => {
        console.error(error.message);
        this.setState({ allowedStep: [1, 0, 0, 0, 0] });
        throw new Error("Process failed please try again");
      });

    // Clone git repo and add files to files table
    var reqObj = this.parseUrl(dataset.datasourcelink);
    reqObj["id"] = data1.id;
    var { data: data2 } = await axios
      .post(apiUrl + "/gitclone", reqObj)
      .catch((error) => {
        console.error(error.message);
        this.setState({ allowedStep: [1, 0, 0, 0, 0] });
        throw new Error("Unable to clone repository please try again.");
      });

    // Parse variable and attribute information from incoming file
    var { repo_id, file, files, allFiles } = data2;
    if (file) {
      var { data: fileInformation } = await axios
        .get(apiUrl + "/files/" + file.id + "?get=metadata")
        .catch((error) => {
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
    dataset["repositories_id"] = repo_id;

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
      allFiles,
      datasetparameters,
      files_list: files,
      file,
    });
    return;
  };

  // 2) Validate data parse and get lineage from Renku

  validateData = async () => {
    var { step, datasetparameters, dataset, file, files_list } = this.state;

    // Clean folder
    await axios.get(apiUrl + "/files/clean/" + dataset.id).catch((error) => {
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
    dataset["renku"] = 1;
    var allowedStep = [1, 2, 3, 0, 0];
    step = step + 1;
    var { data: renkuData } = await axios
      .get(apiUrl + "/renku/" + encodeURIComponent(dataset.datasourcelink))
      .catch((error) => {
        console.error(error.message);
      });
    if ("data" in renkuData) {
      if (renkuData.data.lineage !== null) {
        dataset["renku"] = 0;
        allowedStep = [1, 2, 3, 0, 0];
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
      var {
        mindatetime,
        maxdatetime,
        mindepth,
        maxdepth,
        longitude,
        latitude,
      } = data;
    } else {
      var arr_mindatetime = [];
      var arr_maxdatetime = [];
      var arr_mindepth = [];
      var arr_maxdepth = [];
      var arr_longitude = [];
      var arr_latitude = [];
      for (var k = 0; k < files_list.length; k++) {
        data = await this.convertFile(
          apiUrl,
          files_list[k].id,
          datasetparameters,
          dataset.fileconnect
        );
        arr_mindatetime.push(data.mindatetime);
        arr_maxdatetime.push(data.maxdatetime);
        if (data.mindepth < -2) arr_mindepth.push(data.mindepth);
        if (data.mindepth > 200) arr_maxdepth.push(data.maxdepth);
        arr_longitude.push(data.longitude);
        arr_latitude.push(data.latitude);
      }
      mindatetime = this.getMin(arr_mindatetime);
      maxdatetime = this.getMax(arr_maxdatetime);
      mindepth = this.getMin(arr_mindepth);
      maxdepth = this.getMax(arr_maxdepth);
      longitude = this.getAve(arr_longitude);
      latitude = this.getAve(arr_latitude);
    }

    // Logic for continuing to next step
    dataset["mindatetime"] = mindatetime;
    dataset["maxdatetime"] = maxdatetime;
    dataset["mindepth"] = mindepth;
    dataset["maxdepth"] = maxdepth;
    dataset["longitude"] = longitude;
    dataset["latitude"] = latitude;
    this.setState({
      renkuResponse: renkuData,
      datasetparameters,
      dataset,
      allowedStep,
      step,
    });
    return;
  };

  convertFile = async (apiUrl, id, datasetparameters, fileconnect) => {
    var { data } = await axios
      .post(apiUrl + "/convert", {
        id: id,
        variables: datasetparameters,
        fileconnect: fileconnect,
      })
      .catch((error) => {
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
    if (dataset["accompanyingdata"].length > 0) {
      this.setState({ allowedStep: [1, 2, 3, 4, 0], step: step + 1 });
    } else {
      throw new Error("Please add some files.");
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
        datasetparameters: datasetparameters,
      })
      .catch((error) => {
        throw new Error("Failed to publish please try again.");
      });
    await axios.put(apiUrl + "/datasets", dataset).catch((error) => {
      throw new Error("Failed to publish please try again.");
    });
    window.location.href = "/datadetail/" + dataset.id;
  };

  // Progress Bar

  prevStep = () => {
    const { step } = this.state;
    this.setState({
      step: step - 1,
    });
  };

  setStep = (step) => {
    if (step !== 0) {
      this.setState({ step });
    }
  };

  // Check nothing in dictionary is empty string
  noEmptyString = (dict) => {
    var out = true;
    for (var key of Object.keys(dict)) {
      if (dict[key] === "") {
        out = false;
      }
    }
    return out;
  };

  // Parse url
  parseUrl = (url) => {
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
        url.split("/blob/")[0].split("renkulab.io/gitlab/").pop() +
        ".git";
      dir = path.slice(1, path.length - 1);
      dir.unshift(repo);
      dir = dir.join("/");
      file = path[path.length - 1];
    }
    return {
      ssh: ssh,
      dir: dir,
      branch: branch,
      file: file,
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
      minMatchCharLength: 1,
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
    return parameters.find((x) => x.id === defaultParameter).unit;
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

  getAve = (arr) => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length || 0;
  };

  allEqual = (arr) => {
    try {
      return arr.every((v) => v === arr[0]);
    } catch (e) {
      return "";
    }
  };

  setDatasetParameters = (fileInformation, dropdown) => {
    const { parameters, sensors } = dropdown;
    const { variables, attributes } = fileInformation;

    // Initial data parse and auto field matching
    var parseparameter = "";
    var parseUnit = "";
    var parseSensor = "";
    var variableAttributes = "";
    var variable = {};
    var datasetparameters = [];

    // Loop over variables in nc file
    for (var key in variables) {
      parseparameter = key;
      parseUnit = "NA";
      parseSensor = "NA";
      variableAttributes = variables[key].attributes;

      // Look for names in nc file.
      if ("units" in variableAttributes) {
        parseUnit = variableAttributes["units"].value;
      }
      if ("standard_name" in variableAttributes) {
        parseparameter = variableAttributes["standard_name"].value;
      }
      if ("long_name" in variableAttributes) {
        parseparameter = variableAttributes["long_name"].value;
      }
      if ("sensor" in attributes) {
        parseSensor = attributes["sensor"].value;
      }

      // Search for matching names in database to define default values
      var defaultParameter = this.fuseSearch(
        ["name"],
        parameters,
        parseparameter
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
        parseparameter: key,
        parseUnit: parseUnit,
        parseSensor: parseSensor,
        parameters_id: defaultParameter,
        unit: defaultUnit,
        axis: defaultAxis,
        link: -1,
        sensors_id: defaultSensor,
        included: true,
      };
      datasetparameters.push(variable);
    }
    return datasetparameters;
  };

  // Handle changes to inputs

  handleAccompanyingData = (accompanyingdata) => {
    var { dataset } = this.state;
    dataset.accompanyingdata = accompanyingdata;
    this.setState({ dataset });
  };

  handleChange = (input) => (event) => {
    var values = this.state.values;
    values[input] = event.target.value;
    this.setState({ values });
  };

  handleDataset = (input) => (event) => {
    var dataset = this.state.dataset;
    dataset[input] = event.value ? event.value : event.target.value;
    this.setState({ dataset });
  };

  handleParameter = (a, b) => (event) => {
    var datasetparameters = this.state.datasetparameters;
    datasetparameters[a][b] = event.value ? event.value : event.target.value;
    this.setState({ datasetparameters });
  };

  handleParameterCheck = (a, b) => (event) => {
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
      allFiles,
      fileInformation,
      renkuResponse,
      dropdown,
      dataset,
      datasetparameters,
      files_list,
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
              allFiles={allFiles}
              renkuResponse={renkuResponse}
              handleAccompanyingData={this.handleAccompanyingData}
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
              datasetparameters={datasetparameters}
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

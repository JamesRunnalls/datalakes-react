import React, { Component } from "react";
import "./adddataset.css";
import axios from "axios";
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
      git:
        "https://renkulab.io/gitlab/james.runnalls/exampleproccess/blob/master/data/1A0001_LexploreMeteostationTemperature/LeXPLORE_WS_Lexplore_Weather_data.nc",
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
      citation: ""
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
    var { dataset, step } = this.state;

    // Add blank row to datasets table
    var { data } = await axios.post(apiUrl + "/datasets", {}).catch(error => {
      console.log(error);
      this.setState({ allowedStep: [1, 0, 0, 0, 0] });
      throw { message: "Process failed please try again" };
    });

    // Clone git repo and add files to files table
    var reqObj = this.parseUrl(dataset.git);
    reqObj["id"] = data.id;
    var { data } = await axios
      .post(apiUrl + "/sparsegitclone", reqObj)
      .catch(error => {
        console.log(error);
        this.setState({ allowedStep: [1, 0, 0, 0, 0] });
        throw { message: "Unable to clone repository please try again." };
      });

    // Parse variable and attribute information from incoming file
    var { file, files } = data;
    if (file) {
      var { data, status } = await axios
        .get(apiUrl + "/files/" + file.filetype + "/" + file.id)
        .catch(error => {
          console.log(error);
          this.setState({ allowedStep: [1, 0, 0, 0, 0] });
          throw {
            message:
              "Failed to parse file please check the file structure and try again."
          };
        });
    } else {
      this.setState({ allowedStep: [1, 0, 0, 0, 0] });
      throw {
        message:
          "File not found in repository please check the link and try again."
      };
    }

    dataset["id"] = reqObj.id;
    this.setState({
      allowedStep: [1, 2, 0, 0, 0],
      fileInformation: data,
      step: step + 1,
      dataset,
      files_list: files,
      file: file
    });
    return;
  };

  // 2) Validate data parse and get lineage from Renku

  validateData = async () => {
    const { step, datasetparameters, dataset, file } = this.state;
    const { id } = file;

    // Check all table filled
    for (var row of datasetparameters) {
      if (!this.noEmptyString(row)) {
        this.setState({ allowedStep: [1, 2, 0, 0, 0] });
        throw { message: "Please complete all the fields." };
      }
    }

    // Lineage from Renku
    var { data: renkuData } = await axios
      .get(apiUrl + "/renku/" + encodeURIComponent(dataset.git))
      .catch(error => {
        console.log(error);
        this.setState({ allowedStep: [1, 2, 0, 0, 0] });
        throw {
          message:
            "There was an error connecting to the Renku API please try again."
        };
      });
    dataset["renku"] = 1;
    if ("data" in renkuData) {
      if (renkuData.data.lineage !== null) {
        dataset["renku"] = 0;
        dataset["pre_file"] = "NA";
        dataset["pre_script"] = "NA";
      }
    }

    // Send nc file to convertion api
    var { data } = await axios
      .post(apiUrl + "/convert", {
        id: id,
        variables: datasetparameters
      })
      .catch(error => {
        console.log(error.message);
        this.setState({ allowedStep: [1, 2, 0, 0, 0] });
        throw {
          message:
            "Unable to convert file to JSON format. Please contact the developer."
        };
      });

    // Logic for continuing to next step
    var { start_time, end_time, depth, longitude, latitude } = data.out;
    dataset["start_time"] = start_time;
    dataset["end_time"] = end_time;
    dataset["depth"] = depth;
    dataset["longitude"] = longitude;
    dataset["latitude"] = latitude;
    this.setState({
      renkuResponse: renkuData,
      allowedStep: [1, 2, 3, 0, 0],
      dataset,
      step: step + 1
    });
    return;
  };

  // 3) Validate lineage

  validateLineage = async () => {
    const { dataset, step } = this.state;
    if (dataset["pre_script"] !== "" && dataset["pre_file"] !== "") {
      this.setState({ allowedStep: [1, 2, 3, 4, 0], step: step + 1 });
    } else {
      throw { message: "Please complete all the fields." };
    }
    return;
  };

  // 4) Validate metadata

  validateMetadata = async () => {
    const { dataset, step } = this.state;
    if (this.noEmptyString(dataset)) {
      this.setState({ allowedStep: [1, 2, 3, 4, 5], step: step + 1 });
    } else {
      throw { message: "Please complete all the fields." };
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
        throw { message: "Failed to publish please try again." };
      });
    await axios.put(apiUrl + "/datasets", dataset).catch(error => {
      throw { message: "Failed to publish please try again." };
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
      branch = path[0];
      ssh =
        "git@renkulab.io:" +
        url
          .split("/blob/")[0]
          .split("renkulab.io/gitlab/")
          .pop();
      dir = path.slice(1, path.length - 1).join("/");
      file = path[path.length - 1];
    }
    return {
      ssh: ssh,
      dir: dir,
      branch: branch,
      file: file
    };
  };

  // Handle changes to inputs

  handleChange = input => event => {
    var values = this.state.values;
    values[input] = event.target.value;
    this.setState({ values });
  };

  handleDatasetChange = input => event => {
    var dataset = this.state.dataset;
    dataset[input] = event.target.value;
    this.setState({ dataset });
  };

  handleParameterChange = (a, b) => event => {
    var datasetparameters = this.state.datasetparameters;
    datasetparameters[a][b] = event.target.value;
    this.setState({ datasetparameters });
  };

  handleParameterSelect = (a, b) => event => {
    var datasetparameters = this.state.datasetparameters;
    datasetparameters[a][b] = event.value;
    this.setState({ datasetparameters });
  };

  handleDatasetSelect = input => event => {
    var dataset = this.state.dataset;
    dataset[input] = event.value;
    this.setState({ dataset });
  };

  initialParameterChange = (input, value) => {
    this.setState({ [input]: value });
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
      datasetparameters
    } = this.state;

    switch (step) {
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
              handleChange={this.handleDatasetChange}
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
              fileInformation={fileInformation}
              nextStep={this.validateData}
              prevStep={this.prevStep}
              initialChange={this.initialParameterChange}
              handleSelect={this.handleParameterSelect}
              handleChange={this.handleParameterChange}
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
              handleChange={this.handleDatasetChange}
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
              handleChange={this.handleDatasetChange}
              handleSelect={this.handleDatasetSelect}
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

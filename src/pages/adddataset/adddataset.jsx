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
      lake_id: "",
      person_id: "",
      project_id: "",
      organisation_id: "",
      title: "",
      renku: "",
      pre_file: "",
      pre_script: "",
      license_id: "",
      citation: ""
    },
    parameter_list: [],
    files_list: []
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

  validateFile = async () => {
    var { dataset, step } = this.state;
    var reqObj = this.parseUrl(dataset.git);
    var { data, status } = await axios.post(apiUrl + "/datasets", {}); // Add blank row to database and get unique id
    reqObj["id"] = data.id;
    var { data, status } = await axios.post(apiUrl + "/sparsegitclone", reqObj);
    var { id, dir, file } = reqObj;
    var { data, status } = await axios.get(
      apiUrl +
        "/files/nc/" +
        encodeURIComponent("git/" + id + "/" + dir + "/" + file)
    );
    if (status === 200) {
      dataset["id"] = id;
      this.setState({
        allowedStep: [1, 2, 0, 0, 0],
        fileInformation: data,
        step: step + 1,
        dataset
      });
    } else {
      this.setState({ allowedStep: [1, 0, 0, 0, 0] });
    }
    return data;
  };

  // 2) Validate data parse and get lineage from Renku

  validateData = async () => {
    const { parameter_list, dataset, fileInformation } = this.state;
    const { id, location } = fileInformation;

    // Check all table filled
    var filled = true;
    for (var row of parameter_list) {
      filled = this.noEmptyString(row);
    }

    // Lineage from Renku
    var url = apiUrl + "/api/git/renku/" + encodeURIComponent(dataset.git);
    var { data: renkuData } = await axios.get(url);

    if (renkuData.stdout === 0 && renkuData.log.data.lineage !== null) {
      dataset["renku"] = renkuData.stdout;
      dataset["pre_file"] = "NA";
      dataset["pre_script"] = "NA";
    } else {
      dataset["renku"] = 1;
    }

    // Send nc file to convertion api
    url = apiUrl + "/api/convert/nc";
    const message = {
      id: id,
      location: location,
      variables: parameter_list
    };
    var { data: conversion } = await axios.post(url, message);

    // Logic for continuing to next step
    if (conversion.stdout === 0 && filled) {
      const { step } = this.state;
      var { start_time, end_time, depth, longitude, latitude } = conversion.out;
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
    } else {
      this.setState({ allowedStep: [1, 2, 0, 0, 0] });
    }
    return [conversion, filled];
  };

  // 3) Validate lineage

  validateLineage = () => {
    const { dataset, step } = this.state;
    if (dataset["pre_script"] !== "" && dataset["pre_file"] !== "") {
      this.setState({ allowedStep: [1, 2, 3, 4, 0], step: step + 1 });
    } else {
      return true;
    }
  };

  // 4) Validate metadata

  validateMetadata = () => {
    const { dataset, step } = this.state;
    if (this.noEmptyString(dataset)) {
      this.setState({ allowedStep: [1, 2, 3, 4, 5], step: step + 1 });
    } else {
      return true;
    }
  };

  // 5) Publish

  publish = async () => {
    const { dataset, parameter_list } = this.state;
    var url = apiUrl + "/api/adddataset";
    const message = {
      dataset: dataset,
      parameter_list: parameter_list
    };
    var { data } = await axios.post(url, message);
    if (data.stdout === 0) {
      window.location.href = "/data/" + dataset.id;
    }
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
    var parameter_list = this.state.parameter_list;
    parameter_list[a][b] = event.target.value;
    this.setState({ parameter_list });
  };

  handleParameterSelect = (a, b) => event => {
    var parameter_list = this.state.parameter_list;
    parameter_list[a][b] = event.value;
    this.setState({ parameter_list });
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
      parameter_list
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
              parameter_list={parameter_list}
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
              parameter_list={parameter_list}
              dataset={dataset}
              dropdown={dropdown}
            />
          </React.Fragment>
        );
    }
  }
}

export default AddDataset;

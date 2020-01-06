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
    folder: {
      git:
        "https://renkulab.io/gitlab/james.runnalls/exampleproccess/blob/master/data/1A0001_LexploreMeteostationTemperature/LeXPLORE_WS_Lexplore_Weather_data.nc",
      folder: "",
      start_time: "",
      end_time: "",
      latitude: "",
      longitude: "",
      depth_below_surface: "",
      lake_id: "",
      person_id: "",
      project_id: "",
      organisation_id: "",
      title: "",
      renku: "",
      pre_file: "",
      pre_script: ""
    },
    parameter_list: [],
    files_list: []
  };

  getDropdowns = async () => {
    const { data: parameters } = await axios.get(
      apiUrl + "/api/database/read/parameters"
    );
    const { data: lakes } = await axios.get(
      apiUrl + "/api/database/read/lakes"
    );
    const { data: organisations } = await axios.get(
      apiUrl + "/api/database/read/organisations"
    );
    const { data: persons } = await axios.get(
      apiUrl + "/api/database/read/persons"
    );
    const { data: projects } = await axios.get(
      apiUrl + "/api/database/read/projects"
    );
    const { data: sensors } = await axios.get(
      apiUrl + "/api/database/read/sensors"
    );
    const { data: units } = await axios.get(
      apiUrl + "/api/database/read/units"
    );
    this.setState({
      dropdown: {
        lakes: lakes.log,
        parameters: parameters.log,
        organisations: organisations.log,
        persons: persons.log,
        projects: projects.log,
        sensors: sensors.log,
        units: units.log,
        axis: [{ name: "M" }, { name: "x" }, { name: "y" }, { name: "z" }]
      }
    });
  };

  componentDidMount() {
    this.getDropdowns();
  }

  // 1) Process input file

  validateFile = async () => {
    var { folder, step } = this.state;
    const url = apiUrl + "/api/git/file/" + encodeURIComponent(folder.git);
    const { data } = await axios.get(url);
    if (data.stdout === 0) {
      folder["folder"] = data.id
      this.setState({
        allowedStep: [1, 2, 0, 0, 0],
        fileInformation: data,
        step: step + 1,
        folder
      });
    } else {
      this.setState({ allowedStep: [1, 0, 0, 0, 0] });
    }
    return data;
  };

  // 2) Validate data parse and get lineage from Renku

  validateData = async () => {
    const { parameter_list, folder, fileInformation } = this.state;
    const { id, location } = fileInformation;

    // Lineage from Renku
    var url = apiUrl + "/api/git/renku/" + encodeURIComponent(folder.git);
    var { data: renkuData } = await axios.get(url);
    folder["renku"] = renkuData.stdout;
    if (renkuData.stdout === 0 && renkuData.log.data.lineage !== null) {
      folder["pre_file"] = "NA";
      folder["pre_script"] = "NA";
    }

    // Send nc file to convertion api
    url = apiUrl + "/api/convert/nc";
    const message = {
      id: id,
      location: location,
      variables: parameter_list
    };
    var { data: conversion } = await axios.post(url, message);
    if (conversion.stdout === 0) {
      const { step } = this.state;
      this.setState({
        renkuResponse: renkuData,
        allowedStep: [1, 2, 3, 0, 0],
        folder,
        step: step + 1
      });
    } else {
      this.setState({ allowedStep: [1, 2, 0, 0, 0] });
    }
    return conversion;
  };

  // 3) Validate lineage

  validateLineage = () => {
    const { step } = this.state;
    this.setState({ allowedStep: [1, 2, 3, 4, 0], step: step + 1 });
  };

  // 4) Validate metadata

  validateMetadata = () => {
    const { step } = this.state;
    this.setState({ allowedStep: [1, 2, 3, 4, 5], step: step + 1 });
  };

  // 5) Publish

  publish = () => {
    alert("Published");
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

  // Handle changes to inputs

  handleChange = input => event => {
    var values = this.state.values;
    values[input] = event.target.value;
    this.setState({ values });
  };

  handleFolderChange = input => event => {
    var folder = this.state.folder;
    folder[input] = event.target.value;
    this.setState({ folder });
  };

  handleParameterSelect = (a, b) => event => {
    var parameter_list = this.state.parameter_list;
    parameter_list[a][b] = event.value;
    this.setState({ parameter_list });
  };

  handleFolderSelect = input => event => {
    var folder = this.state.folder;
    folder[input] = event.value;
    this.setState({ folder });
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
      folder,
      parameter_list,
      files_list
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
              handleChange={this.handleChange}
              folder={folder}
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
              parameters={dropdown.parameters}
              axis={dropdown.axis}
              sensors={dropdown.sensors}
              units={dropdown.units}
              fileInformation={fileInformation}
              nextStep={this.validateData}
              prevStep={this.prevStep}
              initialChange={this.initialParameterChange}
              handleSelect={this.handleParameterSelect}
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
              folder={folder}
              renkuResponse={renkuResponse}
              nextStep={this.validateLineage}
              prevStep={this.prevStep}
              handleChange={this.handleFolderChange}
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
              folder={folder}
              lakes={dropdown.lakes}
              persons={dropdown.persons}
              projects={dropdown.projects}
              organisations={dropdown.organisations}
              nextStep={this.validateMetadata}
              prevStep={this.prevStep}
              handleChange={this.handleFolderChange}
              handleSelect={this.handleFolderSelect}
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
            />
          </React.Fragment>
        );
    }
  }
}

export default AddDataset;

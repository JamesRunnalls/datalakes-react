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
    parameters: "",
    organisations: "",
    persons: "",
    projects: "",
    sensors: "",
    units: "",
    values: {
      gitUrl:
        "https://renkulab.io/gitlab/james.runnalls/exampleproccess/blob/master/data/1A0001_LexploreMeteostationTemperature/LeXPLORE_WS_Lexplore_Weather_data.nc"
    }
  };

  async componentDidMount() {
    const { data: parameters } = await axios.get(
      apiUrl + "/api/database/read/parameters"
    );
    console.log(parameters)
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
      parameters: parameters.log,
      organisations: organisations.log,
      persons: persons.log,
      projects: projects.log,
      sensors: sensors.log,
      units: units.log
    });
  }

  // 1) Process input file

  validateFile = async () => {
    const url =
      apiUrl + "/api/git/file/" + encodeURIComponent(this.state.values.gitUrl);
    const { data } = await axios.get(url);
    if (data.stdout === 0) {
      this.setState({ allowedStep: [1, 2, 0, 0, 0] });
      this.setState({ fileInformation: data });
      const { step } = this.state;
      this.setState({
        step: step + 1
      });
    } else {
      this.setState({ allowedStep: [1, 0, 0, 0, 0] });
    }
    return data;
  };

  // 2) Validate data parse and get lineage from Renku

  validateData = async () => {
    const url =
      apiUrl + "/api/git/renku/" + encodeURIComponent(this.state.values.gitUrl);
    const { data } = await axios.get(url);
    this.setState({ renkuResponse: data, allowedStep: [1, 2, 3, 0, 0] });
    const { step } = this.state;
    this.setState({
      step: step + 1
    });
  };

  // 3) Validate lineage

  validateLineage = () => {
    this.setState({ allowedStep: [1, 2, 3, 4, 0] });
    const { step } = this.state;
    this.setState({
      step: step + 1
    });
  };

  // 4) Validate metadata

  validateMetadata = () => {
    this.setState({ allowedStep: [1, 2, 3, 4, 5] });
    const { step } = this.state;
    this.setState({
      step: step + 1
    });
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

  handleSelect = input => event => {
    var values = this.state.values;
    values[input] = event.value;
    this.setState({ values });
  };

  initialChange = (input, value) => {
    var values = this.state.values;
    values[input] = value;
    this.setState({ values });
  };

  render() {
    document.title = "Add Data - Datalakes";
    const {
      step,
      allowedStep,
      fileInformation,
      renkuResponse,
      values,
      parameters,
      organisations,
      persons,
      projects,
      sensors,
      units
    } = this.state;
    const axis = [{ name: "M" }, { name: "x" }, { name: "y" }, { name: "z" }];
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
              values={values}
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
              parameters={parameters}
              axis={axis}
              sensors={sensors}
              units={units}
              fileInformation={fileInformation}
              nextStep={this.validateData}
              prevStep={this.prevStep}
              initialChange={this.initialChange}
              handleChange={this.handleChange}
              handleSelect={this.handleSelect}
              values={values}
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
              renkuResponse={renkuResponse}
              nextStep={this.validateLineage}
              prevStep={this.prevStep}
              handleChange={this.handleChange}
              values={values}
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
              lakes={parameters}
              persons={persons}
              projects={projects}
              organisations={organisations}
              nextStep={this.validateMetadata}
              prevStep={this.prevStep}
              handleChange={this.handleChange}
              handleSelect={this.handleSelect}
              values={values}
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
              handleChange={this.handleChange}
              values={values}
            />
          </React.Fragment>
        );
    }
  }
}

export default AddDataset;

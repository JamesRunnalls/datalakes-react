import React, { Component } from "react";
import Fuse from "fuse.js";
import DataSelect from "../../../components/dataselect/dataselect";
import AddDropdownItem from "../adddropdownitem";
import Loading from "../../../components/loading/loading";

class ReviewData extends Component {
  state = {
    modal: false,
    modalValue: ""
  };

  // Modal for adding to dropdown lists
  showModal = value => {
    this.setState({
      modal: !this.state.modal,
      modalValue: value
    });
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

  componentDidMount() {
    const { fileInformation, dropdown } = this.props;
    const { parameters, sensors } = dropdown;
    const { variables, attributes } = fileInformation;
    var { datasetparameters, initialChange } = this.props;

    // Initial data parse and auto field matching
    if (datasetparameters.length === 0) {
      var parseParameter = "";
      var parseUnit = "";
      var parseSensor = "";
      var variableAttributes = "";
      var variable = {};

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
      initialChange("datasetparameters", datasetparameters);
    }
  }

  findUnits = (parameters, defaultParameter) => {
    return parameters.find(x => x.id === defaultParameter).unit;
  };

  nextStep = e => {
    this.setState({
      message:
        "Parsing data to JSON format. This might take a while for large files.",
      loading: true
    });
    e.preventDefault();
    this.props.nextStep().catch(error => {
      console.error(error.message);
      this.setState({
        message: error.message,
        loading: false
      });
    });
  };

  prevStep = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const {
      dropdown,
      getDropdowns,
      datasetparameters,
      handleChange,
      handleCheck,
      handleSelect,
      files_list
    } = this.props;
    const { parameters, sensors, axis } = dropdown;
    var { modal, modalValue, message, loading } = this.state;

    // Create dynamic table
    var rows = [];
    var i = 0;
    var unit;
    var time = [{ name: "seconds since 1970-01-01 00:00:00" }];
    var depth = [{ name: "m" }];
    var longitude = [{ name: "degrees" }];
    var latitude = [{ name: "degrees" }];
    for (var row of datasetparameters) {
      // Logic to restrict key parameter units
      if (row.parameter === 1) {
        // Time
        unit = (
          <DataSelect
            value="name"
            label="name"
            dataList={time}
            defaultValue={"seconds since 1970-01-01 00:00:00"}
            onChange={handleSelect(i, "unit")}
          />
        );
      } else if (row.parameter === 2) {
        // Depth
        unit = (
          <DataSelect
            value="name"
            label="name"
            dataList={depth}
            defaultValue={"m"}
            onChange={handleSelect(i, "unit")}
          />
        );
      } else if (row.parameter === 3) {
        // Longitude
        unit = (
          <DataSelect
            value="name"
            label="name"
            dataList={longitude}
            defaultValue={"degrees"}
            onChange={handleSelect(i, "unit")}
          />
        );
      } else if (row.parameter === 4) {
        // Latitude
        unit = (
          <DataSelect
            value="name"
            label="name"
            dataList={latitude}
            defaultValue={"degrees"}
            onChange={handleSelect(i, "unit")}
          />
        );
      } else {
        unit = (
          <input
            type="text"
            name="unit"
            defaultValue={row.unit}
            onChange={handleChange(i, "unit")}
          />
        );
      }
      rows.push(
        <tr key={"row" + i}>
          <td>{row.parseParameter}</td>
          <td>{row.parseUnit}</td>
          <td>
            <DataSelect
              table="parameters"
              value="id"
              label="name"
              dataList={parameters}
              defaultValue={row.parameters_id}
              onChange={handleSelect(i, "parameters_id")}
              showModal={this.showModal}
            />
          </td>
          <td>
            <DataSelect
              value="name"
              label="name"
              dataList={axis}
              defaultValue={row.axis}
              onChange={handleSelect(i, "axis")}
            />
          </td>
          <td>{unit}</td>
          <td>
            <DataSelect
              table="sensors"
              value="id"
              label="name"
              dataList={sensors}
              defaultValue={row.sensors_id}
              onChange={handleSelect(i, "sensors_id")}
              showModal={this.showModal}
            />
          </td>
          <td>
            <input
              type="checkbox"
              defaultChecked={row.included}
              onChange={handleCheck(i, "included")}
            ></input>
          </td>
        </tr>
      );
      i++;
    }

    // Modal data
    const modalInfo = { parameters: parameters, sensors: sensors };

    // Loading message when parsing data
    if (message !== "") {
      var userMessage = (
        <div className="loading">
          {loading && <Loading />}
          {message}
        </div>
      );
    }

    // Number of files
    var noFiles = 0;
    try {
      noFiles = files_list.length - 1;
    } catch (e) {}

    return (
      <React.Fragment>
        <form>
          <table className="datareview">
            <tbody>
              <tr>
                <th colSpan="2">Read from file</th>
                <th colSpan="5">Check and adjust auto-parse</th>
              </tr>
              <tr>
                <th>Variable</th>
                <th>Units</th>
                <th style={{ width: "calc(33.33% - 55px)" }}>Parameter</th>
                <th style={{ width: "55px" }}>Axis</th>
                <th>Units</th>
                <th>Sensor</th>
                <th style={{ width: "15px" }}></th>
              </tr>
              {rows}
            </tbody>
          </table>
          {noFiles} additional files have been detected in the same dataset as
          your dataset.
          <div className="error-message">{userMessage}</div>
          <div className="buttonnav">
            <button onClick={this.prevStep}>Back</button>
            <button onClick={this.nextStep}>Parse Data </button>
          </div>
        </form>
        <AddDropdownItem
          show={modal}
          showModal={this.showModal}
          modalValue={modalValue}
          modalInfo={modalInfo}
          getDropdowns={getDropdowns}
        />
      </React.Fragment>
    );
  }
}

export default ReviewData;

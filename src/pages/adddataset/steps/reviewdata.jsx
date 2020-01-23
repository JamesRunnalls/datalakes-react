import React, { Component } from "react";
import Fuse from "fuse.js";
import DataSelect from "../../../components/dataselect/dataselect";
import AddDropdownItem from "../adddropdownitem";
import Loading from "../../../components/loading/loading";

class ReviewData extends Component {
  state = {
    modal: false,
    modalValue: "",
    message: ""
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
    const { parameter, sensor } = dropdown;
    var { parameter_list, initialChange } = this.props;
    const { file, attributes } = fileInformation;

    // Initial data parse and auto field matching
    if (parameter_list.length === 0) {
      var parseParameter = "";
      var parseUnit = "";
      var parseSensor = "";
      var variableAttributes = "";
      var variable = {};

      // Loop over variables in nc file
      for (var key in file) {
        parseParameter = key;
        parseUnit = "NA";
        parseSensor = "NA";
        variableAttributes = file[key].attributes;

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
          parameter,
          parseParameter
        );
        
        var defaultSensor = this.fuseSearch(["name"], sensor, parseSensor);
        var defaultAxis = "y";

        // Fallback to parameter units if none provided in nc file
        var defaultUnit
        if (parseUnit === "NA"){
          defaultUnit = parameter.find(x => x.id === defaultParameter).unit;
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
          parameter: defaultParameter,
          unit: defaultUnit,
          axis: defaultAxis,
          sensor: defaultSensor
        };
        parameter_list.push(variable);
      }
      initialChange(parameter_list);
    }
  }

  nextStep = e => {
    this.setState({ message: "Working" });
    e.preventDefault();
    this.props.nextStep().then(data => {
      if (data[1] === false) {
        this.setState({ message: "Please complete all the fields." });
      } else if (data[0].stdout === 1) {
        this.setState({ message: "Parse failed please try again." });
      }
    });
  };
  prevStep = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const {
      fileInformation,
      dropdown,
      getDropdowns,
      parameter_list,
      handleChange,
      handleSelect
    } = this.props;
    const { parameter, sensor, axis } = dropdown;
    var { modal, modalValue, message } = this.state;

    // Create dynamic table
    var rows = [];
    var i = 0;
    var unit;
    var time = [{ name: "seconds since 1970-01-01 00:00:00" }];
    var depth = [{ name: "m" }];
    var longitude = [{ name: "degrees" }];
    var latitude = [{ name: "degrees" }];
    for (var row of parameter_list) {
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
              table="parameter"
              value="id"
              label="name"
              dataList={parameter}
              defaultValue={row.parameter}
              onChange={handleSelect(i, "parameter")}
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
              table="sensor"
              value="id"
              label="name"
              dataList={sensor}
              defaultValue={row.sensor}
              onChange={handleSelect(i, "sensor")}
              showModal={this.showModal}
            />
          </td>
        </tr>
      );
      i++;
    }

    // Modal data
    const modalInfo = { parameter: parameter, sensor: sensor };

    // Loading message when parsing data
    var notification = "";
    if (message === "Working") {
      notification = (
        <div className="loading">
          <Loading />
          Parsing data to JSON format. This might take a while for large files.
        </div>
      );
    } else if (message !== "") {
      notification = <div>{message}</div>;
    }

    // Number of files in dataset - to be expanded in future
    var noFiles = 0;
    if ("datasetFiles" in fileInformation) {
      noFiles = fileInformation.datasetFiles.length - 1;
    }

    return (
      <React.Fragment>
        <form>
          <table className="datareview">
            <tbody>
              <tr>
                <th colSpan="2">Read from file</th>
                <th colSpan="4">Check and adjust auto-parse</th>
              </tr>
              <tr>
                <th>Variable</th>
                <th>Units</th>
                <th style={{ width: "calc(33.33% - 55px)" }}>Parameter</th>
                <th style={{ width: "55px" }}>Axis</th>
                <th>Units</th>
                <th>Sensor</th>
              </tr>
              {rows}
            </tbody>
          </table>
          {noFiles} additional files have been detected in the same dataset as
          your dataset.
          <div className="error-message">{notification}</div>
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

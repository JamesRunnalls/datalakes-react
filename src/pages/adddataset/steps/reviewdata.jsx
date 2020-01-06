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
    const {
      fileInformation,
      parameters,
      units,
      sensors,
      axis
    } = this.props;
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
        parseUnit = "";
        parseSensor = "";
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
          parameters,
          parseParameter
        );
        var defaultUnit = this.fuseSearch(["name"], units, parseUnit);
        var defaultSensor = this.fuseSearch(["name"], sensors, parseSensor);
        var defaultAxis = "y";

        // Logic for default axis assignment
        if (defaultParameter == 1) {
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
      initialChange(parameter_list)
    }
  }

  nextStep = e => {
    this.setState({ message: "Working" });
    e.preventDefault();
    this.props.nextStep().then(data => {
      if (data.stdout === 1) {
        this.setState({ message: data.message });
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
      parameters,
      axis,
      units,
      sensors,
      getDropdowns,
      parameter_list
    } = this.props;
    var { modal, modalValue, message } = this.state;

    // Create dynamic table
    var rows = [];
    var i = 0;
    for (var row of parameter_list) {
      rows.push(
        <tr key={"row" + i}>
          <td>{row.parseParameter}</td>
          <td>{row.parseUnit}</td>
          <td>
            <DataSelect
              table="parameter"
              value="id"
              label="name"
              dataList={parameters}
              defaultValue={row.parameter}
              onChange={this.props.handleSelect(i,"parameter")}
              showModal={this.showModal}
            />
          </td>
          <td>
            <DataSelect
              value="name"
              label="name"
              dataList={axis}
              defaultValue={row.axis}
              onChange={this.props.handleSelect(i,"axis")}
            />
          </td>
          <td>
            <DataSelect
              table="unit"
              value="id"
              label="name"
              dataList={units}
              defaultValue={row.unit}
              onChange={this.props.handleSelect(i,"unit")}
              showModal={this.showModal}
            />
          </td>
          <td>
            <DataSelect
              table="sensor"
              value="id"
              label="name"
              dataList={sensors}
              defaultValue={row.sensor}
              onChange={this.props.handleSelect(i,"sensor")}
              showModal={this.showModal}
            />
          </td>
        </tr>
      );
      i++;
    }

    // Modal data
    const modalInfo = { parameter: parameters, unit: units, sensor: sensors };
    
    // Loading message when parsing data
    if (message === "Working") {
      message = (
        <div>
          <Loading />
          Parsing data to JSON format. This might take a while for large files.
        </div>
      );
    }

    // Number of files in folder - to be expanded in future
    var noFiles = 0;
    if ("folderFiles" in fileInformation) {
      noFiles = fileInformation.folderFiles.length - 1;
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
          {noFiles} additional files have been detected in the same folder as
          your dataset.
          <div className="error-message">{message}</div>
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

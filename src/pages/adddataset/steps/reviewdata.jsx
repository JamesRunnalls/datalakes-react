import React, { Component } from "react";
import Fuse from "fuse.js";
import DataSelect from "../../../components/dataselect/dataselect";
import AddDropdownItem from "../adddropdownitem";

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
      defaultValue = search[0].name;
    }
    return defaultValue;
  };

  componentDidMount() {
    const { values, fileInformation, parameters, units } = this.props;
    var name = "";
    var unit = "";
    var att = "";
    var fileName = "";
    var fileUnits = "";
    var i = 0;
    for (var key in fileInformation.file) {
      name = key;
      unit = "";
      att = fileInformation.file[key].attributes;
      if ("units" in att) {
        unit = att.units.value;
      }
      if ("standard_name" in att) {
        name = att["standard_name"].value;
      }
      if ("long_name" in att) {
        name = att["long_name"].value;
      }
      fileName = "fileName" + i;
      fileUnits = "fileUnits" + i;
      this.setState({ [fileName]: name, [fileUnits]: unit });

      var defaultParameter = this.fuseSearch(["name"], parameters, key);
      var defaultUnit = this.fuseSearch(["name"], units, unit);

      if ("unit" + i in values) {
      } else {
        this.props.initialChange("unit" + i, defaultUnit);
      }
      if ("axis" + i in values) {
      } else {
        if (defaultParameter.toLowerCase().includes("time")) {
          this.props.initialChange("axis" + i, "x");
        } else {
          this.props.initialChange("axis" + i, "y");
        }
      }
      if ("parameter" + i in values) {
      } else {
        this.props.initialChange("parameter" + i, defaultParameter);
      }
      i++;
    }
  }

  nextStep = e => {
    e.preventDefault();
    this.props.nextStep();
  };
  prevStep = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const {
      values,
      fileInformation,
      parameters,
      axis,
      units,
      sensors,
      getDropdowns
    } = this.props;
    const modalInfo = {parameter: parameters, unit: units, sensor: sensors}
    const { modal, modalValue } = this.state;
    var noFiles = 0;
    if ("folderFiles" in fileInformation) {
      noFiles = fileInformation.folderFiles.length - 1;
    }
    var rows = [];
    var name = "";
    var unit = "";
    var i = 0;
    for (var key in fileInformation.file) {
      if ("fileName" + i in this.state) {
        name = this.state["fileName" + i];
      }
      if ("fileUnits" + i in this.state) {
        unit = this.state["fileUnits" + i];
      }
      rows.push(
        <tr key={"row" + i}>
          <td>{name}</td>
          <td>{unit}</td>
          <td>
            <DataSelect
              table="parameter"
              child="name"
              dataList={parameters}
              defaultValue={values["parameter" + i]}
              onChange={this.props.handleSelect("parameter" + i)}
              showModal={this.showModal}
            />
          </td>
          <td>
            <DataSelect
              child="name"
              dataList={axis}
              defaultValue={values["axis" + i]}
              onChange={this.props.handleSelect("axis" + i)}
            />
          </td>
          <td>
            <DataSelect
              table="unit"
              child="name"
              dataList={units}
              defaultValue={values["unit" + i]}
              onChange={this.props.handleSelect("unit" + i)}
              showModal={this.showModal}
            />
          </td>
          <td>
            <DataSelect
              table="sensor"
              child="name"
              dataList={sensors}
              defaultValue={values["sensor" + i]}
              onChange={this.props.handleSelect("sensor" + i)}
              showModal={this.showModal}
            />
          </td>
        </tr>
      );
      i++;
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
          
          <div className="buttonnav">
            <button onClick={this.prevStep}>Back</button>
            <button onClick={this.nextStep}>Parse Data </button>
          </div>
        </form>
        <AddDropdownItem show={modal} showModal={this.showModal} modalValue={modalValue} modalInfo={modalInfo} getDropdowns={getDropdowns}/>
      </React.Fragment>
    );
  }
}

export default ReviewData;

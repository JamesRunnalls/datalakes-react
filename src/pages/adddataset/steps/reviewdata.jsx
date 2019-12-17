import React, { Component } from "react";
import Fuse from "fuse.js";
import DataSelect from '../../../components/dataselect/dataselect';

class ReviewData extends Component {
  state = {};

  componentDidMount() {
    const { values, fileInformation, parameters } = this.props;
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

      var options = {
        keys: ["name"],
        shouldSort: true,
        threshold: 0.9,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1
      };
      var fuse = new Fuse(parameters, options);
      var match = key.split("_").join(" ");
      var search = fuse.search(match);
      var defaultValue = "";
      if (search.length !== 0) {
        defaultValue = search[0].name;
      }

      if ("unit" + i in values) {
      } else {
        this.props.initialChange("unit" + i, unit);
      }
      if ("axis" + i in values) {
      } else {
        if (defaultValue.toLowerCase().includes("time")) {
          this.props.initialChange("axis" + i, "x");
        } else {
          this.props.initialChange("axis" + i, "y");
        }
      }
      if ("parameter" + i in values) {
      } else {
        this.props.initialChange("parameter" + i, defaultValue);
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
    const { values, fileInformation, parameters } = this.props;
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
              dataList={parameters}
              defaultValue={values["parameter" + i]}
              onChange={this.props.handleSelect("parameter" + i)}
            />
          </td>
          <td>
            <select
              value={values["axis" + i]}
              onChange={this.props.handleChange("axis" + i)}
            >
              <option value="M">M</option>
              <option value="y">y</option>
              <option value="x">x</option>
              <option value="z">z</option>
            </select>
          </td>
          <td>
            <input
              defaultValue={values["unit" + i]}
              onChange={this.props.handleChange("unit" + i)}
            ></input>
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
                <th colSpan="3">Check and adjust auto-parse</th>
              </tr>
              <tr>
                <th>Variable</th>
                <th>Units</th>
                <th>Parameter</th>
                <th>Axis</th>
                <th>Units</th>
              </tr>
              {rows}
            </tbody>
          </table>
          <div className="buttonnav">
            <button onClick={this.prevStep}>Back</button>
            <button onClick={this.nextStep}>Parse Data </button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

export default ReviewData;
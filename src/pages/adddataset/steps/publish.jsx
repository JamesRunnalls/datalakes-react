import React, { Component } from "react";

class Publish extends Component {
  nextStep = e => {
    //e.preventDefault();
    this.props.nextStep();
  };
  prevStep = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  getDropdownLabel = (input,id) => {
    const { dropdown } = this.props;
    return dropdown[input].find(x => x.id === id).name;
  }

  render() {
    const { parameter_list, folder } = this.props;

    // Parameter Table
    var rows = [];
    var i = 0;
    for (var row of parameter_list) {
      rows.push(
        <tr key={"row" + i}>
          <td>{this.getDropdownLabel("parameters",row.parameter)}</td>
          <td>{row.axis}</td>
          <td>{this.getDropdownLabel("units",row.unit)}</td>
          <td>{this.getDropdownLabel("sensors",row.sensor)}</td>
        </tr>
      );
      i++;
    }

    // Renku
    var renku = "";
    if (folder["renku"] === 0) {
      renku = "Lineage managed through Renku"
    } else {
      renku = "Not used."
    }

    return (
      <div className="publish">
        <h3>Dataset Parameters</h3>
        <table className="parameter">
          <tbody>
            <tr>
              <th>Parameter</th>
              <th>Axis</th>
              <th>Units</th>
              <th>Sensor</th>
            </tr>
            {rows}
          </tbody>
        </table>
        <h3>Dataset Metadata</h3>
        <table className="metadata">
          <tbody>
          <tr>
              <th>Link to Git Repo</th>
              <td>{folder["git"]}</td>
            </tr>
            <tr>
              <th>Start Time</th>
              <td>{folder["start_time"]}</td>
            </tr>
            <tr>
              <th>End Time</th>
              <td>{folder["end_time"]}</td>
            </tr>
            <tr>
              <th>Location</th>
              <td>
                {folder["latitude"]},{folder["longitude"]}
              </td>
            </tr>
            <tr>
              <th>Depth</th>
              <td>{folder["depth"]}m</td>
            </tr>
            <tr>
              <th>Lake</th>
              <td>{this.getDropdownLabel("lakes",folder["lake_id"])}</td>
            </tr>
            <tr>
              <th>Title</th>
              <td>{folder["title"]}</td>
            </tr>
            <tr>
              <th>Project</th>
              <td>{this.getDropdownLabel("projects",folder["project_id"])}</td>
            </tr>

            <tr>
              <th>Person</th>
              <td>{this.getDropdownLabel("persons",folder["person_id"])}</td>
            </tr>
            <tr>
              <th>Organisation</th>
              <td>{this.getDropdownLabel("organisations",folder["organisation_id"])}</td>
            </tr>
            <tr>
              <th>Renku</th>
              <td>{renku}</td>
            </tr>
            <tr>
              <th>Pre file</th>
              <td>{folder["pre_file"]}</td>
            </tr>
            <tr>
              <th>Pre Script</th>
              <td>{folder["pre_script"]}</td>
            </tr>
          </tbody>
        </table>
        <div className="buttonnav">
          <button onClick={this.prevStep}>Back</button>
          <button onClick={this.nextStep}>Publish </button>
        </div>
      </div>
    );
  }
}

export default Publish;

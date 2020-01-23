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
    const { parameter_list, dataset } = this.props;

    // Parameter Table
    var rows = [];
    var i = 0;
    for (var row of parameter_list) {
      rows.push(
        <tr key={"row" + i}>
          <td>{this.getDropdownLabel("parameter",row.parameter)}</td>
          <td>{row.axis}</td>
          <td>{row.unit}</td>
          <td>{this.getDropdownLabel("sensor",row.sensor)}</td>
        </tr>
      );
      i++;
    }

    // Renku
    var renku = "";
    if (dataset["renku"] === 0) {
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
              <td>{dataset["git"]}</td>
            </tr>
            <tr>
              <th>Start Time</th>
              <td>{dataset["start_time"]}</td>
            </tr>
            <tr>
              <th>End Time</th>
              <td>{dataset["end_time"]}</td>
            </tr>
            <tr>
              <th>Location</th>
              <td>
                {dataset["latitude"]},{dataset["longitude"]}
              </td>
            </tr>
            <tr>
              <th>Depth</th>
              <td>{dataset["depth"]}m</td>
            </tr>
            <tr>
              <th>Lake</th>
              <td>{this.getDropdownLabel("lake",dataset["lake_id"])}</td>
            </tr>
            <tr>
              <th>Title</th>
              <td>{dataset["title"]}</td>
            </tr>
            <tr>
              <th>Project</th>
              <td>{this.getDropdownLabel("project",dataset["project_id"])}</td>
            </tr>

            <tr>
              <th>Person</th>
              <td>{this.getDropdownLabel("person",dataset["person_id"])}</td>
            </tr>
            <tr>
              <th>Organisation</th>
              <td>{this.getDropdownLabel("organisation",dataset["organisation_id"])}</td>
            </tr>
            <tr>
              <th>License</th>
              <td>{this.getDropdownLabel("license",dataset["license_id"])}</td>
            </tr>
            <tr>
              <th>Citation</th>
              <td>{dataset["citation"]}</td>
            </tr>
            <tr>
              <th>Renku</th>
              <td>{renku}</td>
            </tr>
            <tr>
              <th>Pre file</th>
              <td>{dataset["pre_file"]}</td>
            </tr>
            <tr>
              <th>Pre Script</th>
              <td>{dataset["pre_script"]}</td>
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

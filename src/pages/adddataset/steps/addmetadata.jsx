import React, { Component } from "react";
import DataSelect from "../../../components/dataselect/dataselect";
import qm from "./img/qm.svg";

class AddMetadata extends Component {
  nextStep = e => {
    e.preventDefault();
    this.props.nextStep();
  };
  prevStep = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const { values, lakes, persons, projects, organisations } = this.props;
    var parameters = "";
    return (
      <React.Fragment>
        <form>
          <table className="addmetadata">
            <tbody>
              <tr>
                <th>
                  Unix Time
                  <a href="https://www.unixtimestamp.com/" target="_blank">
                    <img
                      src={qm}
                      style={{ paddingLeft: "6px", height: "14px" }}
                    />
                  </a>
                </th>
                <td>
                  <input
                    type="number"
                    name="unixtime"
                    defaultValue={values["time"]}
                    placeholder="Seconds since 1970-01-01 00:00:00"
                    onChange={this.props.handleChange("time")}
                  />
                </td>
              </tr>
              <tr>
                <th>Location</th>
                <td>
                  <input
                    type="number"
                    name="latitude"
                    defaultValue={values["latitude"]}
                    style={{ width: "50%" }}
                    placeholder="Latitude"
                    onChange={this.props.handleChange("latitude")}
                  />
                  <input
                    type="number"
                    name="longitude"
                    defaultValue={values["longitude"]}
                    style={{ width: "50%" }}
                    placeholder="Longitude"
                    onChange={this.props.handleChange("longitude")}
                  />
                </td>
              </tr>
              <tr>
                <th>Depth</th>
                <td>
                  <input
                    type="number"
                    name="depth"
                    defaultValue={values["depth"]}
                    placeholder="Meters below lake surface"
                    onChange={this.props.handleChange("depth")}
                  />
                </td>
              </tr>
              <tr>
                <th>Lake</th>
                <td>
                  <DataSelect
                    child="name"
                    dataList={lakes}
                    defaultValue={values["lake"]}
                    onChange={this.props.handleSelect("lake")}
                  />
                </td>
              </tr>
              <tr>
                <th>Title</th>
                <td>
                  <input
                    type="text"
                    name="title"
                    defaultValue={values["title"]}
                    placeholder="Use a descriptive title to help others"
                    onChange={this.props.handleChange("title")}
                  />
                </td>
              </tr>
              <tr>
                <th>Project</th>
                <td>
                  <DataSelect
                    child="name"
                    dataList={projects}
                    defaultValue={values["project"]}
                    onChange={this.props.handleSelect("project")}
                  />
                </td>
              </tr>

              <tr>
                <th>Person</th>
                <td>
                  <DataSelect
                    child="name"
                    dataList={persons}
                    defaultValue={values["person"]}
                    onChange={this.props.handleSelect("person")}
                  />
                </td>
              </tr>
              <tr>
                <th>Organisation</th>
                <td>
                  <DataSelect
                    child="name"
                    dataList={organisations}
                    defaultValue={values["organisation"]}
                    onChange={this.props.handleSelect("organisation")}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="buttonnav">
            <button onClick={this.prevStep}>Back</button>
            <button onClick={this.nextStep}>Next </button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

export default AddMetadata;

import React, { Component } from "react";
import DataSelect from "../../../components/dataselect/dataselect";
import AddDropdownItem from "../adddropdownitem";
import qm from "./img/qm.svg";

class AddMetadata extends Component {
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

  nextStep = e => {
    e.preventDefault();
    var data = this.props.nextStep();
    if (data) {
      this.setState({ message: "Please complete all the fields." });
    }
  };
  prevStep = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const { dropdown, getDropdowns, dataset } = this.props;
    const { lake, person, project, organisation, license } = dropdown;
    const modalInfo = {
      person: person,
      project: project,
      lake: lake,
      organisation: organisation,
      license: license
    };
    const { modal, modalValue, message } = this.state;
    return (
      <React.Fragment>
        <form>
          <table className="addmetadata">
            <tbody>
              <tr>
                <th>
                  Start Time
                  <a href="https://www.unixtimestamp.com/" target="_blank">
                    <img
                      src={qm}
                      style={{ paddingLeft: "6px", height: "14px" }}
                      alt="Information on Unix Time"
                    />
                  </a>
                </th>
                <td>
                  <input
                    type="number"
                    name="starttime"
                    defaultValue={dataset["start_time"]}
                    placeholder="Seconds since 1970-01-01 00:00:00"
                    onChange={this.props.handleChange("start_time")}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  End Time
                  <a href="https://www.unixtimestamp.com/" target="_blank">
                    <img
                      src={qm}
                      style={{ paddingLeft: "6px", height: "14px" }}
                      alt="Information on Unix Time"
                    />
                  </a>
                </th>
                <td>
                  <input
                    type="number"
                    name="endtime"
                    defaultValue={dataset["end_time"]}
                    placeholder="Seconds since 1970-01-01 00:00:00"
                    onChange={this.props.handleChange("end_time")}
                  />
                </td>
              </tr>
              <tr>
                <th>Location</th>
                <td>
                  <input
                    type="number"
                    name="latitude"
                    defaultValue={dataset["latitude"]}
                    style={{ width: "calc(50% - 3px)", marginRight: "3px" }}
                    placeholder="Latitude"
                    onChange={this.props.handleChange("latitude")}
                  />
                  <input
                    type="number"
                    name="longitude"
                    defaultValue={dataset["longitude"]}
                    style={{ width: "calc(50% - 3px)", marginLeft: "3px" }}
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
                    defaultValue={dataset["depth"]}
                    placeholder="Meters below lake surface"
                    onChange={this.props.handleChange("depth")}
                  />
                </td>
              </tr>
              <tr>
                <th>Lake</th>
                <td>
                  <DataSelect
                    table="lake"
                    value="id"
                    label="name"
                    dataList={lake}
                    defaultValue={dataset["lake_id"]}
                    onChange={this.props.handleSelect("lake_id")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>
              <tr>
                <th>Title</th>
                <td>
                  <input
                    type="text"
                    name="title"
                    defaultValue={dataset["title"]}
                    placeholder="Use a descriptive title to help others"
                    onChange={this.props.handleChange("title")}
                  />
                </td>
              </tr>
              <tr>
                <th>Project</th>
                <td>
                  <DataSelect
                    table="project"
                    value="id"
                    label="name"
                    dataList={project}
                    defaultValue={dataset["project_id"]}
                    onChange={this.props.handleSelect("project_id")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>

              <tr>
                <th>Person</th>
                <td>
                  <DataSelect
                    table="person"
                    value="id"
                    label="name"
                    dataList={person}
                    defaultValue={dataset["person_id"]}
                    onChange={this.props.handleSelect("person_id")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>
              <tr>
                <th>Organisation</th>
                <td>
                  <DataSelect
                    table="organisation"
                    value="id"
                    label="name"
                    dataList={organisation}
                    defaultValue={dataset["organisation_id"]}
                    onChange={this.props.handleSelect("organisation_id")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  License
                  <a href="https://choosealicense.com/licenses/" target="_blank">
                    <img
                      src={qm}
                      style={{ paddingLeft: "6px", height: "14px" }}
                      alt="Information on licenses"
                    />
                  </a>
                </th>
                <td>
                  <DataSelect
                    table="license"
                    value="id"
                    label="name"
                    dataList={license}
                    defaultValue={dataset["license_id"]}
                    onChange={this.props.handleSelect("license_id")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>
              <tr>
                <th>Citation</th>
                <td>
                  <input
                    type="text"
                    name="citation"
                    defaultValue={dataset["citation"]}
                    placeholder="How should others reference your data"
                    onChange={this.props.handleChange("citation")}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="error-message">{message}</div>
          <div className="buttonnav">
            <button onClick={this.prevStep}>Back</button>
            <button onClick={this.nextStep}>Next </button>
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

export default AddMetadata;

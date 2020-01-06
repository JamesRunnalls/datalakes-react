import React, { Component } from "react";
import DataSelect from "../../../components/dataselect/dataselect";
import AddDropdownItem from "../adddropdownitem";
import qm from "./img/qm.svg";

class AddMetadata extends Component {
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
      lakes,
      persons,
      projects,
      organisations,
      getDropdowns,
      folder
    } = this.props;
    const modalInfo = {
      person: persons,
      project: projects,
      lake: lakes,
      organisation: organisations
    };
    const { modal, modalValue } = this.state;
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
                    />
                  </a>
                </th>
                <td>
                  <input
                    type="number"
                    name="starttime"
                    defaultValue={folder["start_time"]}
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
                    />
                  </a>
                </th>
                <td>
                  <input
                    type="number"
                    name="endtime"
                    defaultValue={folder["end_time"]}
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
                    defaultValue={folder["latitude"]}
                    style={{ width: "calc(50% - 3px)", marginRight: "3px" }}
                    placeholder="Latitude"
                    onChange={this.props.handleChange("latitude")}
                  />
                  <input
                    type="number"
                    name="longitude"
                    defaultValue={folder["longitude"]}
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
                    defaultValue={folder["depth"]}
                    placeholder="Meters below lake surface"
                    onChange={this.props.handleChange("depth_below_surface")}
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
                    dataList={lakes}
                    defaultValue={folder["lake"]}
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
                    defaultValue={folder["title"]}
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
                    dataList={projects}
                    defaultValue={folder["project"]}
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
                    dataList={persons}
                    defaultValue={folder["person"]}
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
                    dataList={organisations}
                    defaultValue={folder["organisation"]}
                    onChange={this.props.handleSelect("organisation_id")}
                    showModal={this.showModal}
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

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
    const { values, lakes, persons, projects, organisations, getDropdowns } = this.props;
    const modalInfo = {
      person: persons,
      project: projects,
      lake: lakes,
      organisation: organisations
    };
    const { modal, modalValue } = this.state;
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
                    style={{ width: "calc(50% - 3px)", marginRight: "3px" }}
                    placeholder="Latitude"
                    onChange={this.props.handleChange("latitude")}
                  />
                  <input
                    type="number"
                    name="longitude"
                    defaultValue={values["longitude"]}
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
                    table="lake"
                    child="name"
                    dataList={lakes}
                    defaultValue={values["lake"]}
                    onChange={this.props.handleSelect("lake")}
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
                    table="project"
                    child="name"
                    dataList={projects}
                    defaultValue={values["project"]}
                    onChange={this.props.handleSelect("project")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>

              <tr>
                <th>Person</th>
                <td>
                  <DataSelect
                    table="person"
                    child="name"
                    dataList={persons}
                    defaultValue={values["person"]}
                    onChange={this.props.handleSelect("person")}
                    showModal={this.showModal}
                  />
                </td>
              </tr>
              <tr>
                <th>Organisation</th>
                <td>
                  <DataSelect
                    table="organisation"
                    child="name"
                    dataList={organisations}
                    defaultValue={values["organisation"]}
                    onChange={this.props.handleSelect("organisation")}
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

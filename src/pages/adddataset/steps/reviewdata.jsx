import React, { Component } from "react";
import DataSelect from "../../../components/dataselect/dataselect";
import AddDropdownItem from "../adddropdownitem";
import Loading from "../../../components/loading/loading";

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

  nextStep = e => {
    this.setState({
      message:
        "Parsing data to JSON format. This might take a while for large files.",
      loading: true
    });
    e.preventDefault();
    this.props.nextStep().catch(error => {
      console.error(error.message);
      this.setState({
        message: error.message,
        loading: false
      });
    });
  };

  prevStep = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const {
      dropdown,
      getDropdowns,
      datasetparameters,
      handleChange,
      handleCheck,
      handleSelect,
      files_list
    } = this.props;
    const { parameters, sensors, axis } = dropdown;
    var { modal, modalValue, message, loading } = this.state;

    // Create dynamic table
    var rows = [];
    var i = 0;
    var unit;
    var time = [{ name: "seconds since 1970-01-01 00:00:00" }];
    var depth = [{ name: "m" }];
    var longitude = [{ name: "degrees" }];
    var latitude = [{ name: "degrees" }];
    for (var row of datasetparameters) {
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
              table="parameters"
              value="id"
              label="name"
              dataList={parameters}
              defaultValue={row.parameters_id}
              onChange={handleSelect(i, "parameters_id")}
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
              table="sensors"
              value="id"
              label="name"
              dataList={sensors}
              defaultValue={row.sensors_id}
              onChange={handleSelect(i, "sensors_id")}
              showModal={this.showModal}
            />
          </td>
          <td>
            <input
              type="checkbox"
              defaultChecked={row.included}
              onChange={handleCheck(i, "included")}
            ></input>
          </td>
        </tr>
      );
      i++;
    }

    // Modal data
    const modalInfo = { parameters: parameters, sensors: sensors };

    // Loading message when parsing data
    if (message !== "") {
      var userMessage = (
        <div className="loading">
          {loading && <Loading />}
          {message}
        </div>
      );
    }

    // Number of files
    var noFiles = 0;
    try {
      noFiles = files_list.length - 1;
    } catch (e) {}

    return (
      <React.Fragment>
        <form>
          <table className="datareview">
            <tbody>
              <tr>
                <th colSpan="2">Read from file</th>
                <th colSpan="5">Check and adjust auto-parse</th>
              </tr>
              <tr>
                <th>Variable</th>
                <th>Units</th>
                <th style={{ width: "calc(33.33% - 55px)" }}>Parameter</th>
                <th style={{ width: "55px" }}>Axis</th>
                <th>Units</th>
                <th>Sensor</th>
                <th style={{ width: "15px" }}></th>
              </tr>
              {rows}
            </tbody>
          </table>
          {noFiles} additional files have been detected in the same dataset as
          your dataset.
          <div className="error-message">{userMessage}</div>
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

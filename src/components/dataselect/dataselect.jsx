import React, { Component } from "react";
import Select from "react-select";
import "./dataselect.css";

class DataSelect extends Component {
  addNew = table => {
    this.props.showModal(table);
  };

  render() {
    const customStyles = {
      control: base => ({
        ...base,
        height: 30,
        minHeight: 30
      })
    };
    var { dataList, defaultValue, child } = this.props;
    var list = [];
    try {
      if (dataList.length > 0) {
        list = [];
        for (var param of dataList) {
          list.push({ value: param[child], label: param[child] });
        }
      }
    } catch (e) {}
    var dValue = { value: defaultValue, label: defaultValue };
    return (
      <div>
        <Select
          options={list}
          value={dValue}
          className="multi-select"
          classNamePrefix="inner"
          onChange={this.props.onChange}
          styles={customStyles}
          noOptionsMessage={() => (
            <a
              style={{ cursor: "pointer" }}
              onClick={() => this.addNew(this.props.table)}
            >
              Add new
            </a>
          )}
        />
      </div>
    );
  }
}

export default DataSelect;

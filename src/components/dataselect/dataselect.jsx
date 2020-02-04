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
    var { dataList, defaultValue, value, label } = this.props;
    var list = [];
    try {
      if (dataList.length > 0) {
        list = [];
        for (var param of dataList) {
          list.push({ value: param[value], label: param[label] });
        }
      }
    } catch (e) {}
    var dValue = list.find(x => x.value === defaultValue);
    return (
      <div>
        <Select
          options={list}
          value={dValue}
          className="multi-select"
          classNamePrefix="inner"
          onChange={this.props.onChange}
          styles={customStyles}
          noOptionsMessage={
            this.props.showModal
              ? () => (
                  <a
                    style={{ cursor: "pointer" }}
                    onClick={() => this.addNew(this.props.table)}
                  >
                    Add new
                  </a>
                )
              : () => <div>No options</div>
          }
        />
      </div>
    );
  }
}

export default DataSelect;

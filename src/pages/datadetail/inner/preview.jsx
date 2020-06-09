import React, { Component } from "react";
import "../datadetail.css";

class Preview extends Component {
  tableHeader = (i, parameters, getLabel) => {
    var detail = "";
    if (parameters[i] && parameters[i].detail !== null && parameters[i].detail !== "none") {
      detail = `[${parameters[i].detail}]`;
    }
    return (
      parameters[i] &&
      `${getLabel("parameters", parameters[i].parameters_id, "name")} ${
        detail
      } (${parameters[i].unit})`
    );
  };

  tableBody = (i, l, parameters, data) => {
    return parameters[i] && data[parameters[i].axis][l];
  };

  render() {
    var { data, parameters, getLabel } = this.props;
    data = data[0];
    var inner = [];
    inner = [
      <tr key="h">
        <th>1</th>
        <td>{this.tableHeader(0, parameters, getLabel)}</td>
        <td>{this.tableHeader(1, parameters, getLabel)}</td>
        <td>{this.tableHeader(2, parameters, getLabel)}</td>
        <td>{this.tableHeader(3, parameters, getLabel)}</td>
        <td>{this.tableHeader(4, parameters, getLabel)}</td>
        <td>{this.tableHeader(5, parameters, getLabel)}</td>
        <td>{this.tableHeader(6, parameters, getLabel)}</td>
      </tr>,
    ];
    var len = data.y ? data.y.length : data.x.length;
    for (var l = 0; l < Math.min(50, len); l++) {
      inner.push(
        <tr key={"h" + l}>
          <th>{l + 2}</th>
          <td>{this.tableBody(0, l, parameters, data)}</td>
          <td>{this.tableBody(1, l, parameters, data)}</td>
          <td>{this.tableBody(2, l, parameters, data)}</td>
          <td>{this.tableBody(3, l, parameters, data)}</td>
          <td>{this.tableBody(4, l, parameters, data)}</td>
          <td>{this.tableBody(5, l, parameters, data)}</td>
          <td>{this.tableBody(6, l, parameters, data)}</td>
        </tr>
      );
    }

    return (
      <React.Fragment>
        <div className="datadetail-padding">
          <div className="preview-table">
            <table className="excel">
              <tbody>
                <tr>
                  <th></th>
                  <th>a</th>
                  <th>b</th>
                  <th>c</th>
                  <th>d</th>
                  <th>e</th>
                  <th>f</th>
                  <th>g</th>
                </tr>
                {inner}
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Preview;

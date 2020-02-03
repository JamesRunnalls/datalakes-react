import React, { Component } from "react";
import "../datadetail.css";

class Preview extends Component {
    render() {
      const { data, parameters, getLabel } = this.props;
      var inner = [];
      const xparam = parameters.find(x => x.axis === "x");
      const yparam = parameters.find(y => y.axis === "y");
      const xlabel = getLabel("parameters", xparam.parameters_id),
        ylabel = getLabel("parameters", yparam.parameters_id),
        xunits = xparam.unit,
        yunits = yparam.unit;
      inner = [
        <tr key="h">
          <th>1</th>
          <td>{xlabel + " (" + xunits + ")"}</td>
          <td>{ylabel + " (" + yunits + ")"}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      ];
      for (var l = 0; l < Math.min(200, data.y.length); l++) {
        inner.push(
          <tr key={"h" + l}>
            <th>{l + 2}</th>
            <td>{data.x[l]}</td>
            <td>{data.y[l]}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        );
      }
  
      return (
        <React.Fragment>
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
        </React.Fragment>
      );
    }
  }

  export default Preview;
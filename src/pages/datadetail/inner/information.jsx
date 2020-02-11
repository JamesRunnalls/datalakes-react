import React, { Component } from "react";
import "../datadetail.css";

class Information extends Component {
    state = {};
    render() {
      const { dataset, parameters, getLabel } = this.props;
  
      // Parameter Table
      var rows = [];
      for (var row of parameters) {
        rows.push(
          <tr key={row.id}>
            <td>{row.name}</td>
            <td>{row.axis}</td>
            <td>{row.unit}</td>
            <td>{getLabel("sensors", row.sensors_id)}</td>
          </tr>
        );
      }
  
      return (
        <React.Fragment>
          <div className="info-width">
            <div className="info-head">Parameters</div>
            <table>
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
          </div>
          <div className="info-inner">
            <div className="info-head">Properties</div>
            <table>
              <tbody>
                <tr>
                  <th>Git</th>
                  <td>
                    <a href={dataset.git} target="_blank">
                      Link
                    </a>
                  </td>
                </tr>
                <tr>
                  <th>Start</th>
                  <td>{dataset.start_time}</td>
                </tr>
                <tr>
                  <th>End</th>
                  <td>{dataset.end_time}</td>
                </tr>
                <tr>
                  <th>Longitude</th>
                  <td>{dataset.longitude}</td>
                </tr>
                <tr>
                  <th>Latitude</th>
                  <td>{dataset.latitude}</td>
                </tr>
                <tr>
                  <th>Depth (m)</th>
                  <td>{dataset.depth}</td>
                </tr>
                <tr>
                  <th>Lake</th>
                  <td>{getLabel("lakes", dataset.lakes_id)}</td>
                </tr>
                <tr>
                  <th>Downloads</th>
                  <td>{dataset.downloads}</td>
                </tr>
                <tr>
                  <th>Last Modified</th>
                  <td>{dataset.lastmodified}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="info-inner">
            <div className="info-head">Contact</div>
            <table>
              <tbody>
                <tr>
                  <th>Name</th>
                  <td>{getLabel("persons", dataset.persons_id)}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td></td>
                </tr>
                <tr>
                  <th>Organisation</th>
                  <td>{getLabel("organisations", dataset.organisations_id)}</td>
                </tr>
                <tr>
                  <th>Project</th>
                  <td>{getLabel("projects", dataset.projects_id)}</td>
                </tr>
                <tr>
                  <th>License</th>
                  <td>{getLabel("licenses", dataset.licenses_id)}</td>
                </tr>
                <tr>
                  <th>Citation</th>
                  <td>{dataset.citation}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </React.Fragment>
      );
    }
  }

  export default Information;
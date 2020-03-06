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
          <td>
            <a
              href={getLabel("sensors", row.sensors_id, "link")}
              target="_blank"
              title={getLabel("sensors", row.sensors_id, "manufacturer")}
            >
              {getLabel("sensors", row.sensors_id, "name")}
            </a>
          </td>
        </tr>
      );
    }

    return (
      <div className="datadetail-padding">
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
                    Link to Git Repository
                  </a>
                </td>
              </tr>
              <tr>
                <th>Start</th>
                <td>{new Date(dataset.start_time).toString()}</td>
              </tr>
              <tr>
                <th>End</th>
                <td>{new Date(dataset.end_time).toString()}</td>
              </tr>
              <tr>
                <th>Latitude</th>
                <td>{dataset.latitude}</td>
              </tr>
              <tr>
                <th>Longitude</th>
                <td>{dataset.longitude}</td>
              </tr>
              <tr>
                <th>Depth (m)</th>
                <td>
                  {dataset.depth === "-9999" ? "Variable" : dataset.depth}
                </td>
              </tr>
              <tr>
                <th>Lake</th>
                <td>{getLabel("lakes", dataset.lakes_id, "name")}</td>
              </tr>
              <tr>
                <th>Downloads</th>
                <td>{dataset.downloads}</td>
              </tr>
              <tr>
                <th>Last Modified</th>
                <td>{new Date(dataset.lastmodified).toString()}</td>
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
                <td>{getLabel("persons", dataset.persons_id, "name")}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{getLabel("persons", dataset.persons_id, "email")}</td>
              </tr>
              <tr>
                <th>Organisation</th>
                <td>
                  {getLabel("organisations", dataset.organisations_id, "name")}
                </td>
              </tr>
              <tr>
                <th>Project</th>
                <td>{getLabel("projects", dataset.projects_id, "name")}</td>
              </tr>
              <tr>
                <th>License</th>
                <td>
                  <a
                    href={getLabel("licenses", dataset.licenses_id, "link")}
                    target="_blank"
                    title={getLabel(
                      "licenses",
                      dataset.licenses_id,
                      "description"
                    )}
                  >
                    {getLabel("licenses", dataset.licenses_id, "name")}
                  </a>
                </td>
              </tr>
              <tr>
                <th>Citation</th>
                <td>{dataset.citation}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default Information;

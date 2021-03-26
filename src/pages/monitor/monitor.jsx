import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { apiUrl } from "../../config.json";

class Monitor extends Component {
  state = {
    monitor: [],
  };
  async componentDidMount() {
    var { data } = await axios.get(apiUrl + "/monitor").catch((error) => {
      console.error(error);
    });
    var now = new Date().getTime();
    data.map((d) => {
      d.maxdatetime = new Date(d.maxdatetime);
      d.timedif = now - d.maxdatetime.getTime() - d.monitor * 1000;
      let color = "green";
      if (now > d.maxdatetime.getTime() - d.monitor * 1000) {
        color = "red";
      }
      d.color = color;
      return d;
    });
    data = data.sort((a, b) => b.timedif - a.timedif);

    this.setState({ monitor: data });
  }
  render() {
    document.title = "Live Data Monitor - Datalakes";
    var { monitor } = this.state;
    return (
      <div className="">
        <h1>Status of Live Datasets</h1>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>Dataset</th>
              <th>Datetime</th>
              <th>Acceptable Datetime</th>
            </tr>
            {monitor.map((m) => {
              let now = new Date().getTime();
              return (
                <tr key={m.title}>
                  <td>
                    <div
                      className="circle"
                      style={{ backgroundColor: m.color }}
                    />
                  </td>
                  <td>
                    <Link to={"/datadetail/" + m.id}>{m.title}</Link>
                  </td>
                  <td>{m.maxdatetime.toUTCString()}</td>
                  <td>{new Date(now + m.monitor * 1000).toUTCString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Monitor;

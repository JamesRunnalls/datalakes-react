import React, { Component } from "react";
import axios from "axios";
import { apiUrl } from "../../../config.json";
import "../datadetail.css";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";

class Ch2018Graph extends Component {
  state = {
    lakes: [],
    data: [],
    lake: "",
    depth: "surface",
    period: "p1",
  };

  updateLake = async (event) => {
    var { data } = this.state;
    var lake = event.target.value;
    if (!Object.keys(data).includes(lake)) {
      var { data: lakedata } = await axios
        .get(apiUrl + "/externaldata/ch2018/" + lake, {
          timeout: 10000,
        })
        .catch((error) => {
          console.error(error);
        });
      data[lake] = lakedata;
      this.setState({ lake, data });
    } else {
      this.setState({ lake });
    }
  };

  updateDepth = (event) => {
    this.setState({ depth: event.target.value });
  };

  updatePeriod = (event) => {
    this.setState({ period: event.target.value });
  };

  async componentDidMount() {
    var { data: lakes } = await axios
      .get(apiUrl + "/externaldata/ch2018/lakes", {
        timeout: 10000,
      })
      .catch((error) => {
        console.error(error);
      });
    var { data: lakedata } = await axios
      .get(apiUrl + "/externaldata/ch2018/" + lakes[0], {
        timeout: 10000,
      })
      .catch((error) => {
        console.error(error);
      });

    var data = {};
    data[lakes[0]] = lakedata;
    this.setState({ lakes, data, lake: lakes[0] });
  }

  render() {
    var { lakes, depth, lake, data, period } = this.state;
    var lake_options = [];
    for (var listlake of lakes) {
      lake_options.push(
        <option value={listlake} key={listlake}>
          {listlake}
        </option>
      );
    }
    var lcolor = [];
    var lweight = [];
    var yearly = [];
    var seasonal = [];
    var legend = [];
    if (Object.keys(data).length > 0) {
      lcolor = ["green", "orange", "red"];
      legend = [
        { color: "green", text: "RCP 2.6" },
        { color: "orange", text: "RCP 4.5" },
        { color: "red", text: "RCP 8.5" },
      ];
      lweight = [1, 1, 1];
      yearly = [
        {
          x: data[lake]["yearly"][depth]["RCP26"]["x"],
          y: data[lake]["yearly"][depth]["RCP26"]["y_ave"],
        },
        {
          x: data[lake]["yearly"][depth]["RCP45"]["x"],
          y: data[lake]["yearly"][depth]["RCP45"]["y_ave"],
        },
        {
          x: data[lake]["yearly"][depth]["RCP85"]["x"],
          y: data[lake]["yearly"][depth]["RCP85"]["y_ave"],
        },
      ];
      seasonal = [
        {
          y: data[lake]["seasonal"][depth][period]["RCP26"]["ave"],
          x: [
            ...Array(
              data[lake]["seasonal"][depth][period]["RCP26"]["ave"].length
            ).keys(),
          ],
        },
        {
          y: data[lake]["seasonal"][depth][period]["RCP45"]["ave"],
          x: [
            ...Array(
              data[lake]["seasonal"][depth][period]["RCP45"]["ave"].length
            ).keys(),
          ],
        },
        {
          y: data[lake]["seasonal"][depth][period]["RCP85"]["ave"],
          x: [
            ...Array(
              data[lake]["seasonal"][depth][period]["RCP85"]["ave"].length
            ).keys(),
          ],
        },
      ];
    }

    var perioddict = {
      p1: "1980 - 2011",
      p2: "2012 - 2040",
      p3: "2041 - 2070",
      p4: "2071 - 2100",
    };

    var depthdict = { surface: "Surface", bottom: "Bottom" };

    return (
      <div className="ch2018graph">
        <div className="selections">
          <table>
            <tbody>
              <tr>
                <td>Lake</td>
                <td>Surface/ Bottom</td>
                <td>Time Period</td>
              </tr>
              <tr>
                <td>
                  <select value={lake} onChange={this.updateLake}>
                    {lake_options}
                  </select>
                </td>
                <td>
                  <select value={depth} onChange={this.updateDepth}>
                    <option value="surface">Surface</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </td>
                <td>
                  <select value={period} onChange={this.updatePeriod}>
                    <option value="p1">1980 - 2011</option>
                    <option value="p2">2012 - 2040</option>
                    <option value="p3">2041 - 2070</option>
                    <option value="p4">2071 - 2100</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="left">
          <D3LineGraph
            data={yearly}
            title={`Average Yearly ${depthdict[depth]} Temperature for Lake ${lake}`}
            xlabel={"Year"}
            ylabel={`${depthdict[depth]} Temperature`}
            yunits={"°C"}
            lcolor={lcolor}
            lweight={lweight}
            xscale={"linear"}
            yscale={"linear"}
            legend={legend}
          />
        </div>
        <div className="right">
          <div className="upper"></div>
          <div className="lower">
            <D3LineGraph
              data={seasonal}
              title={`Seasonal ${depthdict[depth]} Temperature for Lake ${lake} (${perioddict[period]})`}
              xlabel={"Day of Year"}
              ylabel={`${depthdict[depth]} Temperature`}
              yunits={"°C"}
              lcolor={lcolor}
              lweight={lweight}
              xscale={"linear"}
              yscale={"linear"}
              legend={legend}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Ch2018Graph;

import React, { Component } from "react";
import axios from "axios";
import { apiUrl } from "../../../config.json";
import "../datadetail.css";
import Basemap from "../../../graphs/leaflet/basemap";
import Loading from "../../../components/loading/loading";
import MapControl from "../../../components/mapcontrol/mapcontrol";
import menuicon from "../img/menuicon.svg";
import sliceicon from "../img/sliceicon.svg";
import timeicon from "../img/timeicon.svg";
import profileicon from "../img/profileicon.svg";
import colorlist from "../../../components/colorramp/colors";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";
import FilterBox from "../../../components/filterbox/filterbox";
import MapMenu from "../../../components/mapmenu/mapmenu";
import MapLayers from "../../../components/maplayers/maplayers";
import Legend from "../../../components/legend/legend";
import DatetimeDepthSelector from "../../../components/sliders/datetimedepthselector";

class ch2018Graph extends Component {
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
    var { dataset } = this.props;
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
    if (Object.keys(data).length > 0) {
      lcolor = ["green", "orange", "red"];
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

    return (
      <div className="ch2018graph">
        <div className="left">
          <D3LineGraph
            data={yearly}
            title={`Average Yearly ${depth} Temperature for Lake ${lake}`}
            xlabel={"Year"}
            ylabel={`${depth} Temperature`}
            yunits={"°C"}
            lcolor={lcolor}
            lweight={lweight}
            bcolor={"white"}
            xscale={"linear"}
            yscale={"linear"}
            user_id={"yearly"}
          />
        </div>
        <div className="right">
          <div className="upper">Stratification Graph</div>
          <div className="lower">
            <D3LineGraph
              data={seasonal}
              title={`Seasonal ${depth} Temperature for Lake ${lake}`}
              xlabel={"Day of Year"}
              ylabel={`${depth} Temperature`}
              yunits={"°C"}
              lcolor={lcolor}
              lweight={lweight}
              bcolor={"white"}
              xscale={"linear"}
              yscale={"linear"}
            />
          </div>
        </div>
        <div className="selections">
          <div className="lake">
            Selected Lake:{" "}
            <select value={lake} onChange={this.updateLake}>
              {lake_options}
            </select>
          </div>
          <div className="depth">
            Selected Depth:{" "}
            <select value={depth} onChange={this.updateDepth}>
              <option value="surface">Surface</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
}

export default ch2018Graph;

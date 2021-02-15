import React, { Component } from "react";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import Basemap from "../../graphs/leaflet/basemap";
import axios from "axios";
import { apiUrl } from "../../../src/config.json";
import "./lakes.css";
import D3LineGraph from "../../graphs/d3/linegraph/linegraph";

class LakeData extends Component {
  state = {
    morphology: {},
    title: "",
    data: [],
    xlabel: "",
    xlabels: [],
    ylabel: "",
    xunits: "",
    yunits: "",
    interpolated: true,
  };

  download = () => {
    function getValues(keys, download) {
      return keys.map((d) => download[d].values[i]);
    }
    var { morphology, title } = this.state;
    var download = JSON.parse(JSON.stringify(morphology));
    delete download.id;
    var keys = Object.keys(download);
    var csv = `data:text/csv;charset=utf-8, ${keys
      .map((d) => `${d} (${download[d].unit})`)
      .join(",")}\n`;
    for (var i = 0; i < download["Depth"].values.length; i++) {
      csv = csv + `${getValues(keys, download).join(",")}\n`;
    }
    var name = title.split(" ").join("_") + ".csv";
    var encodedUri = encodeURI(csv);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
  };

  onChangeX = (event) => {
    var { ylabel, morphology, interpolated } = this.state;
    var xlabel = event.target.value;
    var { data, xunits } = this.prepareGraph(
      xlabel,
      ylabel,
      morphology,
      interpolated
    );
    this.setState({ data, xunits, xlabel });
  };

  toggleInterpolated = () => {
    var { xlabel, ylabel, morphology, interpolated } = this.state;
    interpolated = !interpolated;
    var { data } = this.prepareGraph(xlabel, ylabel, morphology, interpolated);
    this.setState({ interpolated, data });
  };

  prepareGraph = (xlabel, ylabel, morphology, interpolated) => {
    var data;
    if (interpolated) {
      data = {
        y: morphology[ylabel].values,
        x: morphology[xlabel].values,
      };
    } else {
      var x = [];
      var y = [];
      for (var i = 0; i < morphology["Interpolated"].values.length; i++) {
        if (!morphology["Interpolated"].values[i]) {
          x.push(morphology[xlabel].values[i]);
          y.push(morphology[ylabel].values[i]);
        }
      }
      data = { x, y };
    }
    var xunits = morphology[xlabel].unit;
    var yunits = morphology[ylabel].unit;
    return { data, xunits, yunits };
  };

  async componentDidMount() {
    var { lake } = this.props;
    var { interpolated } = this.state;
    if (lake.morphology) {
      var { data: morphology } = await axios.get(
        `${apiUrl}/externaldata/morphology/${lake.id}`
      );
      for (var key of Object.keys(morphology)) {
        if (!["id", "Interpolated"].includes(key)) {
          morphology[key].values = morphology[key].values.map((d) =>
            parseFloat(d)
          );
        }
      }
      var title = lake.name + " Morphology";
      var ylabel = "Depth";

      var xlabels = Object.keys(morphology).filter(
        (m) => !["id", "Depth", "Interpolated"].includes(m)
      );

      var xlabel = xlabels[0];

      var { data, xunits, yunits } = this.prepareGraph(
        xlabel,
        ylabel,
        morphology,
        interpolated
      );

      this.setState({
        morphology,
        title,
        data,
        xlabel,
        xlabels,
        ylabel,
        xunits,
        yunits,
      });
    }
  }

  render() {
    var { lake, geojson } = this.props;
    var {
      data,
      title,
      xlabel,
      xlabels,
      ylabel,
      xunits,
      yunits,
      interpolated,
    } = this.state;
    return (
      <React.Fragment>
        <h1>Lake Information - {lake.name}</h1>
        <SidebarLayout
          sidebartitle="Lake Properties"
          left={
            <React.Fragment>
              <div className="lakes-map-short">
                <Basemap basemap="datalakesmapgrey" geojson={geojson} />
              </div>
              {lake.morphology && (
                <div className="lake-morphology">
                  <div className="lakes-graph-short">
                    <D3LineGraph
                      data={data}
                      title={title}
                      xlabel={xlabel}
                      ylabel={ylabel}
                      xunits={xunits}
                      yunits={yunits}
                      lcolor={["black"]}
                      lweight={["1"]}
                      bcolor={"white"}
                      xscale={"linear"}
                      yscale={"linear"}
                      yReverse={true}
                      xReverse={false}
                    />
                  </div>
                  <div className="interpolated">
                    Show interpolated values{" "}
                    <input
                      type="checkbox"
                      checked={interpolated}
                      onChange={this.toggleInterpolated}
                    />
                  </div>
                  <div className="xselect">
                    <select onChange={this.onChangeX} value={xlabel}>
                      {xlabels.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                    <button onClick={this.download}>Download</button>
                  </div>
                </div>
              )}
            </React.Fragment>
          }
          rightNoScroll={<React.Fragment></React.Fragment>}
        />
      </React.Fragment>
    );
  }
}

class Lakes extends Component {
  state = {
    lakes: [],
    geojson: false,
  };
  urlSafe = (str) => {
    var clean = [
      { b: "ä", a: "a" },
      { b: "ö", a: "o" },
      { b: "ü", a: "u" },
      { b: "è", a: "e" },
      { b: "é", a: "e" },
      { b: "à", a: "a" },
      { b: "ù", a: "u" },
      { b: "â", a: "a" },
      { b: "ê", a: "e" },
      { b: "î", a: "i" },
      { b: "ô", a: "o" },
      { b: "û", a: "u" },
      { b: "ç", a: "c" },
      { b: "ë", a: "e" },
      { b: "ï", a: "i" },
      { b: "ü", a: "u" },
      { b: "ì", a: "i" },
      { b: "ò", a: "o" },
      { b: "ó", a: "o" },
    ];
    for (let edit in clean) {
      str = str.replace(edit.b, edit.a);
    }

    return str.replace(/[^a-zA-Z]/g, "").toLowerCase();
  };

  setLocation = (name, id) => {
    const pathname = this.props.location.pathname;
    this.props.history.push({
      pathname: pathname,
      search: this.urlSafe(name) + "_" + id,
    });
  };

  async componentDidMount() {
    let server = await Promise.all([
      axios.get(apiUrl + "/selectiontables/lakes"),
      axios.get(apiUrl + "/externaldata/lakejson"),
    ]).catch((error) => {
      console.error(error);
    });
    var lakes = server[0].data;
    var geojson = server[1].data;
    this.setState({ lakes, geojson });
  }
  render() {
    document.title = "Lakes - Datalakes";
    let { search } = this.props.location;
    var { lakes, geojson } = this.state;

    if (
      search &&
      lakes.map((l) => l.id).includes(parseInt(search.split("_")[1]))
    ) {
      var lake = lakes.find((l) => l.id === parseInt(search.split("_")[1]));
      return <LakeData lake={lake} geojson={geojson} />;
    } else {
      return (
        <React.Fragment>
          <h1>Lake Information</h1>
          <SidebarLayout
            sidebartitle="Lake List"
            left={
              <React.Fragment>
                <div className="lakes-map">
                  <Basemap basemap="datalakesmapgrey" geojson={geojson} />
                </div>
              </React.Fragment>
            }
            rightNoScroll={
              <React.Fragment>
                {lakes.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => this.setLocation(l.name, l.id)}
                  >
                    {l.name}
                  </div>
                ))}
              </React.Fragment>
            }
          />
        </React.Fragment>
      );
    }
  }
}

export default Lakes;

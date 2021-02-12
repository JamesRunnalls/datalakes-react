import React, { Component } from "react";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import Basemap from "../../graphs/leaflet/basemap";
import axios from "axios";
import { apiUrl } from "../../../src/config.json";
import "./lakes.css";

class LakeData extends Component {
  state = {};
  render() {
    var { name, geojson } = this.props;
    return (
      <React.Fragment>
        <h1>Lake Information - {name}</h1>
        <SidebarLayout
          sidebartitle="Lake Properties"
          left={
            <React.Fragment>
              <div className="lakes-map-short">
                <Basemap basemap="datalakesmapgrey" geojson={geojson} />
              </div>
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
      return <LakeData name={lake.name} geojson={geojson} />;
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

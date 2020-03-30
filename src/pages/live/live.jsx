import React, { Component } from "react";
import { Link } from "react-router-dom";
import GIS from "../../components/gis/gis";
import FilterBox from "../../components/filterbox/filterbox";
import "./live.css";

class LakeStations extends Component {
  render() {
    return (
      <div className="lakestations">
        <Link to="/live/lexplore">
          <div
            className="lakestations-item"
            title="See live data from Lexplore lake station"
          >
            LéXPLORE
          </div>
        </Link>
        <Link to="/live/buchillon">
          <div
            className="lakestations-item"
            title="See live data from Buchillon lake station"
          >
            Buchillon
          </div>
        </Link>
      </div>
    );
  }
}

class Live extends Component {
  getQueryParams = (defaultSelected, defaultHidden) => {
    const pathname = this.props.location.pathname;
    var selected = defaultSelected;
    var hidden = defaultHidden;
    try {
      var { search } = this.props.location;
      if (search) {
        search = search.replace("?", "").split("&");
        var s = search[0].split("=")[1].split(",");
        var h = search[1].split("=")[1].split(",");
        s = s.map(x => parseInt(x, 10)).filter(x => !isNaN(x));
        h = h.map(x => parseInt(x, 10)).filter(x => !isNaN(x));

        if (s.length > 0) selected = s;
        if (h.length > 0) hidden = h;
      } else {
        this.props.history.push({
          pathname: pathname,
          search:
            "?selected=" + selected.toString() + "&hidden=" + hidden.toString()
        });
      }
    } catch (e) {
      console.log(e);
      this.props.history.push({
        pathname: pathname,
        search:
          "?selected=" + selected.toString() + "&hidden=" + hidden.toString()
      });
    }

    return { selected: selected, hidden: hidden };
  };
  setQueryParams = (selected, hidden) => {
    let pathname = this.props.location.pathname;
    this.props.history.push({
      pathname: pathname,
      search:
        "?selected=" + selected.toString() + "&hidden=" + hidden.toString()
    });
  };
  render() {
    return (
      <GIS
        title="Live Conditions"
        documentTitle="Live - Datalakes"
        selected={[3, 0]}
        hidden={[]}
        setQueryParams={this.setQueryParams}
        getQueryParams={this.getQueryParams}
        sidebarextratop={
          <FilterBox
            title="Lake Stations"
            preopen="true"
            content={<LakeStations />}
          />
        }
      />
    );
  }
}

export default Live;

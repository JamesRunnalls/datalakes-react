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
  getQueryParams = (defaultSelected) => {
    const pathname = this.props.location.pathname;
    var selected = defaultSelected;
    try {
      var { search } = this.props.location;
      if (search) {
        search = search.replace("?", "").split("&");
        var s = JSON.parse(search[0].split("=")[1]);
        if (s.length > 0) selected = s;
      } else {
        this.props.history.push({
          pathname: pathname,
          search: "?selected=" + JSON.stringify(selected),
        });
      }
    } catch (e) {
      console.log(e);
      this.props.history.push({
        pathname: pathname,
        search: "?selected=" + JSON.stringify(selected),
      });
    }

    return { selected: selected };
  };
  setQueryParams = (selected) => {
    let pathname = this.props.location.pathname;
    this.props.history.push({
      pathname: pathname,
      search: "?selected=" + JSON.stringify(selected),
    });
  };
  render() {
    return (
      <GIS
        title="Live Conditions"
        documentTitle="Live - Datalakes"
        selected={[
          [9, 7],
          [3, 5],
        ]}
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

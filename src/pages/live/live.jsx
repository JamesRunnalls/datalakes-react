import React, { Component } from "react";
import { Link } from "react-router-dom";
import GIS from "../../components/gis/gis";
import FilterBox from "../../components/filterbox/filterbox";
import "./live.css";

class LakeStations extends Component {
  state = {};
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
  render() {
    return (
      <GIS
        title="Live Conditions"
        documentTitle="Live - Datalakes"
        selected={[3,0]}
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

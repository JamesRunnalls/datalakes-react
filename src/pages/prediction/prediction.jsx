import React, { Component } from "react";
import FilterBox from "../../components/filterbox/filterbox";
import GIS from "../../components/gis/gis";
import "./prediction.css";

class LakeModels extends Component {
  render() {
    return (
      <div className="lakestations">
        <a
          href="http://meteolakes.ch/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div
            className="lakestations-item"
            title="See 3D lake model predictions"
          >
            Meteolakes
          </div>
        </a>
        <a
          href="https://simstrat.eawag.ch/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div
            className="lakestations-item"
            title="See 1D lake model predictions"
          >
            Simstrat
          </div>
        </a>
      </div>
    );
  }
}

class Prediction extends Component {
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
        title="Lake Predictions"
        documentTitle="Predictions - Datalakes"
        selected={[[11,5],[12,25],[10,5]]}
        setQueryParams={this.setQueryParams}
        getQueryParams={this.getQueryParams}
        sidebarextratop={
          <FilterBox
            title="Swiss Lake Models"
            preopen="true"
            content={<LakeModels />}
          />
        }
      />
    );
  }
}

export default Prediction;

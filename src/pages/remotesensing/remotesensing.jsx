import React, { Component } from "react";
//import { Link } from "react-router-dom";
import GIS from "../../components/gis/gis";

class RemoteSensing extends Component {
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
        title="Remote Sensing"
        documentTitle="Remote Sensing - Datalakes"
        selected={[]}
        hidden={[]}
        setQueryParams={this.setQueryParams}
        getQueryParams={this.getQueryParams}
      />
    );
  }
}

export default RemoteSensing;

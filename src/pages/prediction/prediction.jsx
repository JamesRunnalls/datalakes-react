import React, { Component } from "react";
//import { Link } from "react-router-dom";
import GIS from "../../components/gis/gis";

class Prediction extends Component {
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
        title="Lake Predictions"
        documentTitle="Predictions - Datalakes"
        selected={[[18,6]]}
        hidden={[]}
        setQueryParams={this.setQueryParams}
        getQueryParams={this.getQueryParams}
      />
    );
  }
}

export default Prediction;

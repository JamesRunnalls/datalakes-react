import React, { Component } from "react";
//import { Link } from "react-router-dom";
import GIS from "../../components/gis/gis";

class RemoteSensing extends Component {
  render() {
    var colors = [
      { color: "#000080", point: 0.0 },
      { color: "#3366ff", point: 0.0033388981636060114 },
      { color: "#00b0dc", point: 0.015025041736227053 },
      { color: "#009933", point: 0.04006677796327214 },
      { color: "#ffff5b", point: 0.0818030050083473 },
      { color: "#e63300", point: 0.16527545909849758 },
      { color: "#cc0000", point: 0.4156928213689484 },
      { color: "#800000", point: 1.0 }
    ];
    return (
      <GIS
        title="Remote Sensing"
        documentTitle="Remote Sensing - Datalakes"
        selected={[0, 2]}
        colors={colors}
      />
    );
  }
}

export default RemoteSensing;

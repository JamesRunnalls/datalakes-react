import React, { Component } from "react";
//import { Link } from "react-router-dom";
import GIS from "../../components/gis/gis";

class Prediction extends Component {
  render() {
    var colors = [
      { color: "#0000ff", point: 0 },
      { color: "#ff0000", point: 1 }
    ];
    return (
      <GIS
        title="Lake Predictions"
        documentTitle="Predictions - Datalakes"
        selected={[9, 8]}
        colors={colors}
      />
    );
  }
}

export default Prediction;

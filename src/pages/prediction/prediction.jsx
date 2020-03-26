import React, { Component } from "react";
//import { Link } from "react-router-dom";
import GIS from "../../components/gis/gis";

class Prediction extends Component {
  render() {
    return (
      <GIS
        title="Lake Predictions"
        documentTitle="Predictions - Datalakes"
        selected={[9, 8]}
      />
    );
  }
}

export default Prediction;

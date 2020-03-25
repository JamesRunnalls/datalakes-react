import React, { Component } from "react";
//import { Link } from "react-router-dom";
import GIS from "../../components/gis/gis";

class Live extends Component {
  render() {
    var colors = [
      { color: "#000080", point: 0 },
      { color: "#3366FF", point: 0.142857142857143 },
      { color: "#00B0DC", point: 0.285714285714286 },
      { color: "#009933", point: 0.428571428571429 },
      { color: "#FFFF5B", point: 0.571428571428571 },
      { color: "#E63300", point: 0.714285714285714 },
      { color: "#CC0000", point: 0.857142857142857 },
      { color: "#800000", point: 1 }
    ];
    return (
      <GIS
        title="Live Conditions"
        documentTitle="Live - Datalakes"
        selected={[0, 1]}
        colors={colors}
      />
    );
  }
}

export default Live;

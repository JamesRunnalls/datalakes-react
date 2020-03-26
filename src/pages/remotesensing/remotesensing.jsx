import React, { Component } from "react";
//import { Link } from "react-router-dom";
import GIS from "../../components/gis/gis";

class RemoteSensing extends Component {
  render() {
    return (
      <GIS
        title="Remote Sensing"
        documentTitle="Remote Sensing - Datalakes"
        selected={[0, 2]}
      />
    );
  }
}

export default RemoteSensing;

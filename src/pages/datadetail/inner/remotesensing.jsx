import React, { Component } from "react";
import "../datadetail.css";
import Basemap from "../../../graphs/leaflet/basemap";

class RemoteSensing extends Component {
  state = {
    selectedlayers: [],
  };
  componentDidMount() {
    //var { dataset, files } = this.props;
  }
  render() {
    var { dataset } = this.props;
    var { selectedlayers } = this.state;
    return (
      <div className="basemapwrapper">
        <Basemap selectedlayers={selectedlayers} datasets={[dataset]} />
      </div>
    );
  }
}

export default RemoteSensing;
import React, { Component } from "react";
//import { Link } from "react-router-dom";
import GISMap from "../../graphs/leaflet/gis_map";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import axios from "axios";
import { apiUrl } from "../../../config.json";
import FilterBox from "../../components/filterbox/filterbox";
import "./live.css";
import MapLayers from "../../components/maplayers/maplayers";
import AddLayers from "../../components/addlayers/addlayers";
import Legend from "../../components/legend/legend";
import GIS from "../../components/gis/gis";

class Live extends Component {
  render() { 
    return ( 
      <GIS title="Live Conditions" documentTitle="Live - Datalakes" selected={[0,1]} />
     );
  }
}
 
export default Live;

import React, { Component } from "react";
import axios from "axios";
import "../datadetail.css";
import Basemap from "../../../graphs/leaflet/basemap";
import "../threed.css";
import Loading from "../../../components/loading/loading";
import MapControl from "../../../components/mapcontrol/mapcontrol";
import menuicon from "../img/menuicon.svg";
import sliceicon from "../img/sliceicon.svg";
import timeicon from "../img/timeicon.svg";
import profileicon from "../img/profileicon.svg";

class ThreeDModel extends Component {
  state = {
    selectedlayers: [],
    profile: false,
    timeline: false,
    slice: false,
    menu: false,
    fullsize: false,
    help: false,
    point: false,
    pointValue: {},
    line: false,
    lineValue: [],
    loading: true,
    zoomIn: () => {},
    zoomOut: () => {},
  };

  setZoomIn = (newFunc) => {
    this.setState({ zoomIn: newFunc });
  };

  setZoomOut = (newFunc) => {
    this.setState({ zoomOut: newFunc });
  };

  toggleHelp = () => {
    this.setState({
      help: !this.state.help,
      menu: false,
    });
  };

  toggleMenu = () => {
    this.setState({
      menu: !this.state.menu,
      help: false,
    });
  };

  toggleProfile = () => {
    this.setState({
      profile: !this.state.profile,
      timeline: false,
      slice: false,
      menu: false,
      help: false,
      line: false,
      point: !this.state.profile,
    });
  };

  toggleTimeline = () => {
    this.setState({
      timeline: !this.state.timeline,
      slice: false,
      menu: false,
      help: false,
      profile: false,
      line: false,
      point: !this.state.timeline,
    });
  };

  toggleSlice = () => {
    this.setState({
      slice: !this.state.slice,
      timeline: false,
      menu: false,
      help: false,
      profile: false,
      point: false,
      line: !this.state.slice,
    });
  };

  updatePoint = (pointValue) => {
    this.setState({ pointValue });
  };

  updateLine = (lineValue) => {
    this.setState({ lineValue });
  };

  async componentDidMount() {
    var { files } = this.props;
    var depths = [
      ...new Set(files.map((item) => parseFloat(item.mindepth))),
    ].sort(function (a, b) {
      return a - b;
    });
    var times = [...new Set(files.map((item) => item.mindatetime))];
    times = times
      .map((t) => new Date(t))
      .sort(function (a, b) {
        return a - b;
      });
    var depth = depths[0];
    var time = times[0];
    var file = files.find(
      (f) => f.mindepth === String(depth) && f.mindatetime === time.toISOString()
    );
    var dataArray = new Array(files.length).fill(0);
    var { data } = await axios.get(file.filelink).catch((error) => {
      console.log(error);
    });
    dataArray[0] = data;
    this.setState({
      loading: false,
      data: dataArray,
      depths,
      times,
      depth,
      time,
      file,
    });
  }
  render() {
    var { dataset } = this.props;
    var {
      selectedlayers,
      menu,
      profile,
      timeline,
      slice,
      fullsize,
      help,
      point,
      line,
      loading,
      zoomIn,
      zoomOut,
    } = this.state;
    var controls = [
      { title: "Menu", active: menu, onClick: this.toggleMenu, img: menuicon },
      {
        title: "Profile",
        active: profile,
        onClick: this.toggleProfile,
        img: profileicon,
      },
      {
        title: "Timeline",
        active: timeline,
        onClick: this.toggleTimeline,
        img: timeicon,
      },
      {
        title: "Slice",
        active: slice,
        onClick: this.toggleSlice,
        img: sliceicon,
      },
    ];

    return (
      <div className="threed">
        <div className="basemapwrapper">
          <div className="controls">
            <MapControl
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              fullsize={fullsize}
              controls={controls}
              help={help}
              toggleHelp={this.toggleHelp}
            />
          </div>
          <Basemap
            selectedlayers={selectedlayers}
            datasets={[dataset]}
            setZoomIn={this.setZoomIn}
            setZoomOut={this.setZoomOut}
            point={point}
            line={line}
            updatePoint={this.updatePoint}
            updateLine={this.updateLine}
          />
          {loading && (
            <div className="map-loader">
              <Loading />
              Downloading and plotting data
            </div>
          )}
        </div>
        <div className="graphwrapper"></div>
      </div>
    );
  }
}

export default ThreeDModel;

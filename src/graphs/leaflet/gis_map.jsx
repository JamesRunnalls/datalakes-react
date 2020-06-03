import React, { Component } from "react";
import Loading from "../../components/loading/loading";
import LayerGroups from "../../components/layergroups/layergroups";
import "./css/gis_map.css";
import Basemap from "./basemap";
import MapControl from "../../components/mapcontrol/mapcontrol";
import menuicon from "./img/menuicon.svg";
import groupicon from "./img/groupicon.svg";

class GISMap extends Component {
  state = {
    help: false,
    fullsize: false,
    loading: false,
    group: false,
    menu: false,
    initial: true,
    zoomIn: () => {},
    zoomOut: () => {},
  };

  setZoomIn = (newFunc) => {
    this.setState({ zoomIn: newFunc });
  };

  setZoomOut = (newFunc) => {
    this.setState({ zoomOut: newFunc });
  };

  toggleFullsize = () => {
    this.setState({ fullsize: !this.state.fullsize });
  };

  toggleHelp = () => {
    this.setState({ group: false, help: !this.state.help });
  };

  toggleMenu = () => {
    this.setState({ group: false, menu: !this.state.menu });
  };

  toggleGroup = () => {
    this.setState({ help: false, menu: false, group: !this.state.group });
  };

  componentDidUpdate() {
    if (!this.props.loading && this.state.initial) {
      if (this.props.selectedlayers.length > 0) {
        this.setState({ menu: true, initial: false });
      } else {
        this.setState({ group: true, initial: false });
      }
    }
  }

  render() {
    var { help, fullsize, menu, group, zoomIn, zoomOut } = this.state;
    var {
      legend,
      timeselector,
      loading,
      sidebar,
      updateState,
      selectedlayers,
      basemap,
      datasets,
      datetime,
      depth,
      templates,
    } = this.props;
    var controls = [
      {
        title: "Edit Layers",
        active: menu,
        onClick: this.toggleMenu,
        img: menuicon,
      },
      {
        title: "Layer Groups",
        active: group,
        onClick: this.toggleGroup,
        img: groupicon,
      },
    ];
    return (
      <React.Fragment>
        <div className={fullsize ? "map full" : "map"}>
          <div className="gis-controls">
            <MapControl
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              fullsize={fullsize}
              help={help}
              controls={controls}
              toggleFullsize={this.toggleFullsize}
              toggleHelp={this.toggleHelp}
            />
          </div>
          <Basemap
            selectedlayers={selectedlayers}
            basemap={basemap}
            loading={loading}
            datasets={datasets}
            depth={depth}
            datetime={datetime}
            templates={templates}
            setZoomIn={this.setZoomIn}
            setZoomOut={this.setZoomOut}
          />

          {loading && (
            <div className="map-loader">
              <Loading />
              Downloading and plotting data
            </div>
          )}

          <div className="sidebar-gis">
            <div
              className={menu ? "sidebar-gis-inner" : "sidebar-gis-inner hide"}
            >
              <div
                className="sidebar-title"
                onClick={this.toggleMenu}
                title="Hide plot controls"
              >
                Edit Layers
                <div className="sidebar-symbol">{"\u2715"}</div>
              </div>
              <div className="sidebar-content">{sidebar}</div>
            </div>

            <div
              className={
                group ? "sidebar-gis-inner wide" : "sidebar-gis-inner wide hide"
              }
            >
              <div
                className="sidebar-title"
                onClick={this.toggleGroup}
                title="Hide plot controls"
              >
                Layer Groups
                <div className="sidebar-symbol">{"\u2715"}</div>
              </div>
              <div className="sidebar-content">
                <LayerGroups
                  toggleMenu={this.toggleMenu}
                  updateState={updateState}
                  arr={selectedlayers}
                />
              </div>
            </div>

            <div
              className={help ? "sidebar-gis-inner" : "sidebar-gis-inner hide"}
            >
              <div
                className="sidebar-title"
                onClick={this.toggleHelp}
                title="Hide help"
              >
                Help
                <div className="sidebar-symbol">{"\u2715"}</div>
              </div>
              <div className="sidebar-content">{help}</div>
            </div>
          </div>
          <div className="timeselector-gis">{timeselector}</div>
          {legend}
        </div>
      </React.Fragment>
    );
  }
}

export default GISMap;

import React, { Component } from "react";
import editlayers from "./img/editlayers.svg";
import drawing from "./img/drawing.svg";
import "./layergroups.css";

class Group extends Component {
  clickOnGroup = () => {
    var { updateState, toggleMenu, properties } = this.props;
    var { data } = properties;
    toggleMenu();
    updateState(data);
  };
  render() {
    var { name, img } = this.props.properties;
    return (
      <div className="layergroups-item" onClick={this.clickOnGroup}>
        <img src={img} alt={name} />
        <div>{name}</div>
      </div>
    );
  }
}

class LayerGroups extends Component {
  render() {
    var { toggleMenu, updateState, arr } = this.props;
    var groups = [
      {
        name: "Build map from scratch",
        description: "Some description",
        img: drawing,
        data: { selected: [] },
      },
      {
        name: "Live Wind Speed",
        description: "Some description",
        img: editlayers,
        data: { selected: [[9, 7]] },
      },
      {
        name: "Lake Zurich 3D Model",
        description: "Some description",
        img: editlayers,
        data: { selected: [[11, 5],[11,25]], center: [47.282, 8.729], zoom: 12 },
      },
    ];
    return (
      <div className="layergroups">
        {arr.length === 0 && (
          <div className="layergroups-welcome-message">
            Welcome to the Datalakes Map Viewer. This is an online GIS service
            for visualising geospatial data. Get started by adding one of the
            pre-prepared layer packages below or if you know what you're looking
            for, start your map from scratch.
          </div>
        )}
        {groups.map((g) => (
          <Group
            key={g.name}
            properties={g}
            updateState={updateState}
            toggleMenu={toggleMenu}
          />
        ))}
      </div>
    );
  }
}

export default LayerGroups;

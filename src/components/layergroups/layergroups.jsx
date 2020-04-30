import React, { Component } from "react";
import editlayers from "./img/editlayers.svg";
import "./layergroups.css";

class Group extends Component {
  render() {
    var { properties, updateState } = this.props;
    var { name, description, img, data } = properties;
    return (
      <div
        className="layergroups-item"
        onClick={() => {
          updateState(data);
        }}
      >
        <img src={img} alt={name}/>
        <div>{name}</div>
      </div>
    );
  }
}

class LayerGroups extends Component {
  render() {
    var { toggleMenu, updateState } = this.props;
    var groups = [
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
        data: { selected: [[11,5]], center: [47.282,8.729], zoom: 12 },
      },
    ];
    return (
      <div className="layergroups">
        <div className="layergroups-item" onClick={toggleMenu}>
          <img src={editlayers} alt="Build your map from scratch" />
          <div>Build your map from scratch</div>
        </div>
        {groups.map((g) => (
          <Group key={g.name} properties={g} updateState={updateState} />
        ))}
      </div>
    );
  }
}

export default LayerGroups;

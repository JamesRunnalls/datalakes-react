import React, { Component } from "react";
import editlayers from './img/editlayers.svg';
import './layergroups.css';

class Group extends Component {
  state = {};
  render() {
    var { name, description, img } = this.props.properties;
    return (
      <div className="layergroups-item">
        <img src={img} />
        <div>{name}</div>
      </div>
    );
  }
}

class LayerGroups extends Component {
  state = {};
  render() {
    var { toggleMenu } = this.props;
    var groups = [
      {
        name: "Live Water Temperature",
        description: "Some description",
        img: editlayers,
      },
      {
        name: "Live Air Temperature",
        description: "Some description",
        img: editlayers,
      }
    ];
    return (
      <div className="layergroups">
        <div className="layergroups-item"></div>
        {groups.map((g) => (
          <Group properties={g} />
        ))}
      </div>
    );
  }
}

export default LayerGroups;

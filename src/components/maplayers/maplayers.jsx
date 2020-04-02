import React, { Component } from "react";
import "./maplayers.css";
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from "react-sortable-hoc";
import RasterLegendItem from "../legend/rasterlegenditem";
import MarkerLegendItem from "../legend/markerlegenditem";
import DropDown from "./dropdown";

class GroupDisplay extends Component {
  state = {};
  render() {
    var { display } = this.props;
    var {
      plot,
      min,
      max,
      unit,
      sourcelink,
      sourcetext,
      description,
      colors,
      markerFixedSize,
      markerSymbol
    } = display;
    var inner = <div></div>;
    if (plot === "marker")
      inner = (
        <MarkerLegendItem
          min={min}
          max={max}
          unit={unit}
          colors={colors}
          markerFixedSize={markerFixedSize}
          markerSymbol={markerSymbol}
        />
      );
    if (plot === "raster")
      inner = (
        <RasterLegendItem min={min} max={max} unit={unit} colors={colors} />
      );
    if (plot === "field")
      inner = (
        <RasterLegendItem min={min} max={max} unit={unit} colors={colors} />
      );
    return (
      <div>
        <div>{description}</div>
        {inner}
        Source:{" "}
        <a href={sourcelink} target="_blank" rel="noopener noreferrer">
          {sourcetext}
        </a>
      </div>
    );
  }
}

const SortableItem = SortableElement(({ layer, props }) => {
  var { id, name } = layer;
  var {
    maplayers,
    removeSelected,
    hidden,
    updateMapLayers,
    toggleLayerView
  } = props;
  return (
    <li tabIndex={0}>
      <DropDown
        key={id}
        name={name}
        allowSettings={true}
        display={layer}
        displayGroup={maplayers}
        removeSelected={removeSelected}
        id={id}
        hidden={hidden}
        onUpdate={updateMapLayers}
        toggleLayerView={toggleLayerView}
        content={<GroupDisplay key={id} display={layer} />}
      />
    </li>
  );
});

const SortableList = SortableContainer(({ props }) => {
  var { maplayers, selected } = props;
  if (maplayers.length < 1) selected = [];
  var selectlayers = selected.map(id =>
    maplayers.find(layer => layer.id === id)
  );
  return (
    <ul className="maplayers-list">
      {selectlayers.map((layer, index) => (
        <SortableItem
          key={`item-${index}`}
          index={index}
          layer={layer}
          props={props}
        />
      ))}
    </ul>
  );
});

class MapLayers extends Component {
  onSortEnd = ({ oldIndex, newIndex }) => {
    var { selected, setSelected } = this.props;
    selected = arrayMove(selected, oldIndex, newIndex);
    setSelected(selected);
  };
  render() {
    return (
      <SortableList
        props={this.props}
        onSortEnd={this.onSortEnd}
        distance={40}
      />
    );
  }
}

export default MapLayers;

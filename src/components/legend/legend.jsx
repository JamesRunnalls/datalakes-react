import React, { Component } from "react";
import "./legend.css";
import MarkerLegendItem from "./markerlegenditem";
import RasterLegendItem from "./rasterlegenditem";

class Legend extends Component {
  state = {
    open: false
  };
  toggle = () => {
    this.setState({ open: !this.state.open });
  };
  render() {
    var { maplayers } = this.props;
    var { open } = this.state;
    var legendmaplayers = maplayers.filter(layer => layer.legend);
    var inner = [];
    var l;
    for (var i = 0; i < legendmaplayers.length; i++) {
      l = legendmaplayers[i];
      if (l.plot === "marker") {
        inner.push(
          <div key={i} className="legend-inner">
            {l.name}
            <MarkerLegendItem
              min={l.min}
              max={l.max}
              unit={l.unit}
              colors={l.colors}
              markerFixedSize={l.markerFixedSize}
              markerSymbol={l.markerSymbol}
            />
            <a href={l.sourcelink} title="Data source">
              {l.sourcetext}
            </a>
          </div>
        );
      }
      if (l.plot === "raster") {
        inner.push(
          <div key={i} className="legend-inner">
            {l.name}
            <RasterLegendItem
              min={l.min}
              max={l.max}
              unit={l.unit}
              colors={l.colors}
            />
            <a href={l.sourcelink} title="Data source">
              {l.sourcetext}
            </a>
          </div>
        );
      }
      if (l.plot === "field") {
        inner.push(
          <div key={i} className="legend-inner">
            {l.name}
            <RasterLegendItem
              min={l.min}
              max={l.max}
              unit={l.unit}
              colors={l.colors}
            />
            <a href={l.sourcelink} title="Data source">
              {l.sourcetext}
            </a>
          </div>
        );
      }
    }
    return (
      <div className="legend">
        {inner.length > 0 && (
          <div className="legend-title" onClick={this.toggle}>
            <div className="legend-title-symbol">{open ? "▿" : "▹"}</div>
            <div className="legend-title-text">Legend</div>
          </div>
        )}
        <div className={open ? "legend-content" : "legend-content hide"}>
          {inner}
        </div>
      </div>
    );
  }
}

export default Legend;

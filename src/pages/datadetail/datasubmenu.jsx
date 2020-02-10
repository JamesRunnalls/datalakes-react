import React, { Component } from "react";
import heat from "./img/heat.svg";
import line from "./img/line.svg";
import preview from "./img/preview.svg";
import download from "./img/download.svg";
import pipe from "./img/pipe.svg";
import info from "./img/info.svg";
import "./datadetail.css";

class DataSubMenu extends Component {
    hide = (name, allowedStep) => {
        return !allowedStep.includes(name);
    }
    active = (name, step) => {
        return name === step;
    }

    render() {
      const { step, allowedStep, updateSelectedState } = this.props;
      return (
        <React.Fragment>
          <div className="data-subnav">
            <div
              title="Preview data as a heat map"
              className={this.active("heatmap",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("heatmap",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("heatmap")}
            >
              <img src={heat} className="subnav-img" alt="Heatmap" />
              <div className="subnav-text">Heat Map</div>
            </div>
            <div
              title="Preview data as a line graph"
              className={this.active("linegraph",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("linegraph",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("linegraph")}
            >
              <img src={line} className="subnav-img" alt="Line Graph" />
              <div className="subnav-text">Line Graph</div>
            </div>
            <div
              title="Preview data as a table"
              className={this.active("preview",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("preview",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("preview")}
            >
              <img src={preview} className="subnav-img" alt="Preview" />
              <div className="subnav-text">Preview</div>
            </div>
            <div
              title="Download data"
              className={this.active("download",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("download",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("download")}
            >
              <img src={download} className="subnav-img" alt="Download" />
              <div className="subnav-text">Download</div>
            </div>
            <div
              title="See the data lineage"
              className={this.active("pipeline",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("pipeline",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("pipeline")}
            >
              <img src={pipe} className="subnav-img" alt="Data Pipeline" />
              <div className="subnav-text">Pipeline</div>
            </div>
            <div
              title="See meta data for dataset"
              className={this.active("information",step) ? "subnav-item active" : "subnav-item"}
              style={{display: this.hide("information",allowedStep) && 'none'}}
              onClick={() => updateSelectedState("information")}
            >
              <img src={info} className="subnav-img" alt="Information" />
              <div className="subnav-text">Information</div>
            </div>
          </div>
        </React.Fragment>
      );
    }
  }

  export default DataSubMenu;
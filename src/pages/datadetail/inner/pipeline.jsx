import React, { Component } from "react";
import Database from "../img/data.svg";
import Python from "../img/python.svg";
import "../datadetail.css";

class Pipeline extends Component {
  render() {
    const { dataset } = this.props;
    if (dataset.renku === 1) {
      return (
        <div className="datadetail-padding">
          <div className="pipeline">
            <div className="pipeline-header">
              Lineage information for this dataset has not been provided by the
              Renku knowledge graph. <br />
              The lineage information has been added by the data owner and
              cannot be guaranteed to be reproducible.
            </div>
            <div className="diagram">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={
                  dataset.prefile.includes("http")
                    ? dataset.prefile
                    : `http://${dataset.prefile}`
                }
              >
                <img
                  src={Database}
                  alt="Database"
                  title="Click to see precursor dataset"
                />
                <div className="">Precursor Dataset</div>
              </a>
              <div className="separator half"></div>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={
                  dataset.prescript.includes("http")
                    ? dataset.prescript
                    : `http://${dataset.prescript}`
                }
              >
                <img
                  src={Python}
                  alt="Python"
                  title="Click to see processing script"
                />
                <div className="">Processing Script</div>
              </a>
              <div className="separator half"></div>
              <div >
                <img src={Database} alt="Database" />
                <div className="">This dataset</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return <div>See lineage in Renku</div>;
    }
  }
}

export default Pipeline;

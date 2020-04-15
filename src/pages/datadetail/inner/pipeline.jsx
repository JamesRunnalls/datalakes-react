import React, { Component } from "react";
import Database from "../img/data.svg";
import Python from "../img/python.svg";
import { apiUrl } from "../../../../src/config.json";
import "../datadetail.css";
import NetworkGraph from "../../../graphs/d3/networkgraph/networkgraph";

class Pipeline extends Component {
  render() {
    const { dataset, renku } = this.props;
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
              <div className="pipeline-icon">
                <img src={Database} alt="Database" />
                <div className="">This dataset</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      var { datasourcelink } = dataset;
      var { edges } = renku.data.lineage;

      function filterEdges(edges, id) {
        return edges.filter((e) => e.target === id);
      }

      function findScriptDataset(edges) {
        var escript = edges.find((e) => {
          return ["py", "r"].includes(e.source.split(".")[1]);
        });
        var edataset = edges.find((e) => e.source !== escript.source);
        return { escript, edataset };
      }

      // Create linage diagram
      var filepath = datasourcelink.split("/blob/")[1];
      filepath = filepath.split("/");
      filepath.shift();
      filepath = filepath.join("/");

      var diagram = [
        <div key="dat0" className="datasets">
          {filepath}
        </div>,
      ];
      var i = 1;
      var j = 0;
      while (i < 30 && j === 0) {
        var edge = filterEdges(edges, filepath);
        if (edge.length === 0) {
          j = 1;
        } else if (edge.length === 1) {
          if (edge[0].source.includes("cwl")) {
            diagram.unshift(
              <div key={"coa" + i} className="connector">
                &#8595;
              </div>
            );
            edge = filterEdges(edges, edge[0].source);
            var { escript, edataset } = findScriptDataset(edge);

            diagram.unshift(
              <div key={"scr" + i} className="script">
                {escript.source}
              </div>
            );
            diagram.unshift(
              <div key={"cob" + i} className="connector">
                &#8595;
              </div>
            );
            diagram.unshift(
              <div key={"dat" + i} className="datasets">
                {edataset.source}
              </div>
            );
            filepath = edataset.source;
          }
        } else if (edge.length > 1) {
          j = 1;
        }
        i++;
      }

      // Parse Links

      var gitlab = datasourcelink.split("/blob/")[0];
      var renkulab = gitlab.replace("gitlab", "projects");
      var downloadlink = apiUrl + "/renku/lineage/" + dataset.id;

      return (
        <div className="datadetail-padding">
          <div className="renku-pipeline">
            <div className="info-head">Data Pipeline</div>
            <div>
              <div className="pipeline-left">{diagram}</div>
              <div className="pipeline-right">
                <div className="accessType">
                  Open Access
                  <div className="accessOption">
                    1. Download zipped file of datasets and scripts required to
                    run pipeline
                    <a
                      href={downloadlink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button>Download</button>
                    </a>
                  </div>
                </div>
                <div className="accessType">
                  Access Depends on Project Visibility
                  <div className="accessOption">
                    2. View and interact with the full dataset on Renkulab.io.
                    Interactive environments are availble.
                    <a
                      href={renkulab}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button>Renkulab</button>
                    </a>
                  </div>
                  <div className="accessOption">
                    3. Clone the git Repository
                    <a href={gitlab} target="_blank" rel="noopener noreferrer">
                      <button>GitLab</button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="networkgraph-outer">
              <div className="networkgraph-inner">
                <NetworkGraph data={renku} dataset={dataset} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Pipeline;

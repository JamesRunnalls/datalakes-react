import React, { Component } from "react";
import { apiUrl } from "../../../../src/config.json";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import "../datadetail.css";
import NetworkGraph from "../../../graphs/d3/networkgraph/networkgraph";

class Pipeline extends Component {
  render() {
    const { dataset, renku, scriptFile } = this.props;
    var { datasourcelink, prescript } = dataset;
    var gitlab = datasourcelink.split("/blob/")[0];
    var renkulab = gitlab.replace("gitlab", "projects");
    var downloadlink = apiUrl + "/renku/lineage/" + dataset.id;

    var nameDict = { js: "javascript", r: "r", py: "python" };

    if (dataset.renku === 1) {
      var scriptName = "Appologies no processing script found.";
      var scriptType = "python"; // Default
      try {
        var scriptArr = prescript.split("/");
        scriptName = scriptArr.pop();
        var fileExt = scriptName.split(".")[1];
        if (nameDict[fileExt]) {
          scriptType = nameDict[fileExt];
        }
      } catch (e) {}

      return (
        <div className="datadetail-padding">
          <div className="pipeline">
            <div className="pipeline-right">
              <div className="accessType">
                Open Access
                <div className="accessOption">
                  1. Download example data and scripts package
                  <div className="pipeline-private">
                    Additional raw data can be obtained from the git repository.
                  </div>
                  <a
                    href={downloadlink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button>Download</button>
                  </a>
                </div>
              </div>
            </div>
            <div className="pipeline-right">
              <div className="accessType">
                Access Depends on Project Visibility
                <div className="accessOption">
                  2. Clone the git repository
                  <div className="pipeline-private">
                    Private repositories will cause a 404 error. Get in touch
                    for access to private repositories.
                  </div>
                  <a href={gitlab} target="_blank" rel="noopener noreferrer">
                    <button>GitLab</button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <h3>Proccessing Script</h3>
          <div className="pipeline-script">
            <div className="pipeline-head">
              <a href={prescript}>{scriptName}</a>
            </div>
            <div className="pipeline-body">
              <SyntaxHighlighter
                language={scriptType}
                style={github}
                wrapLines={true}
              >
                {scriptFile}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      );
    } else {
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

      return (
        <div className="datadetail-padding">
          <div className="pipeline">
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

import React, { Component } from "react";
import "swagger-ui-react/swagger-ui.css";
import SwaggerUI from "swagger-ui-react";
import "../datadetail.css";

class RemoteSensingDownload extends Component {
  state = {
    download: 0,
  };

  onChangeDownload = (event) => {
    this.setState({
      download: event.target.value,
    });
  };

  async componentDidMount() {
    var { files } = this.props;
    this.setState({ download: files.length - 1 });
  }

  render() {
    const { getLabel, dataset, files } = this.props;
    var { download } = this.state;
    var { mindatetime, maxdatetime } = dataset;
    mindatetime = new Date(mindatetime);
    maxdatetime = new Date(maxdatetime);

    var git = "https://gitlab.com/eawag-rs/sencast";
    var link = files[download].filelink;
    var linknc = files[download].filelink.replace(
      "remotesensing/",
      "remotesensing/nc/"
    );
    var filelist = [];
    for (var i = 0; i < files.length; i++) {
      filelist.push(
        <option key={files[i].id} value={i}>
          {new Date(files[i].mindatetime).toString()}
        </option>
      );
    }
    var url = "https://api.datalakes-eawag.ch/externaldata/remotesensing/";
    var swagger = url + "api";

    return (
      <div className="datadetail-padding">
        <div className="info-title">Licence</div>
        <a
          href={getLabel("licenses", dataset.licenses_id, "link")}
          title={getLabel("licenses", dataset.licenses_id, "description")}
        >
          {getLabel("licenses", dataset.licenses_id, "name")}
        </a>
        <div className="info-title">Citation</div>
        {dataset.citation}

        <div className="info-title">Git Repository</div>
        <a href={git} target="_blank" rel="noopener noreferrer">
          {git}
        </a>

        <div className="info-title">Available Data</div>
        <p>
          Data available from {mindatetime.toLocaleDateString()} to{" "}
          {maxdatetime.toLocaleDateString()}
        </p>

        <div className="info-title">Download</div>
        <div className="meteolakesdownload">
          <select value={download} onChange={this.onChangeDownload}>
            {filelist}
          </select>
          <a href={link}>
            <button>Download JSON</button>
          </a>
          <a href={linknc}>
            <button>Download NetCDF</button>
          </a>
        </div>
        <div className="info-title">API</div>

        <div className="api-meteolakes">
          [ Base URL: {url} ]
          <SwaggerUI url={swagger} />
        </div>
      </div>
    );
  }
}

export default RemoteSensingDownload;

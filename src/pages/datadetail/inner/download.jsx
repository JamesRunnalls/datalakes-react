import React, { Component } from "react";
import "../datadetail.css";

class Download extends Component {
    render() {
      const {
        getLabel,
        dataset,
        apiUrl
      } = this.props;
      const ncUrl = apiUrl + "/download/nc/" + dataset.id
      const jsonUrl = apiUrl + "/download/json/" + dataset.id;
      return (
        <React.Fragment>
          <div className="info-title">Dataset Title</div>
          {dataset.title}
  
          <div className="info-title">Licence</div>
          {getLabel("licenses", dataset.licenses_id)}
  
          <div className="info-title">Citations</div>
          {dataset.citation}
  
          <div className="info-title">Download</div>
          <div className="MultipleDownload">
            <a href={ncUrl}>
              <button title="Download datasets in NetCDF format">.nc</button>
            </a>
            <a href={jsonUrl}>
              <button title="Download datasets in JSON format">.json</button>
            </a>
          </div>
        </React.Fragment>
      );
    }
  }

  export default Download;
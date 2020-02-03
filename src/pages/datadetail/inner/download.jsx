import React, { Component } from "react";
import DateSlider from "../../../components/dateslider/dateslider";
import "../datadetail.css";

class Download extends Component {
    render() {
      const {
        onChange,
        getLabel,
        lower,
        upper,
        max,
        min,
        dataset,
        url,
        apiUrl
      } = this.props;
      const jsonUrl = apiUrl + "/api/data/json/" + url;
      const csvUrl = apiUrl + "/api/data/csv/" + url;
      const txtUrl = apiUrl + "/api/data/txt/" + url;
      return (
        <React.Fragment>
          <div className="info-title">Dataset Title</div>
          {dataset.title}
  
          <div className="info-title">Licence</div>
          {getLabel("licenses", dataset.licenses_id)}
  
          <div className="info-title">Citations</div>
          {dataset.citation}
  
          <div className="info-title">Time Period</div>
          <div className="date-slider">
            <DateSlider
              onChange={onChange}
              min={min}
              max={max}
              lower={lower}
              upper={upper}
            />
          </div>
          <div className="info-title">Download</div>
          <div className="MultipleDownload">
            <a>
              <button title="Not Currently Available">.nc</button>
            </a>
            <a href={csvUrl}>
              <button title="Download datasets in CSV format">.csv</button>
            </a>
            <a href={txtUrl}>
              <button title="Download datasets in TXT format">.txt</button>
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
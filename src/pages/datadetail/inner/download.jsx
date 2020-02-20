import React, { Component } from "react";
import SliderDouble from "../../../components/sliders/sliderdouble";
import axios from "axios";
import "../datadetail.css";

class Download extends Component {
  state = {
    upper: "NA",
    lower: "NA"
  };

  onChangeTime = values => {
    const lower = values[0] / 1000;
    const upper = values[1] / 1000;
    if (
      Math.round(lower) !== Math.round(this.state.lower) ||
      Math.round(upper) !== Math.round(this.state.upper)
    ) {
      this.setState({ lower, upper });
    }
  };

  onChangeUpper = value => {
    var upper = value.getTime() / 1000;
    this.setState({ upper });
  };

  onChangeLower = value => {
    var lower = value.getTime() / 1000;
    this.setState({ lower });
  };

  fileIdSelect = arr => {
    var { files } = this.props;
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      out.push(files[arr[i]].lineage);
    }
    return out;
  };

  downloadFiles = (filetype, apiUrl, id, arr) => {
    var url = `${apiUrl}/download/${filetype}/${id}`;
    axios({
      method: "post",
      url: url,
      responseType: "blob",
      data: { data: arr }
    })
      .then(({ data }) => {
        const downloadUrl = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", "file.zip");
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(error => {
        console.error(error);
        alert("Failed to download files");
      });
  };

  render() {
    const {
      getLabel,
      dataset,
      apiUrl,
      min,
      max,
      filedict,
      selectedFiles
    } = this.props;
    var { upper, lower } = this.state;

    if (upper === "NA") upper = max;
    if (lower === "NA") lower = min;

    var arr = selectedFiles(upper, lower, filedict, "download");
    var selectedArray = this.fileIdSelect(arr);

    return (
      <React.Fragment>
        <div className="info-title">Dataset Title</div>
        {dataset.title}

        <div className="info-title">Licence</div>
        {getLabel("licenses", dataset.licenses_id)}

        <div className="info-title">Citations</div>
        {dataset.citation}

        <div className="info-title">Download</div>

        <div className="multipledownload">
          <div className="subheading">Select time period for downloads.</div>
          <SliderDouble
            onChange={this.onChangeTime}
            onChangeLower={this.onChangeLower}
            onChangeUpper={this.onChangeUpper}
            min={min}
            max={max}
            lower={lower}
            upper={upper}
          />
          <div className="selected-download">
            {selectedArray.length} of {filedict.length} files selected for
            download.
          </div>
          <div className="subheading">Select file type for download.</div>
          <button
            onClick={() =>
              this.downloadFiles("nc", apiUrl, dataset.id, selectedArray)
            }
            className="download-button"
            title="Download datasets in NetCDF format"
          >
            .nc
          </button>
          <button
            onClick={() =>
              this.downloadFiles("json", apiUrl, dataset.id, selectedArray)
            }
            className="download-button"
            title="Download datasets in JSON format"
          >
            .json
          </button>
        </div>
      </React.Fragment>
    );
  }
}

export default Download;

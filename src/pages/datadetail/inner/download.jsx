import React, { Component } from "react";
import SliderDouble from "../../../components/sliders/sliderdouble";
import axios from "axios";
import "../datadetail.css";

class Download extends Component {
  state = {
    upper: this.props.max,
    lower: this.props.min,
  };

  onChangeTime = (values) => {
    const lower = values[0] / 1000;
    const upper = values[1] / 1000;
    if (
      Math.round(lower) !== Math.round(this.state.lower) ||
      Math.round(upper) !== Math.round(this.state.upper)
    ) {
      this.setState({ lower, upper });
    }
  };

  onChangeUpper = (value) => {
    var upper = value.getTime() / 1000;
    this.setState({ upper });
  };

  onChangeLower = (value) => {
    var lower = value.getTime() / 1000;
    this.setState({ lower });
  };

  fileIdSelect = (arr, filetype) => {
    var { files } = this.props;
    var out = [];
    if (filetype === "nc") {
      for (var i = 0; i < arr.length; i++) {
        out.push(files[arr[i]].filelineage);
      }
    } else {
      for (i = 0; i < arr.length; i++) {
        out.push(files[arr[i]].id);
      }
    }

    return out;
  };

  downloadFiles = (filetype, apiUrl, arr, title) => {
    arr = this.fileIdSelect(arr, filetype);
    var { embargo } = this.props.dataset;
    var { upper } = this.state;
    var embargoDate =
      new Date().getTime() - embargo * 30.4167 * 24 * 60 * 60 * 1000;
    var datasetpassword = "";
    if (upper * 1000 > embargoDate) {
      datasetpassword = prompt(
        "Selection contains embargoed data. (after " +
          new Date(embargoDate) +
          ") Please enter the password to download data."
      );
    }
    var url = `${apiUrl}/download?password=${datasetpassword}`;
    var name =
      title.replace(/\s/g, "").toLowerCase() + "_datalakesdownload.zip";
    axios({
      method: "post",
      url: url,
      responseType: "blob",
      data: { ids: arr },
    })
      .then(({ data }) => {
        const downloadUrl = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", name);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        console.error(error);
        if (error.response.status === 403) {
          alert("Incorrect password provided");
        } else {
          alert("Failed to download files");
        }
      });
  };

  render() {
    const {
      getLabel,
      dataset,
      apiUrl,
      min,
      max,
      files,
      selectedFiles,
    } = this.props;
    var { upper, lower } = this.state;

    var selectedArray = [0];
    if (files.length > 1) {
      selectedArray = selectedFiles(upper, lower, files, "download");
    }

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

        {dataset.embargo > 0 && (
          <div>
            <div className="info-title">Embargo Period</div>
            Data more recent than {dataset.embargo} months requires a password
            to download. <br />
            Please contact {getLabel("persons", dataset.persons_id, "email")} to
            request access to this data.
          </div>
        )}

        <div className="info-title">Download</div>

        <div className="multipledownload">
          {files.length > 1 && (
            <div>
              <div className="subheading">
                Select time period for downloads.
              </div>
              <SliderDouble
                onChange={this.onChangeTime}
                onChangeLower={this.onChangeLower}
                onChangeUpper={this.onChangeUpper}
                min={min}
                max={max}
                lower={lower}
                upper={upper}
                files={files}
              />
              <div className="selected-download">
                {selectedArray.length} of {files.length} files selected for
                download.
              </div>
            </div>
          )}

          <div className="subheading">Select file type for download.</div>
          <button
            onClick={() =>
              this.downloadFiles("nc", apiUrl, selectedArray, dataset.title)
            }
            className="download-button"
            title="Download datasets in NetCDF format"
          >
            NetCDF
          </button>
          <button
            onClick={() =>
              this.downloadFiles("json", apiUrl, selectedArray, dataset.title)
            }
            className="download-button"
            title="Download datasets in JSON format"
          >
            JSON
          </button>
        </div>
      </div>
    );
  }
}

export default Download;

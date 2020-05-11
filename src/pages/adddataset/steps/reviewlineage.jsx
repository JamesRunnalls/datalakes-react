import React, { Component } from "react";
import FileSelector from "../../../components/fileselector/fileselector";

class ReviewLineage extends Component {
  state = {
    message: "",
  };

  nextStep = (e) => {
    e.preventDefault();
    this.props.nextStep().catch((error) => {
      console.error(error.message);
      this.setState({
        message: error.message,
      });
    });
  };

  prevStep = (e) => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const {
      dataset,
      renkuResponse,
      allFiles,
      handleAccompanyingData,
    } = this.props;
    var { accompanyingdata } = dataset;
    const { message } = this.state;
    var selectedfiles = [];
    for (var i = 0; i < accompanyingdata.length; i++) {
      var arr = accompanyingdata[i].split("/");
      selectedfiles.push(
        <div key={"sf" + i} className="sfile">
          {arr[arr.length - 1]}
        </div>
      );
    }
    var renku = ""
    if (renkuResponse.stdout === 0 && renkuResponse.log.data.lineage !== null) {
      renku = "Renku lineage information detected."
    }

    return (
      <React.Fragment>
        <form className="adddataset-form" onSubmit={this.nextStep}>
          <div className="lineage-text">
            <p>
              Reproducability is key for open science. Please attach all files
              needed to reproduce a subset of this dataset.
            </p>{" "}
            <p>This typically includes:</p>
            <ol>
              <li>An example of the raw data</li>
              <li>Any processing scripts</li>
              <li>Environment information such as requirements.txt</li>
            </ol>
            <p>
              This is also a good place to add custom calibration files or any
              other information related to the data.
            </p>
            <p>{renku}</p>
            <p>{accompanyingdata.length} files selected:</p>
            <div className="selectedfiles">{selectedfiles}</div>
          </div>

          <FileSelector
            allFiles={allFiles}
            accompanyingdata={accompanyingdata}
            handleAccompanyingData={handleAccompanyingData}
          />
          <div className="error-message">{message}</div>
          <div className="buttonnav">
            <button onClick={this.prevStep}>Back</button>
            <button onClick={this.nextStep}>Next </button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

export default ReviewLineage;

import React, { Component } from "react";

class ReviewLineage extends Component {
  state = {
    message: ""
  };

  nextStep = e => {
    e.preventDefault();
    this.props.nextStep().catch(error => {
      console.error(error.message);
      this.setState({
        message: error.message,
      });
    });
  };

  prevStep = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const { dataset, renkuResponse } = this.props;
    const { message } = this.state;
    var content = [];
    if (renkuResponse.stdout === 0 && renkuResponse.log.data.lineage !== null) {
      content.push(
        <div key="success" className="text-lineage">
          <div>Lineage successfully recieved from Renku.</div>
          <div>Click next to add metadata.</div>
        </div>
      );
    } else {
      if (renkuResponse.stdout === 0) {
        content.push(
          <div key="renku" className="text-lineage">
            File stored in <a href="https://renkulab.io/">Renku</a> but no
            lineage information available. Please add some lineage information
            below or reprocess you data using the renku run command then return
            and add you dataset to datalakes.
          </div>
        );
      } else {
        content.push(
          <div key="notrenku" className="text-lineage">
            File not stored using <a href="https://renkulab.io/">Renku</a>.
            Please consider using <a href="https://renkulab.io/">Renku</a> to
            automatically track your files lineage. If you do not want to use
            Renku please add some lineage information below.
          </div>
        );
      }
      content.push(
        <div key="addlineage" className="input-lineage">
          <div className="form-group">
            <label htmlFor="scriptLineage">Link to processing script</label>
            <input
              id="scriptLineage"
              type="text"
              onChange={this.props.handleChange("pre_script")}
              defaultValue={dataset["pre_script"]}
            />
          </div>
          <div className="form-group">
            <label htmlFor="fileLineage">Link to preceding dataset</label>
            <input
              id="fileLineage"
              type="text"
              onChange={this.props.handleChange("pre_file")}
              defaultValue={dataset["pre_file"]}
            />
          </div>
        </div>
      );
    }
    return (
      <React.Fragment>
        <form className="adddataset-form">
          {content}
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

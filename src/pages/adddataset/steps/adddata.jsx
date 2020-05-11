import React, { Component } from "react";
import ReactDOM from "react-dom";
import Loading from "../../../components/loading/loading";

class AddData extends Component {
  state = {
    message: "",
    loading: true,
  };

  nextStep = (e) => {
    this.setState({
      loading: true,
      message:
        "Downloading and analysing file. This might take a while for large files.",
    });
    e.preventDefault();
    this.props.nextStep().catch((error) => {
      console.error(error.message);
      this.setState({
        message: error.message,
        loading: false,
      });
    });
  };

  componentDidMount() {
    // Put cursor in input box.
    ReactDOM.findDOMNode(this.refs.git).focus();
    ReactDOM.findDOMNode(this.refs.git).select();
  }

  render() {
    const { dataset } = this.props;
    var { message, loading } = this.state;

    if (message !== "") {
      var userMessage = (
        <div className="loading">
          {loading && <Loading />}
          {message}
        </div>
      );
    }

    return (
      <React.Fragment>
        <form className="adddataset-form">
          <div>
            <p>
              Welcome to the Datalakes add dataset portal. Currently we only
              support connection to git repositories from the following
              companies: <a href="https://renkulab.io/gitlab">Renkulab.io</a>.
            </p>
            <p>
              It is important that the repository is either open for public
              access or you have invited Datalakes to have at least guest
              access. For instructions click here.
            </p>
            <p>
              Input data must be in NetCDF format according to the CF
              convensions. If you wish to upload multiple file to the same
              dataset they must be of the same format and in the same folder.
            </p>
            <p>Enter a link below to the NetCDF file in your git repository.</p>
          </div>
          <div className="form-group">
            <label htmlFor="git">Link to Git File</label>
            <input
              id="git"
              type="text"
              ref="git"
              placeholder="https://gitcompany/repo-group/repo-name/blob/branch-name/folders/file-name.nc"
              onChange={this.props.handleChange("datasourcelink")}
              defaultValue={dataset.datasourcelink}
            />
          </div>
          <div className="error-message">{userMessage}</div>
          <div className="buttonnav">
            <button onClick={this.nextStep}>Clone Repository and Parse File</button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

export default AddData;

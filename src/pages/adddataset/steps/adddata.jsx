import React, { Component } from "react";
import ReactDOM from "react-dom";
import Loading from "../../../components/loading/loading";

class AddData extends Component {
  state = {
    message: "",
    loading: true
  };

  nextStep = e => {
    this.setState({
      loading: true,
      message:
        "Downloading and analysing file. This might take a while for large files."
    });
    e.preventDefault();
    this.props.nextStep().catch(error => {
      console.error(error.message);
      this.setState({
        message: error.message,
        loading: false
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
          <div className="form-group">
            <label htmlFor="git">Link to Git File</label>
            <input
              id="git"
              type="text"
              ref="git"
              onChange={this.props.handleChange("git")}
              defaultValue={dataset.git}
            />
          </div>
          <div className="error-message">{userMessage}</div>
          <div className="buttonnav">
            <button onClick={this.nextStep}>Analyse File</button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

export default AddData;

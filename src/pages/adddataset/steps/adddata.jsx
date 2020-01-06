import React, { Component } from "react";
import ReactDOM from "react-dom";
import Loading from "../../../components/loading/loading";

class AddData extends Component {
    state = {
      message: ""
    };
  
    nextStep = e => {
      this.setState({ message: "Working" });
      e.preventDefault();
      this.props.nextStep().then(data => {
        if (data.stdout === 1) {
          this.setState({ message: data.message });
        }
      });
    };
  
    componentDidMount() {
      // Put cursor in input box.
      ReactDOM.findDOMNode(this.refs.gitUrl).focus();
      ReactDOM.findDOMNode(this.refs.gitUrl).select();
    }
  
    render() {
      const { folder } = this.props;
      var { message } = this.state;
  
      if (message === "Working") {
        message = (
          <div>
            <Loading />
            Downloading and analysing file. This might take a while for large files. 
          </div>
        );
      }
  
      return (
        <React.Fragment>
          <form className="adddataform">
            <div className="form-group">
              <label htmlFor="gitUrl">Link to Git File</label>
              <input
                id="gitUrl"
                type="text"
                ref="gitUrl"
                onChange={this.props.handleChange("gitUrl")}
                defaultValue={folder.git}
              />
            </div>
            <div className="error-message">{message}</div>
            <div className="buttonnav">
              <button onClick={this.nextStep}>Analyse File</button>
            </div>
          </form>
        </React.Fragment>
      );
    }
  }

export default AddData;
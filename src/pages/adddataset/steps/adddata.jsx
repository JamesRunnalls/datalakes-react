import React, { Component } from "react";
import ReactDOM from "react-dom";

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
      const { values } = this.props;
      var { message } = this.state;
  
      if (message === "Working") {
        message = (
          <div>
            <div className="sk-cube-grid">
              <div className="sk-cube sk-cube1"></div>
              <div className="sk-cube sk-cube2"></div>
              <div className="sk-cube sk-cube3"></div>
              <div className="sk-cube sk-cube4"></div>
              <div className="sk-cube sk-cube5"></div>
              <div className="sk-cube sk-cube6"></div>
              <div className="sk-cube sk-cube7"></div>
              <div className="sk-cube sk-cube8"></div>
              <div className="sk-cube sk-cube9"></div>
            </div>
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
                defaultValue={values.gitUrl}
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
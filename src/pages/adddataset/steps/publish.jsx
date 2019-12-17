import React, { Component } from "react";

class Publish extends Component {
    nextStep = e => {
      e.preventDefault();
      this.props.nextStep();
    };
    prevStep = e => {
      e.preventDefault();
      this.props.prevStep();
    };
  
    render() {
      const { values } = this.props;
      return (
        <React.Fragment>
          <form>
            Summary
            <div className="buttonnav">
              <button onClick={this.prevStep}>Back</button>
              <button onClick={this.nextStep}>Publish </button>
            </div>
          </form>
        </React.Fragment>
      );
    }
  }

  export default Publish;
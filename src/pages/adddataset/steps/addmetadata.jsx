import React, { Component } from "react";

class AddMetadata extends Component {
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
          <table>
            <tbody>
              <tr>
                <th>Time</th>
                <td>
                  <input type="datetime" name="datetime" />
                </td>
              </tr>
              <tr>
                <th>Location</th>
                <td></td>
              </tr>
              <tr>
                <th>Depth</th>
                <td></td>
              </tr>
              <tr>
                <th>Lake</th>
                <td></td>
              </tr>
              <tr>
                <th>Time</th>
                <td></td>
              </tr>
              <tr>
                <th>Title</th>
                <td></td>
              </tr>
              <tr>
                <th>Project</th>
                <td></td>
              </tr>

              <tr>
                <th>Person</th>
                <td></td>
              </tr>
              <tr>
                <th>Organisation</th>
                <td></td>
              </tr>
            </tbody>
          </table>
          <div className="buttonnav">
            <button onClick={this.prevStep}>Back</button>
            <button onClick={this.nextStep}>Next </button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

export default AddMetadata;

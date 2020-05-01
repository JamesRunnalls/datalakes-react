import React, { Component } from "react";
import "./api.css";

class API extends Component {
  render() {
    document.title = "API - Datalakes";
    return (
      <div className="api-container">
        <h1>API Documentation</h1>
        <div className="api-inner">
          <h3>Datalakes is still under active developement.</h3>
          Datalakes will provide direct access to data via its REST API. However
          as the API is constantly changing as the project progresses and grows,
          full documentation of the API is being delayed until the API begins to
          stabalise.
        </div>
      </div>
    );
  }
}

export default API;

import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./adddataset.css";
import axios from "axios";
import { apiUrl } from "../../../config.json";

class AddData extends Component {
  analyseFile = e => {
    ReactDOM.findDOMNode(this.refs.loader1).className = "loader show";
    e.preventDefault();
    this.props.analyseFile();
  };

  render() {
    const { values } = this.props;
    return (
      <React.Fragment>
        <form className="adddataform">
          <div className="form-group">
            <label htmlFor="gitUrl">Link to Git File</label>
            <input
              id="gitUrl"
              type="text"
              onChange={this.props.handleChange("gitUrl")}
              defaultValue={values.gitUrl}
            />
          </div>
          <div id="process">
            <div ref="loader1" className="loader">
              <div className="lds-dual-ring"></div>Analysing file.
            </div>
          </div>
          <div className="buttonnav">
            <button onClick={this.analyseFile}>Analyse File</button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

class ReviewData extends Component {
  parseData = e => {
    e.preventDefault();
    this.props.parseData();
  };
  back = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const { values, data } = this.props;
    var rows = [];
    for (var key in data.file) {
      rows.push(
        <tr>
          <td>{key}</td>
          <td>{data.file[key].attributes.units.value}</td>
          <td>
            <select>
              <option>Unix Time</option>
              <option>Rainfall Depth</option>
            </select>
          </td>
          <td>
            <select>
              <option>M</option>
              <option>y</option>
              <option>x</option>
              <option>y2</option>
              <option>x2</option>
            </select>
          </td>
          <td>
            <select>
              <option>mm</option>
              <option>seconds since 1970-01-01 00:00:00</option>
            </select>
          </td>
          <td>
            <select>
              <option>mm</option>
              <option>s</option>
            </select>
          </td>
        </tr>
      );
    }

    return (
      <React.Fragment>
        <form>
          <table className="datareview">
            <tbody>
              <tr>
                <th colSpan="2">From file</th>
                <th colSpan="4">Confirm parse</th>
              </tr>
              <tr>
                <th>Variable</th>
                <th>Units</th>
                <th>Parameter</th>
                <th>Axis</th>
                <th>Units</th>
                <th>Short Units</th>
              </tr>
              {rows}
            </tbody>
          </table>
          <div className="buttonnav">
            <button onClick={this.back}>Back</button>
            <button onClick={this.parseData}>Parse Data </button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

class ReviewLineage extends Component {
  next = e => {
    e.preventDefault();
    this.props.nextStep();
  };
  back = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const { values } = this.props;
    return (
      <React.Fragment>
        <form>
          <label>First Name</label>
          <input
            placeholder="First Name"
            onChange={this.props.handleChange("firstName")}
            defaultValue={values.firstName}
          />
          <label>Last Name</label>
          <input
            placeholder="Last Name"
            onChange={this.props.handleChange("lastName")}
            defaultValue={values.lastName}
          />
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Email Address"
            onChange={this.props.handleChange("email")}
            defaultValue={values.email}
          />
          <div className="buttonnav">
            <button onClick={this.back}>Back</button>
            <button onClick={this.next}>Next </button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

class AddMetadata extends Component {
  next = e => {
    e.preventDefault();
    this.props.nextStep();
  };
  back = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const { values } = this.props;
    return (
      <React.Fragment>
        <form>
          <label>First Name</label>
          <input
            placeholder="First Name"
            onChange={this.props.handleChange("firstName")}
            defaultValue={values.firstName}
          />
          <label>Last Name</label>
          <input
            placeholder="Last Name"
            onChange={this.props.handleChange("lastName")}
            defaultValue={values.lastName}
          />
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Email Address"
            onChange={this.props.handleChange("email")}
            defaultValue={values.email}
          />
          <div className="buttonnav">
            <button onClick={this.back}>Back</button>
            <button onClick={this.next}>Next </button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

class Publish extends Component {
  next = e => {
    e.preventDefault();
    this.props.nextStep();
  };
  back = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const { values } = this.props;
    return (
      <React.Fragment>
        <form>
          <label>First Name</label>
          <input
            placeholder="First Name"
            onChange={this.props.handleChange("firstName")}
            defaultValue={values.firstName}
          />
          <label>Last Name</label>
          <input
            placeholder="Last Name"
            onChange={this.props.handleChange("lastName")}
            defaultValue={values.lastName}
          />
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Email Address"
            onChange={this.props.handleChange("email")}
            defaultValue={values.email}
          />
          <div className="buttonnav">
            <button onClick={this.back}>Back</button>
            <button>Publish </button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

class ProgressBar extends Component {
  state = {};
  render() {
    const { step, setStep, allowedStep } = this.props;
    var classes = ["", "", "", "", ""];
    classes[step - 1] = "is-active";
    return (
      <React.Fragment>
        <h1>Add Dataset</h1>
        <div className="container-fluid">
          <ul className="list-unstyled multi-steps">
            <li onClick={() => setStep(allowedStep[0])} className={classes[0]}>
              Data Link
            </li>
            <li onClick={() => setStep(allowedStep[1])} className={classes[1]}>
              Data Review
            </li>
            <li onClick={() => setStep(allowedStep[2])} className={classes[2]}>
              Lineage
            </li>
            <li onClick={() => setStep(allowedStep[3])} className={classes[3]}>
              Metadata
            </li>
            <li onClick={() => setStep(allowedStep[4])} className={classes[4]}>
              Publish
            </li>
          </ul>
        </div>
      </React.Fragment>
    );
  }
}

class AddDataset extends Component {
  state = {
    step: 1,
    allowedStep: [1, 1, 1, 1, 1],
    gitUrl:
      "https://renkulab.io/gitlab/james.runnalls/lexploremeteostation/blob/master/data/1A0004_LexploreMeteostationRainfall/LeXPLORE_WS_Lexplore_Weather_data.nc",
    data: "",
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    city: "",
    country: ""
  };

  nextStep = () => {
    const { step } = this.state;
    this.setState({
      step: step + 1
    });
  };

  prevStep = () => {
    const { step } = this.state;
    this.setState({
      step: step - 1
    });
  };

  parseData = () => {
    this.renkuData();
    this.setState({ allowedStep: [1, 2, 3, 0, 0] });
    const { step } = this.state;
    this.setState({
      step: step + 1
    });
  }

  analyseFile = () => {
    const url =
      apiUrl + "/api/git/file/" + encodeURIComponent(this.state.gitUrl);
    this.getFileData(url).then(data => {
      console.log(data);
      if (data.stdout == 0) {
        this.setState({ allowedStep: [1, 2, 0, 0, 0] });
        this.setState({ data });
        const { step } = this.state;
        this.setState({
          step: step + 1
        });
      } else {
        this.setState({ allowedStep: [1, 0, 0, 0, 0] });
      }
    });
  };

  async getFileData(url) {
    const { data } = await axios.get(url);
    return data;
  }

  renkuData = () => {
    const url =
      apiUrl + "/api/git/renku/" + encodeURIComponent(this.state.gitUrl);
    this.getRenkuData(url).then(data => {
      console.log(data);
    })
  }

  async getRenkuData(url) {
    const { data } = await axios.get(url);
    return data;
  }

  setStep = step => {
    if (step !== 0) {
      this.setState({ step });
    }
  };

  handleChange = input => event => {
    this.setState({ [input]: event.target.value });
  };

  render() {
    document.title = "Add Data - Datalakes";
    const { step, allowedStep, data } = this.state;
    const values = this.state;
    switch (step) {
      case 1:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <AddData
              analyseFile={this.analyseFile}
              handleChange={this.handleChange}
              values={values}
            />
          </React.Fragment>
        );
      case 2:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <ReviewData
              data={data}
              parseData={this.parseData}
              prevStep={this.prevStep}
              handleChange={this.handleChange}
              values={values}
            />
          </React.Fragment>
        );
      case 3:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <ReviewLineage
              nextStep={this.nextStep}
              prevStep={this.prevStep}
              handleChange={this.handleChange}
              values={values}
            />
          </React.Fragment>
        );
      case 4:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <AddMetadata
              nextStep={this.nextStep}
              prevStep={this.prevStep}
              handleChange={this.handleChange}
              values={values}
            />
          </React.Fragment>
        );
      case 5:
        return (
          <React.Fragment>
            <ProgressBar
              step={step}
              setStep={this.setStep}
              allowedStep={allowedStep}
            />
            <Publish
              prevStep={this.prevStep}
              handleChange={this.handleChange}
              values={values}
            />
          </React.Fragment>
        );
    }
  }
}

export default AddDataset;

import React, { Component } from "react";
import Calendar from "react-calendar";
import "./datetimedepthselector.css";

class TimeSelector extends Component {
  state = {
    datetime: this.props.datetime,
  };
  close = () => {
    var { toggleModal, onChangeDatetime } = this.props;
    toggleModal();
    onChangeDatetime(this.state.datetime);
  };
  changeTime = (interval) => {
    var { datetime } = this.state;
    datetime = new Date(datetime.getTime() + interval * 1000);
    this.setState({ datetime });
  };
  scrollHour = (event) => {
    var { datetime } = this.state;
    if (event.deltaY < 0) {
      datetime = new Date(datetime.getTime() + 3600 * 1000);
    } else if (event.deltaY > 0) {
      datetime = new Date(datetime.getTime() - 3600 * 1000);
    }
    this.setState({ datetime });
  };
  scrollMins = (event) => {
    var { datetime } = this.state;
    if (event.deltaY < 0) {
      datetime = new Date(datetime.getTime() + 60 * 1000);
    } else if (event.deltaY > 0) {
      datetime = new Date(datetime.getTime() - 60 * 1000);
    }
    this.setState({ datetime });
  };
  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.close();
    }
  };
  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }
  componentDidUpdate(prevProps) {
    if (this.props.datetime !== prevProps.datetime) {
      this.setState({ datetime: this.props.datetime });
    }
  }
  render() {
    var { datetime } = this.state;
    var hours = datetime.getHours();
    var hstring = hours < 10 ? "0" + hours : hours.toString();
    var mins = datetime.getMinutes();
    var mstring = mins < 10 ? "0" + mins : mins.toString();
    return (
      <div className="selectorbox">
        <div className="closemodal" onClick={this.close}>
          <div className="icon">&#10005;</div>
        </div>
        <div className="editor time">
          <table>
            <tbody>
              <tr>
                <td
                  className="modalarrow"
                  onClick={() => this.changeTime(3600)}
                >
                  &#9650;
                </td>
                <td></td>
                <td className="modalarrow" onClick={() => this.changeTime(60)}>
                  &#9650;
                </td>
                <td></td>
              </tr>
              <tr>
                <td onWheel={this.scrollHour}>{hstring}</td>
                <td>:</td>
                <td onWheel={this.scrollMins}>{mstring}</td>
                <td>{hours < 12 ? "AM" : "PM"}</td>
              </tr>
              <tr>
                <td
                  className="modalarrow"
                  onClick={() => this.changeTime(-3600)}
                >
                  &#9660;
                </td>
                <td></td>
                <td className="modalarrow" onClick={() => this.changeTime(-60)}>
                  &#9660;
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

class DateSelector extends Component {
  state = {
    datetime: this.props.datetime,
  };
  close = () => {
    var { toggleModal, onChangeDatetime } = this.props;
    toggleModal();
    onChangeDatetime(this.state.datetime);
  };
  changeDate = (datetime) => {
    var { datetime: datetimeold } = this.state;
    var hours = datetimeold.getHours();
    var mins = datetimeold.getMinutes();
    datetime = new Date(datetime.getTime() + (hours * 3600 + mins * 60) * 1000);
    this.setState({ datetime }, () => {
      this.close();
    });
  };
  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.close();
    }
  };
  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }
  componentDidUpdate(prevProps) {
    if (this.props.datetime !== prevProps.datetime) {
      this.setState({ datetime: this.props.datetime });
    }
  }
  render() {
    var { datetime } = this.state;
    return (
      <div className="selectorbox">
        <div className="closemodal" onClick={this.close}>
          <div className="icon">&#10005;</div>
        </div>
        <div className="editor date">
          <Calendar onChange={this.changeDate} value={datetime} />
        </div>
      </div>
    );
  }
}

class DepthSelector extends Component {
  state = {
    depth: this.props.depth,
  };
  close = () => {
    var { toggleModal, onChangeDepth } = this.props;
    var { depth } = this.state;
    if (isNaN(depth)) {
      alert("Depth is not a valid number");
    } else {
      toggleModal();
      onChangeDepth(depth);
    }
  };
  changeDepth = (event) => {
    this.setState({ depth: event.target.value });
  };

  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.close();
    }
  };
  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }
  componentDidUpdate(prevProps) {
    if (this.props.depth !== prevProps.depth) {
      this.setState({ timestep: this.props.depth });
    }
  }
  render() {
    var { depth } = this.state;
    return (
      <div className="selectorbox">
        <div className="closemodal" onClick={this.close}>
          <div className="icon">&#10005;</div>
        </div>
        <div className="editor depth">
          <input type="text" value={depth} onChange={this.changeDepth} />
        </div>
      </div>
    );
  }
}

class TimestepSelector extends Component {
  state = {
    timestep: this.props.timestep,
  };
  close = () => {
    var { toggleModal, onChangeTimestep } = this.props;
    toggleModal();
    onChangeTimestep(this.state.timestep);
  };
  changeTimestep = (timestep) => {
    this.setState({ timestep }, () => {
      this.close();
    });
  };

  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.close();
    }
  };
  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
  }
  componentDidUpdate(prevProps) {
    if (this.props.timestep !== prevProps.timestep) {
      this.setState({ timestep: this.props.timestep });
    }
  }
  render() {
    var { timestep } = this.state;
    var { lableTimestep } = this.props;
    var timesteps = [
      5,
      10,
      20,
      30,
      60,
      3 * 60,
      6 * 60,
      12 * 60,
      24 * 60,
      2 * 24 * 60,
      7 * 24 * 60,
      4 * 7 * 24 * 60,
    ];
    return (
      <div className="selectorbox">
        <div className="closemodal" onClick={this.close}>
          <div className="icon">&#10005;</div>
        </div>
        <div className="editor timestep">
          <div className="timesteplist">
            {timesteps.map((t) => (
              <div
                className={t === timestep ? "item selected" : "item"}
                key={t}
                onClick={() => this.changeTimestep(t)}
              >
                {lableTimestep(t)}
              </div>
            ))}
          </div>
          Animation Timestep
        </div>
      </div>
    );
  }
}

class SelectorModal extends Component {
  render() {
    var {
      datetime,
      depth,
      timestep,
      onChangeDatetime,
      onChangeTimestep,
      onChangeDepth,
      modal,
      toggleModal,
      lableTimestep,
    } = this.props;
    return (
      <div className="selectormodal">
        <table>
          <tbody>
            <tr>
              <td className="modalfull">
                {modal === "time" && (
                  <TimeSelector
                    datetime={datetime}
                    toggleModal={toggleModal}
                    onChangeDatetime={onChangeDatetime}
                  />
                )}
                {modal === "date" && (
                  <DateSelector
                    datetime={datetime}
                    toggleModal={toggleModal}
                    onChangeDatetime={onChangeDatetime}
                  />
                )}
                {modal === "depth" && (
                  <DepthSelector
                    depth={depth}
                    toggleModal={toggleModal}
                    onChangeDepth={onChangeDepth}
                  />
                )}
                {modal === "timestep" && (
                  <TimestepSelector
                    timestep={timestep}
                    toggleModal={toggleModal}
                    onChangeTimestep={onChangeTimestep}
                    lableTimestep={lableTimestep}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default SelectorModal;

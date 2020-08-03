import React, { Component } from "react";
import "./datetimedepthselector.css";
import pauseicon from "./img/pause.svg";
import playicon from "./img/play.svg";
import clockicon from "./img/clock.svg";
import depthicon from "./img/depth.svg";
import SelectorModal from "./selectormodal";

class DatetimeDepthSelector extends Component {
  state = {
    modal: "timestep",
  };
  toggleModal = (modal) => {
    if (this.state.modal) {
      this.setState({ modal: false });
    } else {
      this.setState({ modal });
    }
  };
  lableTimestep = (mins) => {
    if (Number.isInteger(mins / (60 * 24 * 7))) {
      var weeks = mins / (60 * 24 * 7);
      if (weeks === 1) {
        return "1 week";
      } else {
        return weeks + " weeks";
      }
    } else if (Number.isInteger(mins / (60 * 24))) {
      var days = mins / (60 * 24);
      if (days === 1) {
        return "1 day";
      } else {
        return days + " days";
      }
    } else if (Number.isInteger(mins / 60)) {
      var hours = mins / 60;
      if (hours === 1) {
        return "1 hour";
      } else {
        return hours + " hours";
      }
    } else {
      return mins + " mins";
    }
  };
  render() {
    var {
      play,
      togglePlay,
      datetime,
      depth,
      timestep,
      onChangeDatetime,
      onChangeDepth,
      onChangeTimestep,
    } = this.props;
    var { modal } = this.state;
    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return (
      <React.Fragment>
        <div className="datetimedepthselector">
          <div className="timeselectionbar"></div>
          <div className="controlbar">
            <div className="playpause" title={play ? "Pause" : "Play"}>
              <img
                src={play ? playicon : pauseicon}
                onClick={togglePlay}
                alt="Play/ Pause button"
              />
            </div>
            <div className="datetime">
              <div
                className="time text"
                title="Edit time"
                onClick={() => this.toggleModal("time")}
              >
                {datetime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div
                className="date text"
                title="Edit date"
                onClick={() => this.toggleModal("date")}
              >{`${datetime.getDate()} ${
                months[datetime.getMonth()]
              } ${datetime.getFullYear()}`}</div>
            </div>
            <div className="depthtimestep">
              <div
                className="depth text"
                title="Edit depth"
                onClick={() => this.toggleModal("depth")}
              >
                <img src={depthicon} />
                {` ${depth}m`}
              </div>
              <div
                className="timestep text"
                title="Edit timestep"
                onClick={() => this.toggleModal("timestep")}
              >
                <img src={clockicon} />
                {` ${this.lableTimestep(timestep)}`}
              </div>
            </div>
          </div>
        </div>
        {modal && (
          <SelectorModal
            modal={modal}
            toggleModal={this.toggleModal}
            datetime={datetime}
            depth={depth}
            timestep={timestep}
            onChangeDatetime={onChangeDatetime}
            onChangeDepth={onChangeDepth}
            onChangeTimestep={onChangeTimestep}
            lableTimestep={this.lableTimestep}
          />
        )}
      </React.Fragment>
    );
  }
}

export default DatetimeDepthSelector;

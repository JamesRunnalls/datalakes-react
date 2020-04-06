import React, { Component } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./components";
import { scaleLinear, scaleTime } from "d3";
import DateTimePicker from "react-datetime-picker";
import { format } from "date-fns";
import AvailbilityBar from "./availabilitybar";
import "./slider.css";

class SliderSingleHorizontal extends Component {
  state = {
    dt: this.props.value,
  };
  formatTick = (ms) => {
    const { min, max } = this.props;
    const diff = max.getTime() / 1000 - min.getTime() / 1000;
    if (diff < 172800) {
      // 3 Days
      return format(ms, "hh:mm:ss");
    } else if (diff < 31556952) {
      // 1 Year
      return format(ms, "dd MMM");
    } else if (diff < 157784760) {
      // 5 Years
      return format(ms, "MMM yy");
    } else {
      return format(ms, "yyyy");
    }
  };

  onUpdate = (event) => {
    this.setState({ dt: new Date(event[0]) });
  };

  render() {
    const sliderStyle = {
      position: "relative",
      width: "100%",
      height: 42,
      margin: "auto",
      marginTop: 10,
      boxSizing: "border-box",
    };
    var { value, onChange, type, min, max, files } = this.props;
    var { dt } = this.state;

    var dateTicks;
    if (type === "time") {
      dateTicks = scaleTime()
        .domain([min, max])
        .ticks(10)
        .map((d) => +d);
    } else if (type === "depth") {
      dateTicks = scaleLinear()
        .domain([min, max])
        .ticks(8)
        .map((d) => +d);
    }

    return (
      <React.Fragment>
        {" "}
        <div
          className="horizontalslider"
          title="Hint: use arrow keys to move between timesteps"
        >
          <Slider
            mode={1}
            step={1}
            domain={[+min, +max]}
            rootStyle={sliderStyle}
            values={[value]}
            onChange={onChange}
            onUpdate={this.onUpdate}
          >
            {/*<AvailbilityBar min={min} max={max} files={files} />*/}
            <Rail>
              {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
            </Rail>
            <Handles>
              {({ handles, activeHandleID, getHandleProps }) => (
                <div className="slider-handles">
                  {handles.map((handle) => (
                    <Handle
                      key={handle.id}
                      handle={handle}
                      domain={[min, max]}
                      isActive={handle.id === activeHandleID}
                      getHandleProps={getHandleProps}
                    />
                  ))}
                </div>
              )}
            </Handles>
            <Tracks left={false} right={false}>
              {({ tracks, getTrackProps }) => (
                <div className="slider-tracks">
                  {tracks.map(({ id, source, target }) => (
                    <Track
                      key={id}
                      source={source}
                      target={target}
                      getTrackProps={getTrackProps}
                    />
                  ))}
                </div>
              )}
            </Tracks>
            <Ticks values={dateTicks}>
              {({ ticks }) => (
                <div>
                  {ticks.map((tick) => (
                    <Tick
                      key={tick.id}
                      tick={tick}
                      count={ticks.length}
                      format={this.formatTick}
                    />
                  ))}
                </div>
              )}
            </Ticks>
          </Slider>
        </div>
        <div className="maintime">
          <DateTimePicker
            value={dt}
            clearIcon={null}
            calendarIcon={null}
            maxDate={max}
            minDate={min}
            disableClock={true}
            onChange={onChange}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default SliderSingleHorizontal;

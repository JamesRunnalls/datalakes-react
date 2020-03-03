import React, { Component } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./components";
import { scaleLinear } from "d3";
import { format } from "date-fns";
import { scaleTime } from "d3";
import AvailbilityBar from './availabilitybar';
import "./slider.css";

class SliderSingle extends Component {
  state = {
    update: [0]
  };

  formatDate = raw => {
    return new Date(raw * 1000);
  };

  formatTick = ms => {
    const { min, max } = this.props;
    const diff = max - min;
    if (diff < 172800) {
      // 3 Days
      return format(new Date(ms), "hh:mm:ss");
    } else if (diff < 31556952) {
      // 1 Year
      return format(new Date(ms), "dd MMM");
    } else if (diff < 157784760) {
      // 5 Years
      return format(new Date(ms), "MMM yy");
    } else {
      return format(new Date(ms), "yyyy");
    }
  };

  onUpdate = update => {
    this.setState({ update });
  };

  render() {
    const sliderStyle = {
      position: "relative",
      width: "100%",
      height: 42,
      margin: "auto",
      marginTop: 10,
      boxSizing: "border-box"
    };
    var {
      value,
      onChange,
      type,
      min,
      max,
      file,
      files,
      onChangeFileInt
    } = this.props;
    var { update } = this.state;

    var dateTicks, valueStr;
    if (type === "time") {
      valueStr = new Date(update[0]).toString();
      min = this.formatDate(min);
      max = this.formatDate(max);
      dateTicks = scaleTime()
        .domain([min, max])
        .ticks(5)
        .map(d => +d);
    } else if (type === "depth") {
      valueStr = update.toString();
      dateTicks = scaleLinear()
        .domain([min, max])
        .ticks(Math.min(files.length, 8))
        .map(d => +d);
    }

    return (
      <div
        className="datetime-selector"
        title="Hint: use arrow keys to move between timesteps"
      >
        <div>
          <div
            className="slider-arrow"
            onClick={() => onChangeFileInt(file + 1)}
          >
            &#60;
          </div>
          <div className="single-value">{valueStr}</div>
          <div
            className="slider-arrow"
            onClick={() => onChangeFileInt(file - 1)}
          >
            &#62;
          </div>
        </div>
        <Slider
          mode={1}
          step={1}
          domain={[+min, +max]}
          rootStyle={sliderStyle}
          onChange={onChange}
          values={[value]}
          onUpdate={this.onUpdate}
        >
          <AvailbilityBar min={min} max={max} files={files} />
          <Rail>
            {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
          </Rail>
          <Handles>
            {({ handles, activeHandleID, getHandleProps }) => (
              <div className="slider-handles">
                {handles.map(handle => (
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
                {ticks.map(tick => (
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
    );
  }
}

export default SliderSingle;

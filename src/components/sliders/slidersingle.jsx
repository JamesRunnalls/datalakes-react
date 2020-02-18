import React, { Component } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./components";
import { scaleLinear } from "d3";
import { format } from "date-fns";
import { scaleTime } from "d3";
import "./dateslider.css";

class SliderSingle extends Component {
  state = {
    update: 0
  };

  formatDate = raw => {
    return new Date(raw * 1000);
  };

  closest = (num, arr) => {
    var diff = Infinity;
    var index = 0;
    for (var i = 0; i < arr.length; i++) {
      var newdiff = Math.abs(num - arr[i]);
      if (newdiff < diff) {
        diff = newdiff;
        index = i;
      }
    }
    return index;
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

  onUpdate = inupdate => {
    var { update } = this.state;
    var { filedict } = this.props;
    var newUpdate = this.closest(inupdate[0]/1000, filedict);
    console.log(update,newUpdate);
    if (update !== newUpdate && newUpdate !== 0) {
      this.setState({ update: newUpdate });
    }
  };

  render() {
    const sliderStyle = {
      position: "relative",
      width: "calc(100% - 60px)",
      height: 42,
      margin: "auto",
      marginTop: 40,
      boxSizing: "border-box"
    };
    var { arr, value, onChange, type, min, max, filedict } = this.props;
    var { update } = this.state;

    var val = this.formatDate(filedict[value]);
    var dateTicks, valueStr;
    if (type === "time") {
      valueStr = this.formatDate(filedict[update]).toString();
      min = this.formatDate(min);
      max = this.formatDate(max);
      dateTicks = scaleTime()
        .domain([min, max])
        .ticks(5)
        .map(d => +d);
    } else if (type === "depth") {
      valueStr = arr[update].value.toString();
      dateTicks = scaleLinear()
        .domain([min, max])
        .ticks(Math.min(arr.length, 8))
        .map(d => +d);
    }

    return (
      <div className="datetime-selector">
        <div className="single-value">{valueStr}</div>
        <Slider
          mode={1}
          step={1}
          domain={[+min, +max]}
          rootStyle={sliderStyle}
          onChange={onChange}
          values={[val]}
          onUpdate={this.onUpdate}
        >
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

import React, { Component } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./components";
import { scaleLinear } from "d3";
import "./dateslider.css";

class DateSliderSingle extends Component {
  state = {
    update: 1
  };

  formatDate = raw => {
    return new Date(raw * 1000);
  };

  onUpdate = update => {
    this.setState({ update });
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
    var { arr, value, onChange } = this.props;
    var { update } = this.state;
    var valueStr = this.formatDate(arr[update].value).toString();
    var min = 1;
    var max = arr.length - 1;

    const dateTicks = scaleLinear()
      .domain([min, max])
      .ticks(Math.min(arr.length, 8))
      .map(d => +d);

    return (
      <div className="datetime-selector">
        <div className="single-value">{valueStr}</div>
        <Slider
          mode={1}
          domain={[+min, +max]}
          rootStyle={sliderStyle}
          onChange={onChange}
          onUpdate={this.onUpdate}
          values={[value]}
          step={1}
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

export default DateSliderSingle;

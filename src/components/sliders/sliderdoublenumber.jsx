import React, { Component } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./components";
import { scaleLinear } from "d3";
import "./slider.css";

class NumberSliderDouble extends Component {
  state = {
    tupper: this.props.upper,
    tlower: this.props.lower,
  };
  onUpdate = (event) => {
    this.setState({ tlower: event[0], tupper: event[1] });
  };
  componentDidUpdate(prevProps){
    if (this.props.upper !== prevProps.upper){
      this.setState({ tupper: this.props.upper})
    }
    if (this.props.lower !== prevProps.lower){
      this.setState({ tlower: this.props.lower})
    }
  }
  render() {
    var { tlower, tupper } = this.state;
    const sliderStyle = {
      position: "relative",
      width: "100%",
      height: 42,
      margin: "auto",
      marginTop: 40,
      boxSizing: "border-box",
    };
    var { min, max, lower, upper, onChange, unit } = this.props;
    const numberTicks = scaleLinear()
      .domain([min, max])
      .ticks(5)
      .map((d) => +d);

    return (
      <div className="datetime-selector">
        <div>{tlower.toFixed(2)}{unit} > {tupper.toFixed(2)}{unit}</div>
        <Slider
          mode={3}
          domain={[+min, +max]}
          rootStyle={sliderStyle}
          onChange={onChange}
          values={[lower, upper]}
          onUpdate={this.onUpdate}
        >
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
          <Ticks values={numberTicks}>
            {({ ticks }) => (
              <div>
                {ticks.map((tick) => (
                  <Tick key={tick.id} tick={tick} count={ticks.length} />
                ))}
              </div>
            )}
          </Ticks>
        </Slider>
      </div>
    );
  }
}

export default NumberSliderDouble;

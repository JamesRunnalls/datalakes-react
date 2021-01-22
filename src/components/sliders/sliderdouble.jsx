import React, { Component } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import DateTimePicker from "react-datetime-picker";
import { SliderRail, Handle, Track, Tick } from "./components";
import { format } from "date-fns";
import { scaleTime } from "d3";
import AvailbilityBar from "./availabilitybar";
import "./slider.css";

class DateSliderDouble extends Component {
  formatDate = (raw) => {
    return new Date(raw * 1000);
  };

  formatTick = (ms) => {
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

  render() {
    const sliderStyle = {
      position: "relative",
      width: "100%",
      height: 42,
      margin: "auto",
      marginTop: 40,
      boxSizing: "border-box",
    };
    var {
      min,
      max,
      lower,
      upper,
      onChange,
      onChangeLower,
      onChangeUpper,
      files,
    } = this.props;
    min = this.formatDate(min);
    max = this.formatDate(max);
    lower = this.formatDate(lower);
    upper = this.formatDate(upper);
    const dateTicks = scaleTime()
      .domain([min, max])
      .ticks(5)
      .map((d) => +d);

    return (
      <div className="datetime-selector">
        {onChangeLower && (
          <div className="datetime-picker">
            <div className="datetime-value">
              <DateTimePicker
                onChange={onChangeLower}
                value={lower}
                clearIcon={null}
                calendarIcon={null}
                maxDate={upper}
                minDate={min}
                disableClock={true}
              />
            </div>
            <div className="datetime-value">></div>
            <div className="datetime-value">
              <DateTimePicker
                onChange={onChangeUpper}
                value={upper}
                clearIcon={null}
                calendarIcon={null}
                maxDate={max}
                minDate={lower}
                disableClock={true}
              />
            </div>
          </div>
        )}

        <Slider
          mode={3}
          domain={[+min, +max]}
          rootStyle={sliderStyle}
          onChange={onChange}
          values={[lower, upper]}
        >
          <AvailbilityBar min={min} max={max} files={files} />
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
    );
  }
}

export default DateSliderDouble;

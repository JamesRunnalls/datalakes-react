import React, { Component } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./components";
import { format } from "date-fns";
import { scaleTime } from "d3";
import './dateslider.css';

const sliderStyle = {
    position: 'relative',
    width: 'calc(100% - 60px)',
    height: 42,
    margin: 'auto',
    marginTop: 40,
    boxSizing: 'border-box',
  }

function formatTick(ms) {
    return format(new Date(ms), "MMM yy");
}
 
class DateSlider extends Component {
    render() {
      const { min, max, lower, upper } = this.props.state;
      const onChange = this.props.onChange;
      const dateTicks = scaleTime()
      .domain([min, max])
      .ticks(8)
      .map(d => +d);
  
      return (
        <div style={{ width: '100%' }}>
          <Slider
            mode={3}
            domain={[+min,+max]}
            rootStyle={sliderStyle}
            onChange={onChange}
            values={[lower,upper]}
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
                      domain={[min,max]}
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
                      format={formatTick}
                    />
                  ))}
                </div>
              )}
            </Ticks>
          </Slider>
        </div>
      )
    }
  }
 
export default DateSlider;

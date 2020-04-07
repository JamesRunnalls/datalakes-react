import React, { Component } from "react";
import "./datetimedepthselector.css";
import "./slider.css";
import SliderSingleHorizontal from "./slidersinglehorizontal";
import SliderSingleVertical from "./slidersinglevertical";

class DatetimeDepthSelector extends Component {
  render() {
    var {
      selectedlayers,
      datetime,
      depth,
      onChangeDepth,
      onChangeDatetime,
    } = this.props;
    var mindatetime = new Date(new Date().getTime() - 1209600000);
    var maxdatetime = new Date();
    var mindepth = 0;
    var maxdepth = 1;

    for (var i = 0; i < selectedlayers.length; i++) {
      mindatetime = new Date(
        Math.min(mindatetime, new Date(selectedlayers[i].mindatetime))
      );
      maxdatetime = new Date(
        Math.max(maxdatetime, new Date(selectedlayers[i].maxdatetime))
      );
      maxdepth = Math.max(maxdepth, selectedlayers[i].maxdepth);
    }

    maxdepth = Math.min(370, maxdepth);

    return (
      <div className="ddselector">
        <div className="datetime">
          <div className="maintimeslider">
            <SliderSingleHorizontal
              value={datetime}
              min={mindatetime}
              max={maxdatetime}
              onChange={onChangeDatetime}
            />
          </div>
        </div>
        <div className="videocontrols"></div>
        <div className="depth">
          <div className="maindepthslider">
            <SliderSingleVertical
              value={depth}
              min={mindepth}
              max={maxdepth}
              onChange={onChangeDepth}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default DatetimeDepthSelector;

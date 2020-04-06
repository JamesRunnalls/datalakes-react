import React, { Component } from "react";
import "./datetimedepthselector.css";
import "./slider.css";
import SliderSingleHorizontal from "./slidersinglehorizontal";

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
    var mindepth = depth;
    var maxdepth = depth;

    for (var i = 0; i < selectedlayers.length; i++) {
      mindatetime = new Date(
        Math.min(mindatetime, new Date(selectedlayers[i].mindatetime))
      );
      maxdatetime = new Date(
        Math.max(maxdatetime, new Date(selectedlayers[i].maxdatetime))
      );
      mindepth = Math.max(mindepth, selectedlayers[i].mindepth);
      maxdepth = Math.max(maxdepth, selectedlayers[i].maxdepth);
    }

    return (
      <div className="ddselector">
        <div className="datetime">
          <div className="maintimeslider">
            <SliderSingleHorizontal
              value={datetime}
              min={mindatetime}
              max={maxdatetime}
              onChange={onChangeDatetime}
              onUpdate={this.updateTempDatetime}
              type="time"
            />
          </div>
        </div>
        <div className="videocontrols">Video control</div>
        <div className="depth">
          <div className="maindepthslider"></div>
          <div className="maindepth">
            <input defaultValue={depth} type="number" onBlur={onChangeDepth} />
            <span className="unit">m</span>
          </div>
        </div>
      </div>
    );
  }
}

export default DatetimeDepthSelector;

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
      datasets,
    } = this.props;
    var mindatetime = new Date(
      Math.min(new Date().getTime() - 1209600000, datetime.getTime())
    );
    var maxdatetime = new Date(
      Math.max(new Date().getTime(), datetime.getTime())
    );
    
    var mindepth = Math.min(0, depth);
    var maxdepth = Math.max(1, depth);

    function findDataset(datasets, id) {
      return datasets.find((d) => d.id === id);
    }

    var files = [];
    for (var i = 0; i < selectedlayers.length; i++) {
      mindatetime = new Date(
        Math.min(mindatetime, new Date(selectedlayers[i].mindatetime))
      );
      maxdatetime = new Date(
        Math.max(maxdatetime, new Date(selectedlayers[i].maxdatetime))
      );
      maxdepth = Math.max(maxdepth, selectedlayers[i].maxdepth);

      // File list
      files = files.concat(
        findDataset(datasets, selectedlayers[i].datasets_id).files
      );
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
              files={files}
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
              files={files}
              onChange={onChangeDepth}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default DatetimeDepthSelector;

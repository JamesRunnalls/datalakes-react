import React, { Component } from "react";
import EditSettings from "./editsettings";
import "./maplayers.css";

class DropDown extends Component {
  state = {
    open: this.props.defaultOpen,
    settings: false
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  toggleSettings = () => {
    this.setState({ settings: !this.state.settings });
  };
  render() {
    var { open, settings } = this.state;
    var {
      name,
      content,
      allowSettings,
      display,
      removeSelected,
      id,
      hidden,
      onUpdate,
      displayGroup,
      toggleLayerView
    } = this.props;
    return (
      <div className="maplayers-dropdown">
        <table className="maplayers-dropdown-table">
          <tbody>
            <tr className="maplayers-dropdown-title">
              <td
                className="maplayers-symbol"
                onClick={this.toggleOpen}
                style={{ width: "10px" }}
              >
                {open ? "▿" : "▹"}
              </td>
              <td style={{ width: "10px" }}>
                {" "}
                <input
                  className="maplayers-checkbox"
                  type="checkbox"
                  onChange={() => toggleLayerView(id)}
                  checked={!hidden.includes(id)}
                />
              </td>
              <td style={{ width: "100%" }} onClick={this.toggleOpen}>
                {name}
              </td>
              {allowSettings && (
                <td
                  onClick={this.toggleSettings}
                  style={{ width: "10px" }}
                  className="maplayers-settings"
                >
                  &#9881;
                </td>
              )}
            </tr>
          </tbody>
        </table>
        <div
          className={
            settings
              ? "maplayers-dropdown-content"
              : "maplayers-dropdown-content hide"
          }
        >
          <EditSettings
            display={display}
            removeSelected={removeSelected}
            id={id}
            onUpdate={onUpdate}
            displayGroup={displayGroup}
          />
        </div>
        <div
          className={
            open
              ? "maplayers-dropdown-content"
              : "maplayers-dropdown-content hide"
          }
        >
          {content}
        </div>
      </div>
    );
  }
}

export default DropDown;

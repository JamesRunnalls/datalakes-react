import React, { Component } from "react";
import "./colorsolid.css";

class ColorSolid extends Component {
  state = {
    colors: this.props.colors
  };

  updateColors = () => {
    var colors = [{color:event.target.value,point:0},{color:event.target.value,point:1}]
    this.setState({ colors });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.colors !== this.props.colors) {
      this.setState({ colors: this.props.colors });
    }
  }

  render() {
    var { onChange } = this.props;
    var { colors } = this.state;

    return (
      <div>
        <input
          type="color"
          value={colors[0].color}
          onChange={this.updateColors}
        ></input>
        <button
          type="button"
          title="Update plot color scheme"
          onClick={() => onChange(colors)}
        >
          Update Plot
        </button>
      </div>
    );
  }
}

export default ColorSolid;

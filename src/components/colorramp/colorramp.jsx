import React, { Component } from "react";
import "./colorramp.css";

class ColorRamp extends Component {
  state = {
    open: false,
    selected: 0,
    gradients: [
      {
        name: "Rainbow",
        data: [
          { color: "#000080", point: 0 },
          { color: "#3366FF", point: 0.142857142857143 },
          { color: "#00B0DC", point: 0.285714285714286 },
          { color: "#009933", point: 0.428571428571429 },
          { color: "#FFFF5B", point: 0.571428571428571 },
          { color: "#E63300", point: 0.714285714285714 },
          { color: "#CC0000", point: 0.857142857142857 },
          { color: "#800000", point: 1 }
        ]
      },
      {
        name: "Blue Red",
        data: [
          { color: "#0000ff", point: 0 },
          { color: "#ff0000", point: 1 }
        ]
      }
    ]
  };
  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  closeEvent = event => {
    var { open } = this.state;
    var targetClass = "noclassselected";
    try {
      targetClass = event.target.attributes.class.value;
    } catch (e) {}
    var classes = [
      "colorramp-select",
      "colorramp-dropdown",
      "colorramp-option"
    ];
    if (!classes.includes(targetClass) && open) {
      this.setState({ open: false });
    }
  };

  selectColorRamp = index => {
    this.setState({ selected: index, open: false });
    if ("onChange" in this.props) {
      var { gradients } = this.state;
      var { onChange } = this.props;
      onChange(gradients[index].data);
    }
  };
  linearGradient = colors => {
    if (colors) {
      var lineargradient = [];
      for (var i = 0; i < colors.length; i++) {
        lineargradient.push(`${colors[i].color} ${colors[i].point * 100}%`);
      }
      return `linear-gradient(90deg,${lineargradient.join(",")})`;
    }
  };

  componentDidMount() {
    window.addEventListener("click", this.closeEvent);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.closeEvent);
  }

  render() {
    var { gradients, selected, open } = this.state;
    var selectStyle = {
      background: this.linearGradient(gradients[selected].data)
    };
    return (
      <div className="colorramp">
        <div
          className="colorramp-select"
          onClick={this.toggle}
          style={selectStyle}
        >
          <div className="colorramp-arrow">{open ? "<" : ">"}</div>
        </div>
        <div
          className={open ? "colorramp-dropdown" : "colorramp-dropdown hide"}
        >
          {gradients.map((gradient, index) => {
            var style = {
              background: this.linearGradient(gradient.data)
            };
            return (
              <div
                className="colorramp-option"
                key={gradient.name}
                style={style}
                onClick={() => this.selectColorRamp(index)}
              >
                {gradient.name}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ColorRamp;

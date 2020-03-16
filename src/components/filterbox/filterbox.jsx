import React, { Component } from "react";
import "./filterbox.css";

class FilterBox extends Component {
    state = {
      open: false
    };
    toggle = () => {
      this.setState({ open: !this.state.open });
    };
  
    componentDidMount() {
      if (this.props.preopen === "true") {
        this.toggle();
      }
    }
    render() {
      const { content, title, inner } = this.props;
      const { open } = this.state;
      var symbol;
      if (open) {
        symbol = "-";
      } else {
        symbol = "+";
      }
  
      return (
        <div className={ inner ? "filterbox inner" : "filterbox"}>
          <div className="toprow" onClick={this.toggle}>
            <div className="title">{title}</div>
            <span className="symbol">{symbol}</span>
          </div>
          {open && <div className="content">{content}</div>}
        </div>
      );
    }
  }

  export default FilterBox;
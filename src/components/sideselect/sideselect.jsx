import React, { Component } from 'react';
import './sideselect.css';

class SideSelect extends Component {
    state = {
        side: "left"
    }

    toggle = value => {
        this.setState({side: value});
    }

      render() { 
        var leftClass = "sideSelect-head";
        var rightClass = "sideSelect-head  selected";
        var content = this.props.rightcontent;
        if (this.state.side === "left"){
            leftClass = "sideSelect-head selected";
            rightClass = "sideSelect-head";
            content = this.props.leftcontent;
        }
         return ( 
             <div className="sideSelect">
                 <div className="sideSelect-top">
                    <div className={leftClass} onClick={() => this.toggle("left")}>{this.props.left}</div>
                    <div className={rightClass} onClick={() => this.toggle("right")}>{this.props.right}</div>
                 </div>
                 <div className="sideSelect-content">
                    {content}
                 </div>
             </div>
        );
    }
}
 
export default SideSelect;
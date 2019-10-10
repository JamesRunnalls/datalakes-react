import React, { Component } from 'react';
import './sidebarlayout.css';

class SidebarLayout extends Component {
      state = {
        addClass: window.innerWidth < 960
      }

      toggle = () => {
        this.setState({addClass: !this.state.addClass});
      }

      render() { 
        let rightClass = ["rightcontainer"];
        let leftClass = ["leftcontainer"];
        if(this.state.addClass) {
          rightClass.push('hide');
          leftClass.push('full');
          window.dispatchEvent(new Event('resize'));
        }

        var rightNoScroll = "";
        if ("rightNoScroll" in this.props) {rightNoScroll = this.props.rightNoScroll}

         return ( 
             <React.Fragment>
              <div className={rightClass.join(' ')} id="rightcontainer">
                  <div className="righthead side" id="side" title="Click to hide sidebar" onClick={this.toggle}>
                      <h3><div className="sidebartitle">{this.props.sidebartitle}</div> <span id="closeside"> > </span></h3>
                  </div>
                  <div className="rightcontent">
                    {rightNoScroll}
                    <div className="scroll">
                      {this.props.right}
                    </div>
                      
                  </div>
              </div>
              <div className={leftClass.join(' ')} id="leftcontainer">
                 {this.props.left}
              </div>
            </React.Fragment>
        );
    }
}
 
export default SidebarLayout;
import React, { Component } from 'react';
import './sidebarlayout.css';

class SidebarLayout extends Component {
      state = {
        addClass: window.innerWidth < 960,
        toggle: true
      }

      toggle = () => {
        this.setState({ toggle: false }, () => {
            window.dispatchEvent(new Event('resize'));
            this.setState({ toggle: true });
        });
        this.setState({addClass: !this.state.addClass});
      }

      hideOnResize = () => {
        if (this.state.toggle){
          if (document.body.clientWidth < 960){
            this.setState({ addClass: true});
          } 
        }
      }

      componentDidMount() {
        if (this.props.open === "False"){
          this.setState({ addClass: true });
        }
        window.addEventListener("resize", this.hideOnResize);
      }

      componentWillUnmount() {
        window.removeEventListener("resize", this.hideOnResize);
      }

      render() { 
        let rightClass = ["rightcontainer"];
        let leftClass = ["leftcontainer"];
        if(this.state.addClass) {
          rightClass.push('hide');
          leftClass.push('full');
          
        }
         return ( 
             <React.Fragment>
              <div className={rightClass.join(' ')} id="rightcontainer">
                  <div className="righthead side" id="side" title="Click to hide sidebar" onClick={this.toggle}>
                      <h3><div className="sidebartitle">{this.props.sidebartitle}</div> <span id="closeside"> > </span></h3>
                  </div>
                  <div className="rightcontent">
                  {("rightNoScroll" in this.props) && this.props.rightNoScroll}
                  {("right" in this.props) && <div className="scroll">{this.props.right}</div>}
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
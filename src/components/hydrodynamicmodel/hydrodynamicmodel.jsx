import React, { Component } from 'react';
import SwissTopoMap from '../swisstopomap/swisstopomap';
import SidebarLayout from '../sidebarlayout/sidebarlayout';
import './hydrodynamicmodel.css';
import AnimationControls from '../animationcontrols/animationcontrols';
import SideSelect from '../sideselect/sideselect';

class Slice extends Component {
    render() { 
        var center = [46.375, 6.535];
        var zoom = 10;
        return ( 
            <SidebarLayout 
            sidebartitle="Plot Controls" 
            left={
                <React.Fragment>
                    <div className="hydro-map-container">
                        <SwissTopoMap center={center} zoom={zoom} colorbar={[18,21]}/>
                    </div>
                    <AnimationControls />
                </React.Fragment>
            } 
            right={
                <React.Fragment>
                    <ParameterSelect />
                    <SideSelect 
                        left="Forecast" 
                        right="Historical" 
                        leftcontent={""} 
                        rightcontent={""}/>
                </React.Fragment>
            }
            />
         );
    }
}

class Transect extends Component {
    render() { 
        return ( 
            <SidebarLayout 
            sidebartitle="Plot Controls" 
            left={
                <React.Fragment>
                    <div className="hydro-map-container" style={{backgroundColor:"grey"}}></div>
                    <AnimationControls />
                </React.Fragment>
            } 
            right={
                <React.Fragment>
                    <ParameterSelect />
                    <TransectSelect />
                </React.Fragment>
            }
            />
         );
    }
}

class Mri extends Component {
    render() { 
        return ( 
            <SidebarLayout 
            sidebartitle="Plot Controls" 
            left={
                <React.Fragment>
                    <div className="hydro-map-container" style={{backgroundColor:"grey"}}> </div>
                    <AnimationControls />
                </React.Fragment>
            } 
            right={
                <React.Fragment>
                    <ParameterSelect />
                    <TransectSelect />
                </React.Fragment>
            }
            />
         );
    }
}

class ParameterSelect extends Component {
    render() { 
        return ( 
            <select title="Select parameter to view">
                <option value="temperature">Temperature</option>
                <option value="veloity">Velocity</option>
            </select>
         );
    }
}

class TransectSelect extends Component {
    render() { 
        return ( 
            <select title="Select transect">
                <option value="genevaVilleneuve">Geneva - Villeneuve</option>
                <option value="evianLausanne">Evian - Lausanne</option>
            </select>
         );
    }
}




class HydrodynamicModel extends Component {
    state = {
        selection:"slice"
    }

    updateSelectedState = selected => {
        this.setState({selection:selected});
      };

    render() {                      
            document.title = "Lake Geneva Predictions - Datalakes";
            var classSlice = "subnav-item";
            var classTransect = "subnav-item";
            var classMri = "subnav-item";
            var selected = "";
            if (this.state.selection === "slice"){selected = <Slice />; classSlice = "subnav-item active"}
            if (this.state.selection === "transect"){selected = <Transect />; classTransect = "subnav-item active"}
            if (this.state.selection === "mri"){selected = <Mri />; classMri = "subnav-item active"}
         return (
             <React.Fragment>
                 <h1>Lake Geneva Hydrodynamic Model</h1>
                 <div className="subnav">
                     <div title="2D horizontal slices" className={classSlice} onClick={() => this.updateSelectedState("slice")}>Slice</div>
                     <div title="2D vertical slices" className={classTransect} onClick={() => this.updateSelectedState("transect")}>Transect</div>
                     <div title="Fly through of vertical slices" className={classMri} onClick={() => this.updateSelectedState("mri")}>MRI</div>
                 </div>
                 {selected}
                
             </React.Fragment>
        );
    }
}
 
export default HydrodynamicModel;
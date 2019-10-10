import React, { Component } from 'react';
import SidebarLayout from '../sidebarlayout/sidebarlayout';
import HeatMapImage from './img/heatmap.png';
import LineImage from './img/line.png';


class HeatMap extends Component {
    state = {  }
    render() { 
        return ( 
            <React.Fragment>
                <SidebarLayout 
                    sidebartitle="Plot Controls"
                    left={
                        <img src={HeatMapImage} style={{width:"100%"}} />
                    }
                    right={""}
                />
            </React.Fragment>
         );
    }
}

class LineGraph extends Component {
    state = {  }
    render() { 
        return ( 
            <React.Fragment>
                <SidebarLayout 
                    sidebartitle="Plot Controls"
                    left={
                        <img src={LineImage} style={{width:"100%"}} />
                    }
                    right={""}
                />
            </React.Fragment>
         );
    }
}
 
class Preview extends Component {
    state = {  }
    render() { 
        return ( ""  );
    }
}
 
class Download extends Component {
    state = {  }
    render() { 
        return ( ""  );
    }
}

class Pipeline extends Component {
    state = {  }
    render() { 
        return ( ""  );
    }
}
 
class Information extends Component {
    state = {  }
    render() { 
        return ( ""  );
    }
}
 
class Data extends Component {
    state = {
        selection:"heatmap"
    }

    updateSelectedState = selected => {
        this.setState({selection:selected});
      };
    
    render() {               
        document.title = "Data - Datalakes";
        var classHeatMap = "subnav-item";
        var classLineGraph = "subnav-item";
        var classPreview = "subnav-item";
        var classDownload = "subnav-item";
        var classPipeline = "subnav-item";
        var classInformation = "subnav-item";
        var selected = "";
        if (this.state.selection === "heatmap"){selected = <HeatMap />; classHeatMap = "subnav-item active"}
        if (this.state.selection === "linegraph"){selected = <LineGraph />; classLineGraph = "subnav-item active"}
        if (this.state.selection === "preview"){selected = <Preview />; classPreview = "subnav-item active"}
        if (this.state.selection === "download"){selected = <Download />; classDownload = "subnav-item active"}
        if (this.state.selection === "pipeline"){selected = <Pipeline />; classPipeline = "subnav-item active"}
        if (this.state.selection === "information"){selected = <Information />; classInformation = "subnav-item active"}
         return (
             <React.Fragment>
                 <h1>Data</h1> 
                 <div className="subnav">
                     <div title="Preview data as a heat map" className={classHeatMap} onClick={() => this.updateSelectedState("heatmap")}>Heat Map</div>
                     <div title="Preview data as a line graph" className={classLineGraph} onClick={() => this.updateSelectedState("linegraph")}>Line Graph</div>
                     <div title="Preview data as a table" className={classPreview} onClick={() => this.updateSelectedState("preview")}>Preview</div>
                     <div title="Download data" className={classDownload} onClick={() => this.updateSelectedState("download")}>Download</div>
                     <div title="See the data lineage" className={classPipeline} onClick={() => this.updateSelectedState("pipeline")}>Pipeline</div>
                     <div title="See meta data for dataset" className={classInformation} onClick={() => this.updateSelectedState("information")}>Information</div>
                 </div>
                 {selected}           
             </React.Fragment>
        );
    }
}
 
export default Data;
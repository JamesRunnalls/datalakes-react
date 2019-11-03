import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select'
import axios from 'axios';
import SidebarLayout from '../sidebarlayout/sidebarlayout';
import './dataportal.css';

class DatasetList extends Component {
    render() { 
        if (this.props.list.length > 0){
            return ( 
                <React.Fragment>
                    <div id="list" className={this.props.class}>
                        { this.props.list.map( dataset => ( 
                        <Dataset
                            key={dataset.id}
                            selected={this.props.selected} 
                            list={this.props.list} 
                            onSelectDataset={this.props.onSelectDataset}
                            dataset={dataset}
                            />))}
                    </div>
                </React.Fragment>
             );
        } else {
            return (
                <React.Fragment>
                    Sorry no datasets match your search. Please adjust your search parameters and try again.
                </React.Fragment>
            );
        }
        
    }
}

class Dataset extends Component {
    render() { 
        var check = "checkbox unchecked"
        var url = "/data/"+this.props.dataset.id;
        if (this.props.selected.includes(this.props.dataset)) check = "checkbox checked";
        var keys = Object.values(this.props.dataset.filters).join(" | ");
        return ( 
            <div key={this.props.dataset.id} className="dataset">
                <div 
                    title="Select and download multiple datasets"
                    className={check}
                    type="checkbox" 
                    name={this.props.dataset.id} 
                    value={this.props.dataset.id} 
                    onClick={() => this.props.onSelectDataset(this.props.dataset)}
                    />
                <Link to={url} title="Click to explore plots, lineage, downloads and metadata" className="text">
                    <div className="text-title">
                        {this.props.dataset.label}
                    </div>
                    <div>
                    {keys}
                    </div>

                </Link>
            </div>
         );
    }
}

class DatasetFilters extends Component {
    render() { 
        var options = [];
        if (this.props.datasets.length > 0){
            for (var i of Object.keys(this.props.datasets[0].filters)) {
                var inner = [];
                var repeat = [];
                for (var ii of this.props.datasets){
                    if (!String(repeat).includes(ii.filters[i])){
                        inner.push({value:ii.filters[i],label:ii.filters[i]})
                        repeat.push(ii.filters[i]);
                    }
                }
                options.push({key:i,options:inner});
            }
        }
        return ( 
            <div>
                { options.map( option => ( 
                    <Select 
                        key={option.key}
                        isClearable={option.key}
                        options={option.options} 
                        placeholder={option.key} 
                        className="multi-select" 
                        classNamePrefix="inner"
                        onChange={(e) => this.props.handleFilter(e,option.key)}
                    />
                    ))}
               
            </div> 
        );
    }
}

class DatasetDownload extends Component {
    render() { 
        return ( 
            <div className="MultipleDownload">
                <h3> Download Multiple Datasets </h3>
                <div>Currently you have {this.props.selected.length} datasets selected.</div>
                <div>
                    <button onClick={this.props.clearSelected}>Clear Selection</button>
                    <button onClick={this.props.toggle}>Download</button>
                </div>
            </div> );
    }
}

class DownloadMultiple extends Component {
    render() { 
        if (this.props.selected.length > 0){
            return ( 
                <React.Fragment>
                    <div className="download-multiple-title">Datasets Selected:</div>
                    <ol className="selected-data-list">
                        { this.props.selected.map( dataset => ( <li key={dataset.id}>{dataset.label}</li> ))}
                    </ol>
                    <div className="download-multiple-title">Licence</div>
                    <ol className="selected-data-list">
                        { this.props.selected.map( dataset => ( <li key={dataset.id}>{dataset.licence}</li> ))}
                    </ol>
                    <div className="download-multiple-title">Citations</div>
                    <ol className="selected-data-list">
                        { this.props.selected.map( dataset => ( <li key={dataset.id}>{dataset.citation}</li> ))}
                    </ol>
                    <div className="download-multiple-title">Time Period</div>
                    <div className="licence">
                        INSERT TIME PERIOD SLIDER HERE
                    </div>
                    <div className="download-multiple-title">Download</div>
                    <div className="MultipleDownload">
                        <button title="Download datasets in NetCDF format">.nc</button>
                        <button title="Download datasets in CSV format">.csv</button>
                        <button title="Download datasets in TXT format">.txt</button>
                    </div>
                </React.Fragment>
             );
        } else {
            return ( "No Datasets Selected" );
        }
        
    }
}
  
class DataPortal extends Component {
    state = {
        filters: [],
        search: "",
        datasets : [],
        selected : [],
        addClass: false
    };

    async componentDidMount(){
        console.log(process.env);
        const { data: datasets} = await axios.get(process.env.REACT_APP_API+'api/datasets');
        this.setState({ datasets })
    }

    toggle = () => {
        this.setState({addClass: !this.state.addClass});
      }

    searchDatasets = event => {
        this.setState({ search: event.target.value });
      };

    selectDataset = dataset => {
        if (this.state.selected.includes(dataset)){
            const selected = this.state.selected.filter(c => c !== dataset);
            this.setState({ selected : selected});
        } else {
            const selected = this.state.selected;
            selected.push(dataset);
            this.setState({ selected : selected });
        }
    };

    clearSelected = () => {
        this.setState({ selected : [] });
    }

    handleFilter = (selectedOption,parent) => {
        var filters = this.state.filters;
        if (selectedOption === null){
            filters = filters.filter(item => item.key !== parent);
        } else {
            filters = filters.filter(item => item.key !== parent);
            filters.push({key:parent,value:selectedOption.value});
        }
        this.setState({ filters:filters });
    }

    render() { 
        document.title = "Data Portal - Datalakes";
        const { search, filters, datasets } = this.state;

        // Filter by filters
        var filteredData = datasets;
        for (var f of filters) {
            filteredData = filteredData.filter(item => item.filters[f.key] === f.value);
        }

        // Filter by search
        var lowercasedSearch = search.toLowerCase();
        filteredData = filteredData.filter(item => { return String(Object.values(item.filters)+","+item.label).toLowerCase().includes(lowercasedSearch) });
        
        let downloadContainer = "download-container";
        let datalistClass = "datalist show"
        if(this.state.addClass) {
            downloadContainer = "download-container show";
            datalistClass = "datalist"
        }
         return ( 
             <React.Fragment>
                <h1>Data Portal</h1>
                <input onChange={this.searchDatasets} className="SearchBar" placeholder="Search for a dataset" type="search"></input>
                <SidebarLayout sidebartitle="Filter Datasets" 
                               left={
                                   <React.Fragment>
                                        <DatasetList selected={this.state.selected} list={filteredData} onSelectDataset={this.selectDataset} class={datalistClass}/>
                                        <div className={downloadContainer}>
                                            <div onClick={this.toggle.bind(this)} className="download-top" title="Click to hide download portal">
                                                <h3>
                                                <div className="download-title">Download Multiple Datasets</div> 
                                                <span> &#215; </span>
                                                </h3>
                                            </div>
                                            <div className="download-content"><DownloadMultiple selected={this.state.selected} datasets={this.state.datasets}/></div>
                                        </div>
                                    </React.Fragment>
                                } 
                               right={<React.Fragment>
                                        <DatasetFilters datasets={datasets} handleFilter={this.handleFilter}/>
                                        <DatasetDownload selected={this.state.selected} clearSelected={this.clearSelected} toggle={this.toggle}/>
                                   </React.Fragment>}
                />
             </React.Fragment>
         
        );
    }
}
 
export default DataPortal;
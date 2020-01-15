import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../../config.json";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import "./dataportal.css";
import MapSelect from "../../graphs/leaflet/mapselect.jsx";

class DatasetList extends Component {
  render() {
    const {
      dropdown,
      list,
      parameters,
      selected,
      onSelectDataset,
      datalistclass,
      getLabel
    } = this.props;
    if (list.length > 0) {
      return (
        <React.Fragment>
          <div id="list" className={datalistclass}>
            {list.map(dataset => (
              <Dataset
                key={dataset.id}
                selected={selected}
                onSelectDataset={onSelectDataset}
                dataset={dataset}
                dropdown={dropdown}
                parameters={parameters}
                getLabel={getLabel}
              />
            ))}
          </div>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          Sorry no datasets match your search. Please adjust your search
          parameters and try again.
        </React.Fragment>
      );
    }
  }
}

class Dataset extends Component {
  getParameters = id => {
    const { parameters } = this.props;
    return parameters.filter(x => x.folder_id === id);
  };

  parseDate = input => {
    var date = new Date(input);
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    return [
      (dd > 9 ? "" : "0") + dd,
      (mm > 9 ? "" : "0") + mm,
      date.getFullYear()
    ].join("/");
  };

  render() {
    const { dataset, selected, onSelectDataset, getLabel } = this.props;
    var url = "/data/" + dataset.id;
    var params = this.getParameters(dataset.id);
    params = params.filter(x => x.name !== "Time");
    var check = "checkbox unchecked";
    if (selected.includes(dataset)) check = "checkbox checked";
    return (
      <div key={dataset.id} className="dataset">
        <div
          title="Select and download multiple datasets"
          className={check}
          type="checkbox"
          name={dataset.id}
          value={dataset.id}
          onClick={() => onSelectDataset(dataset)}
        />
        <Link
          to={url}
          title="Click to explore plots, lineage, downloads and metadata"
          className="text"
        >
          <div className="text-title">{dataset.title}</div>
          <div>
            <div>
              Parameters: {params.map(param => param.name).join(" | ")}{" "}
            </div>
            <div>
              {getLabel("lake", dataset.lake_id)} |{" "}
              {this.parseDate(dataset.start_time)} to{" "}
              {this.parseDate(dataset.end_time)}
            </div>
            <div>
              License: {getLabel("license", dataset.license_id)} | Downloads:{" "}
              {dataset.downloads} | Last Modified:{" "}
              {this.parseDate(dataset.lastmodified)}
            </div>
          </div>
        </Link>
      </div>
    );
  }
}

class PopupBox extends Component {
  render() {
    const { title, fun, state } = this.props;
    var symbol;
    if (state) {
      symbol = "-";
    } else {
      symbol = "+";
    }
    return (
      <div className="filterbox">
        <div className="toprow" onClick={fun}>
          <div className="title">{title}</div>
          <span className="symbol">{symbol}</span>
        </div>
      </div>
    );
  }
}

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
    const { content, title } = this.props;
    const { open } = this.state;
    var symbol;
    if (open) {
      symbol = "-";
    } else {
      symbol = "+";
    }

    return (
      <div className="filterbox">
        <div className="toprow" onClick={this.toggle}>
          <div className="title">{title}</div>
          <span className="symbol">{symbol}</span>
        </div>
        {open && <div className="content">{content}</div>}
      </div>
    );
  }
}

class FilterBoxInner extends Component {
  state = {};
  render() {
    var { params, checkbox, cat, filters, table } = this.props;
    return (
      <React.Fragment>
        <div id="filterboxinner" className="">
          {params.map(param => (
            <div
              key={param.name}
              onClick={() => checkbox(param.id, param.name, cat, table)}
              className="filterboxinner"
            >
              <input
                type="checkbox"
                className="checkboxfilter"
                checked={param.name in filters}
                readOnly
              ></input>
              {param.name + " "}({param.count})
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

class FilterBar extends Component {
  render() {
    const { filters, removeFilter } = this.props;
    return (
      <div className="filterbar">
        {Object.keys(filters).map(filter => (
          <div
            key={filter}
            className="filterbar-item"
            onClick={() => removeFilter(filter)}
            title="Remove filter"
          >
            <div className="filterbar-text">{filter}</div>
            <div className="filterbar-x">&#10005;</div>
          </div>
        ))}
      </div>
    );
  }
}

class DataPortal extends Component {
  state = {
    filters: {},
    search: "",
    datasets: [],
    parameters: [],
    selected: [],
    sortby: "az",
    download: false,
    map: false
  };

  async componentDidMount() {
    this.getDropdowns();
    ReactDOM.findDOMNode(this.refs.search).focus();
    ReactDOM.findDOMNode(this.refs.search).select();
    var { data: datasets } = await axios.get(apiUrl + "/api/database/datasets");
    var { data: parameters } = await axios.get(
      apiUrl + "/api/database/parameters"
    );
    if ("stdout" in datasets) datasets = [];
    if ("stdout" in parameters) parameters = [];
    this.setState({ datasets, parameters });
  }

  getLabel = (input, id) => {
    const { dropdown } = this.state;
    return dropdown[input].find(x => x.id === id).name;
  };

  setSelect = event => {
    this.setState({ sortby: event.target.value });
  }

  download = () => {
    this.setState({ download: !this.state.download });
  };

  map = () => {
    this.setState({ map: !this.state.map });
  };

  getDropdowns = async () => {
    const { data: dropdown } = await axios.get(
      apiUrl + "/api/database/dropdowns"
    );
    this.setState({
      dropdown
    });
  };

  searchDatasets = event => {
    this.setState({ search: event.target.value });
  };

  selectDataset = dataset => {
    if (this.state.selected.includes(dataset)) {
      const selected = this.state.selected.filter(c => c !== dataset);
      this.setState({ selected: selected });
    } else {
      const selected = this.state.selected;
      selected.push(dataset);
      this.setState({ selected: selected });
    }
  };

  clearSelected = () => {
    this.setState({ selected: [] });
  };

  removeFilter = filter => {
    var { filters } = this.state;
    if (filter in filters) {
      delete filters[filter];
    }
    this.setState({ filters });
  };

  checkbox = (id, name, cat, table) => {
    var { filters } = this.state;
    if (name in filters) {
      delete filters[name];
    } else {
      filters[name] = { id: id, category: cat, set: table };
    }
    this.setState({ filters });
  };

  count = (input, name, parameters) => {
    return parameters.filter(x => x[input] === name).length;
  };

  sortDownloads = dataset => {
    return dataset
  }

  filterList = (params, name, label, exclude = "") => {
    var distinct = [];
    var dp = [...new Set(params.map(x => x[name]))];
    for (var p of dp) {
      if (p !== exclude) {
        var namelabel = p;
        if (name.includes("id")) namelabel = this.getLabel(label, p);
        distinct.push({
          id: p,
          name: namelabel,
          count: this.count(name, p, params)
        });
      }
    }
    distinct.sort((a, b) => {
      return b.count - a.count;
    });
    return distinct;
  };

  sortDatasets = (dataset,sortby) => {
    if (sortby === "az") {
      dataset.sort((a,b) => {
        return a.title - b.title;
      });
    } else if (sortby === "downloads") {
      dataset.sort((a,b) => {
        return b.downloads - a.downloads;
      });
    } else if (sortby === "modified"){
      dataset.sort((a,b) => {
        return new Date(b.lastmodified) - new Date(a.lastmodified);
      });
    }
    return dataset
  }

  filterDataSet = (dataset, filters, parameters, avoid = "") => {
    const filterData = (data, filter, parameters) => {
      if (filter.set === "datasets") {
        return data.filter(item => item[filter.category] === filter.id);
      } else if (filter.set === "parameters") {
        return data.filter(
          item =>
            parameters.filter(
              x => x[filter.category] === filter.id && x.folder_id === item.id
            ).length > 0
        );
      } else {
        return data;
      }
    };

    if (Object.keys(filters).length > 0) {
      var tDatasets;
      var category = [
        ...new Set(Object.values(filters).map(filter => filter.category))
      ].filter(cat => cat !== avoid); // List of catagories in filters
      for (var l of category) {
        tDatasets = [];
        for (var f of Object.values(filters).filter(
          filter => filter.category === l
        )) {
          tDatasets = tDatasets.concat(filterData(dataset, f, parameters));
        }
        dataset = [...new Set(tDatasets)];
      }
    }
    return dataset;
  };

  filterParameters = (dataset, params) => {
    return params.filter(
      param => dataset.filter(data => data.id == param.folder_id).length > 0 && param.parameter_id !== 1
    );
  };

  render() {
    document.title = "Data Portal - Datalakes";
    const {
      search,
      filters,
      datasets,
      selected,
      dropdown,
      parameters,
      sortby,
      download,
      map
    } = this.state;

    // Filter by filters
    var fDatasets = this.filterDataSet(datasets, filters, parameters);
    
    // Filter by search
    var lowercasedSearch = search.toLowerCase();
    fDatasets = fDatasets.filter(item => {
      console.log(
        parameters
          .filter(x => x.folder_id === item.id)
          .map(y => Object.values(y).toString())
      );
      return String(Object.values(item))
        .toLowerCase()
        .includes(lowercasedSearch);
    });
  
    // Parameter filtering
    var fParams = this.filterParameters(fDatasets, parameters);
    const dataP = this.filterParameters(
      this.filterDataSet(datasets, filters, parameters, "parameter_id"),
      parameters
    );
    const dataL = this.filterDataSet(datasets, filters, parameters, "lake_id");
    const dataC = this.filterParameters(
      this.filterDataSet(datasets, filters, parameters, "characteristic"),
      parameters
    );
    var dParams = this.filterList(dataP, "parameter_id", "parameter", 1);
    var dLake = this.filterList(dataL, "lake_id", "lake");
    var dChar = this.filterList(dataC, "characteristic", "characterstic");

    // Sort by
    var fDatasets = this.sortDatasets(fDatasets,sortby);

    return (
      <React.Fragment>
        <h1>Data Portal</h1>
        <SidebarLayout
          sidebartitle="Filters"
          left={
            <React.Fragment>
              <div className="sortbar">
                <div
                  className="sortbar-selected"
                  title="Download multiple datasets"
                  onClick={this.download}
                >
                  {selected.length} selected of {fDatasets.length} datasets
                </div>
                <div
                  className="sortbar-x"
                  title="Clear selected datasets"
                  onClick={this.clearSelected}
                >
                  &#10005;
                </div>
                <select title="Sort by" onChange={this.setSelect} defaultValue={sortby}>
                  <option value="az">A-Z</option>
                  <option value="modified">Modified</option>
                  <option value="downloads">Downloads</option>
                </select>
              </div>
              <FilterBar filters={filters} removeFilter={this.removeFilter} />

              <div className={download ? "popup" : "hidepopup"}>
                <h3>Download </h3>
              </div>

              <div className={map ? "popup" : "hidepopup"} title="Hold ctrl and drag with your mouse to select custom area">
                <MapSelect datasets={fDatasets}/>
              </div>

              <DatasetList
                selected={this.state.selected}
                list={fDatasets}
                parameters={fParams}
                onSelectDataset={this.selectDataset}
                datalistclass={"datalist show"}
                dropdown={dropdown}
                getLabel={this.getLabel}
              />
            </React.Fragment>
          }
          rightNoScroll={
            <React.Fragment>
              <input
                onChange={this.searchDatasets}
                className="SearchBar"
                placeholder="Search for a dataset"
                type="search"
                ref="search"
              ></input>
              <div className="characteristics">
                <FilterBoxInner
                  checkbox={this.checkbox}
                  cat="characteristic"
                  params={dChar}
                  filters={filters}
                  table="parameters"
                />
              </div>
              <FilterBox
                title="Parameters"
                content={
                  <FilterBoxInner
                    checkbox={this.checkbox}
                    cat="parameter_id"
                    params={dParams}
                    filters={filters}
                    table="parameters"
                  />
                }
                preopen="true"
              />
              <FilterBox title="Time" content="Coming soon" />
              <PopupBox title="Location" fun={this.map} state={map} />
              <FilterBox
                title="Lake"
                content={
                  <FilterBoxInner
                    checkbox={this.checkbox}
                    cat="lake_id"
                    params={dLake}
                    filters={filters}
                    table="datasets"
                  />
                }
              />
              <FilterBox title="Other" content="Coming soon" />
            </React.Fragment>
          }
        />
      </React.Fragment>
    );
  }
}

export default DataPortal;

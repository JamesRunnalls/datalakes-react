import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../../config.json";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import "./dataportal.css";

class DatasetList extends Component {
  render() {
    const {
      dropdown,
      list,
      parameters,
      selected,
      onSelectDataset,
      datalistclass
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
  getLabel = (input, id) => {
    const { dropdown } = this.props;
    return dropdown[input].find(x => x.id === id).name;
  };

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
    const { dataset, selected, onSelectDataset } = this.props;
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
              {this.getLabel("lake", dataset.lake_id)} |{" "}
              {this.parseDate(dataset.start_time)} to{" "}
              {this.parseDate(dataset.end_time)}
            </div>
            <div>
              License: {this.getLabel("license", dataset.license_id)} |
              Downloads: {dataset.downloads} | Last Modified:{" "}
              {this.parseDate(dataset.lastmodified)}
            </div>
          </div>
        </Link>
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
    const { params } = this.props;

    return (
      <React.Fragment>
        <div id="filterboxinner" className="">
          {params.map(param => (
            <div key={param.name}>
              <input type="checkbox" className="checkboxfilter"></input>
              {param.name + " "}({param.count})
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

class DataPortal extends Component {
  state = {
    metafilters: [],
    parafilters: [],
    search: "",
    datasets: [],
    parameters: [],
    selected: [],
    addClass: false
  };

  getDropdowns = async () => {
    const { data: dropdown } = await axios.get(
      apiUrl + "/api/database/dropdowns"
    );
    this.setState({
      dropdown
    });
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

  toggle = () => {
    this.setState({ addClass: !this.state.addClass });
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

  handleFilter = (selectedOption, parent) => {
    var filters = this.state.filters;
    if (selectedOption === null) {
      filters = filters.filter(item => item.key !== parent);
    } else {
      filters = filters.filter(item => item.key !== parent);
      filters.push({ key: parent, value: selectedOption.value });
    }
    this.setState({ filters: filters });
  };

  characteristicCount = type => {
    const { parameters } = this.state;
    return parameters.filter(x => x.characteristic === type).length;
  };

  parameterCount = name => {
    const { parameters } = this.state;
    return parameters.filter(x => x.name === name).length;
  };

  render() {
    document.title = "Data Portal - Datalakes";
    const {
      search,
      filters,
      datasets,
      selected,
      dropdown,
      parameters
    } = this.state;

    // Filter by filters
    var filteredData = datasets;
    //const filterData = (data, f) => {
    //  return data.filter(item => item.filters[f.key] === f.value);
    //};
    //for (var f of filters) {
    //  filteredData = filterData(filteredData, f);
    //}

    // Filter by search
    //var lowercasedSearch = search.toLowerCase();
    //filteredData = filteredData.filter(item => {
    //  return String(Object.values(item.filters) + "," + item.label)
    //    .toLowerCase()
    //    .includes(lowercasedSearch);
    //});

    const filter = <div></div>;

    // Parameter filtering
    var distintParameters = [];
    var dp = [...new Set(parameters.map(x => x.name))];
    for (var p of dp) {
      if (p !== "Time"){
        distintParameters.push({ name: p, count: this.parameterCount(p) });
      }
    }
    distintParameters.sort((a, b) => {
      return b.count - a.count;
    });

    return (
      <React.Fragment>
        <h1>Data Portal</h1>
        <SidebarLayout
          sidebartitle="Filters"
          left={
            <React.Fragment>
              <input
                onChange={this.searchDatasets}
                className="SearchBar"
                placeholder="Search for a dataset"
                type="search"
                ref="search"
              ></input>
              <table className="sortbar">
                <tbody>
                  <tr>
                    <td className="numberofdatasets">
                      {filteredData.length} Datasets
                    </td>
                    <td className="numberofselected">
                      {selected.length} Selected
                    </td>
                    <td className="sortby">
                      Sort By
                      <select>
                        <option>Most Recent</option>
                        <option>Downloads</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="filterlist">{filter}</div>
              <DatasetList
                selected={this.state.selected}
                list={filteredData}
                parameters={parameters}
                onSelectDataset={this.selectDataset}
                datalistclass={"datalist show"}
                dropdown={dropdown}
              />
            </React.Fragment>
          }
          right={
            <React.Fragment>
              <div className="characteristics">
                <div>All ({parameters.length})</div>
                <div>Physical ({this.characteristicCount("Physical")})</div>
                <div>Chemical ({this.characteristicCount("Chemical")})</div>
                <div>Biological ({this.characteristicCount("Biological")})</div>
              </div>
              <FilterBox
                title="Parameters"
                content={<FilterBoxInner params={distintParameters} />}
                preopen="true"
              />
              <FilterBox title="Time" content="ff" />
              <FilterBox title="Location" content="ff" />
              <FilterBox title="Lake" content="ff" />
              <FilterBox title="Other" content="ff" />
            </React.Fragment>
          }
        />
      </React.Fragment>
    );
  }
}

export default DataPortal;

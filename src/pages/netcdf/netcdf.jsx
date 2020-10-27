import React, { Component } from "react";
import axios from "axios";
import textlist from "./textlist";
import "./netcdf.css";

class Delimeter extends Component {
  state = {
    tab: false,
    semicolon: false,
    comma: false,
    singlespace: false,
    whitespace: false,
    other: false,
    othervalue: "",
  };
  toggle = (name, sep) => {
    var { add, remove } = this.props;
    let bool = this.state[name];
    this.setState({ [name]: !bool }, () => {
      setTimeout(() => {
        if (bool) {
          remove(sep);
        } else {
          add(sep);
        }
      }, 0);
    });
  };
  removeError = () => {};
  onChangeOther = (event) => {
    this.setState({ othervalue: event.target.value });
  };
  render() {
    var {
      tab,
      semicolon,
      comma,
      singlespace,
      whitespace,
      other,
      othervalue,
    } = this.state;
    return (
      <div className="delimeter">
        <div>Column Separator</div>
        <div>
          <input
            type="radio"
            id="tab"
            checked={tab}
            onClick={() => this.toggle("tab", "tab")}
            onChange={this.removeError}
          />
          <label htmlFor="tab">Tab</label>
          <input
            type="radio"
            id="semicolon"
            checked={semicolon}
            onClick={() => this.toggle("semicolon", ";")}
            onChange={this.removeError}
          />
          <label htmlFor="semicolon">Semicolon</label>
          <input
            type="radio"
            id="comma"
            checked={comma}
            onClick={() => this.toggle("comma", ",")}
            onChange={this.removeError}
          />
          <label htmlFor="comma">Comma</label>
          <input
            type="radio"
            id="singlespace"
            checked={singlespace}
            onClick={() => this.toggle("singlespace", " ")}
            onChange={this.removeError}
          />
          <label htmlFor="singlespace">Single Space</label>
          <input
            type="radio"
            id="whitespace"
            checked={whitespace}
            onClick={() => this.toggle("whitespace", "whitespace")}
            onChange={this.removeError}
          />
          <label htmlFor="whitespace">White Space</label>
          <input
            type="radio"
            id="other"
            checked={other}
            onClick={() => this.toggle("other", othervalue)}
            onChange={this.removeError}
          />
          <label htmlFor="other">
            <input type="text" onChange={this.onChangeOther} />
          </label>
        </div>
      </div>
    );
  }
}

class Attributes extends Component {
  state = {
    attributes: this.props.attributes,
    newattribute: "",
  };

  updateAttributes = (event) => {
    var { attributes } = this.state;
    let i = parseInt(event.target.id.split("_")[0]);
    attributes[i].value = event.target.value;
    this.setState({ attributes }, () => {
      this.props.onChangeAttributes(attributes);
    });
  };

  updateNewAttribute = (event) => {
    this.setState({ newattribute: event.target.value });
  };

  addAttribute = () => {
    var { attributes, newattribute } = this.state;
    if (newattribute !== "") {
      attributes.push({
        name: newattribute,
        value: "",
        placeholder: "attribute value",
        required: false,
      });
      newattribute = "";
      this.setState({ attributes, newattribute }, () => {
        this.props.onChangeAttributes(attributes);
      });
    } else {
      alert("Attribute must have a name");
    }
  };

  deleteAttribute = (index) => {
    var { attributes } = this.state;
    if (!attributes[index].required) {
      attributes.splice(index, 1);
      this.setState({ attributes }, () => {
        this.props.onChangeAttributes(attributes);
      });
    }
  };

  render() {
    var { attributes, newattribute } = this.state;
    var data = [
      <tr key="attributestitle">
        <th>name</th>
        <th>value</th>
      </tr>,
    ];
    for (let i = 0; i < attributes.length; i++) {
      data.push(
        <tr key={attributes[i].name + i}>
          <td>{attributes[i].name}</td>
          <td>
            <input
              type="text"
              value={attributes[i].value}
              placeholder={attributes[i].placeholder}
              onChange={this.updateAttributes}
              id={i + "_attribute"}
            />
          </td>
          <td>
            {!attributes[i].required && (
              <div onClick={() => this.deleteAttribute(i)}>-</div>
            )}
          </td>
        </tr>
      );
    }
    data.push(
      <tr key="bottom">
        <td>
          <input
            placeholder="new attribute"
            value={newattribute}
            onChange={this.updateNewAttribute}
          />
        </td>
        <td>
          <div onClick={this.addAttribute}>+</div>
        </td>
      </tr>
    );
    return (
      <div className="attributes">
        <div>Attributes</div>
        <div className="attributestable">
          <table>
            <tbody>{data}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

class Dimensions extends Component {
  state = {
    dimensions: this.props.dimensions,
  };

  updateDimensions = (event) => {
    var { dimensions } = this.state;
    var { variables } = this.props;
    let i = parseInt(event.target.id.split("_")[0]);
    let newdim = event.target.value;
    let olddim = dimensions[i].name;
    variables = variables.map((v) => {
      if (v.name === olddim) {
        v.name = newdim;
      }
      if (v.dimension === olddim) {
        v.dimension = newdim;
      }
      return v;
    });
    dimensions[i].name = newdim;
    this.setState({ dimensions }, () => {
      this.props.onChangeDimensions(dimensions);
      this.props.onChangeVariables(variables);
    });
  };
  render() {
    var { dimensions } = this.state;
    return (
      <div className="dimensions">
        <div>Dimensions</div>
        <div className="dimensionstable">
          <table>
            <tbody>
              <tr>
                <th>name</th>
                <th>length</th>
              </tr>
              <tr>
                <td>
                  <input
                    value={dimensions[0].name}
                    id="0_dimensions"
                    onChange={this.updateDimensions}
                  />
                </td>
                <td>{dimensions[0].len}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

class Variables extends Component {
  state = {
    variables: this.props.variables,
    newvariable: "",
    colors: ["red", "green", "black", "purple", "orange", "blue"],
  };

  updateVariables = (event) => {
    var { variables } = this.state;
    let id = event.target.id.split("_");
    let i = parseInt(id[0]);
    variables[i][id[2]] = event.target.value;
    if (variables[i][id[2]] !== event.target.value) {
      variables[i][id[2]] = event.target.value;
      this.setState({ variables }, () => {
        this.props.onChangeVariables(variables);
      });
    }
  };

  updateNewVariable = (event) => {
    this.setState({ newvariable: event.target.value });
  };

  addVariable = () => {
    var { variables, newvariable, colors } = this.state;
    var { dimensions } = this.props;
    if (newvariable !== "") {
      variables.push({
        name: newvariable,
        dimension: dimensions[0].name,
        unit: "",
        type: "float",
        startcol: 0,
        endcol: 0,
        startrow: 0,
        endrow: 0,
        color: colors[variables.length],
        required: false,
      });
      newvariable = "";
      this.setState({ variables, newvariable }, () => {
        this.props.onChangeVariables(variables);
      });
    } else {
      alert("Variable must have a name");
    }
  };

  deleteVariable = (index) => {
    var { variables } = this.state;
    if (!variables[index].required) {
      variables.splice(index, 1);
      this.setState({ variables }, () => {
        this.props.onChangeVariables(variables);
      });
    }
  };

  getLetter = (n) => {
    var ordA = "A".charCodeAt(0);
    var ordZ = "Z".charCodeAt(0);
    var len = ordZ - ordA + 1;
    var s = "";
    while (n >= 0) {
      s = String.fromCharCode((n % len) + ordA) + s;
      n = Math.floor(n / len) - 1;
    }
    return s;
  };

  render() {
    var { variables, newvariable } = this.state;
    var { dimensions, ncols, nrows } = this.props;

    var cols = [...Array(ncols).keys()].map((c) => (
      <option key={"col" + c} value={c}>
        {this.getLetter(c)}
      </option>
    ));
    var rows = [...Array(nrows).keys()].map((r) => (
      <option key={"row" + r} value={r}>
        {r}
      </option>
    ));

    let dimoptions = [];
    for (var j = 0; j < dimensions.length; j++) {
      dimoptions.push(
        <option key={"option" + j} value={dimensions[j].name}>
          {dimensions[j].name}
        </option>
      );
    }

    var data = [
      <tr key="variablestitle">
        <th>name</th>
        <th>dimension</th>
        <th>unit</th>
        <th>type</th>
        <th colSpan="2">start</th>
        <th colSpan="2">end</th>
      </tr>,
    ];

    for (let i = 0; i < variables.length; i++) {
      let dim =
        dimensions.filter((d) => d.name === variables[i].name).length > 0;
      data.push(
        <tr key={"variables" + i}>
          <td>
            <div style={{ color: variables[i].color }}>{variables[i].name}</div>
          </td>
          <td>
            {dim ? (
              variables[i].dimension
            ) : (
              <select
                value={variables[i].dimension}
                onChange={this.updateVariables}
                id={i + "_variable_dimension"}
              >
                {dimoptions}
              </select>
            )}
          </td>
          <td>
            <input
              type="text"
              value={variables[i].unit}
              onChange={this.updateVariables}
              id={i + "_variable_unit"}
            />
          </td>
          <td>
            <select
              value={variables[i].type}
              onChange={this.updateVariables}
              id={i + "_variable_type"}
            >
              <option value="float">float</option>
              <option value="string">string</option>
            </select>
          </td>
          <td>
            <select
              value={variables[i].startcol}
              onChange={this.updateVariables}
              id={i + "_variable_startcol"}
            >
              {cols}
            </select>
          </td>
          <td>
            <select
              value={variables[i].startrow}
              onChange={this.updateVariables}
              id={i + "_variable_startrow"}
            >
              {rows}
            </select>
          </td>
          <td>
            <select
              value={variables[i].endcol}
              onChange={this.updateVariables}
              id={i + "_variable_endcol"}
            >
              {cols}
            </select>
          </td>
          <td>
            <select
              value={variables[i].endrow}
              onChange={this.updateVariables}
              id={i + "_variable_endrow"}
            >
              {rows}
            </select>
          </td>
          <td>
            {!variables[i].required && (
              <div onClick={() => this.deleteVariable(i)}>-</div>
            )}
          </td>
        </tr>
      );
    }
    data.push(
      <tr key="bottom">
        <td>
          <input
            placeholder="new variable"
            value={newvariable}
            onChange={this.updateNewVariable}
          />
        </td>
        <td>
          <div onClick={this.addVariable}>+</div>
        </td>
      </tr>
    );
    return (
      <div className="variables">
        <div>Variables</div>
        <div className="variablestable">
          <table>
            <tbody>{data}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

class PreviewTable extends Component {
  state = {
    hidden: false,
  };
  toggleHide = () => {
    this.setState({ hidden: !this.state.hidden });
  };
  getLetter = (n) => {
    var ordA = "A".charCodeAt(0);
    var ordZ = "Z".charCodeAt(0);
    var len = ordZ - ordA + 1;
    var s = "";
    while (n >= 0) {
      s = String.fromCharCode((n % len) + ordA) + s;
      n = Math.floor(n / len) - 1;
    }
    return s;
  };

  render() {
    var { table, ncols, nrows } = this.props;
    var { hidden } = this.state;

    // Create table
    var tablecontent = [];
    var firstrow = [<th key="header"></th>];
    for (var r = 0; r < ncols; r++) {
      firstrow.push(<th key={"c" + r}>{this.getLetter(r)}</th>);
    }
    tablecontent.push(<tr key="firstrow">{firstrow}</tr>);

    for (var i = 0; i < nrows; i++) {
      let tablerow = [<th>{i}</th>];
      let rowlength = table[i].length;
      for (var j = 0; j < ncols; j++) {
        if (j > rowlength - 1) {
          tablerow.push(<td key={`cell${i}${j}`}></td>);
        } else {
          tablerow.push(<td key={`cell${i}${j}`}>{table[i][j]}</td>);
        }
      }
      tablecontent.push(<tr key={`row${i}`}>{tablerow}</tr>);
    }
    return (
      <React.Fragment>
        <div className={hidden ? "previewtable hidden" : "previewtable"}>
          <div className="hidden" onClick={this.toggleHide}>
            {hidden ? "+" : "-"}
          </div>
          <table>
            <tbody>{tablecontent}</tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }
}

class NetCDF extends Component {
  state = {
    file: "",
    loaded: 0,
    data: "",
    delimeter: [],
    delimeterchange: false,
    newline: "\n",
    attributes: [
      {
        name: "title",
        value: "",
        required: true,
        placeholder: "Title of the dataset",
      },
      {
        name: "institution",
        value: "",
        required: true,
        placeholder: "Responsible institution",
      },
      {
        name: "source",
        value: "",
        required: true,
        placeholder: "Source of the data",
      },
      {
        name: "references",
        value: "",
        required: true,
        placeholder: "Data reference",
      },
      {
        name: "history",
        value: "",
        required: true,
        placeholder: "History of the data",
      },
      {
        name: "conventions",
        value: "CF 1.7",
        required: false,
        placeholder: "CF convention",
      },
      {
        name: "comment",
        value: "",
        required: false,
        placeholder: "Add any comments",
      },
    ],
    dimensions: [{ name: "time", len: "unlimited" }],
    variables: [
      {
        name: "time",
        dimension: "time",
        unit: "seconds since 01-01-1970",
        type: "float",
        startcol: 0,
        endcol: 0,
        startrow: 0,
        endrow: 0,
        color: "red",
        required: true,
      },
    ],
    skiprow: 0,
    table: [],
    ncols: 0,
    nrows: 0,
  };

  splitOnArray = (line, arr) => {
    let splitstring = "$%split%$";
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === "tab") {
        line = line.replace(/\t/g, splitstring);
      } else if (arr[i] === "whitespace") {
        line = line.replace(/\s+/g, splitstring);
      } else if (arr[i] === "") {
      } else {
        line = line.replaceAll(arr[i], splitstring);
      }
    }

    return line.split(splitstring);
  };

  onChangeFile = (event) => {
    let name = event.target.files[0].name.split(".");
    let ext = name[name.length - 1];
    if (!textlist.includes(ext)) {
      if (
        window.confirm(
          "Not a recognised text extension. This converter only works with text files. Are you sure you want to attempt convertion?"
        )
      ) {
        this.setState({ file: event.target.files[0], loaded: 0 }, () => {
          this.uploadFile();
        });
      }
    } else {
      this.setState({ file: event.target.files[0], loaded: 0 }, () => {
        this.uploadFile();
      });
    }
  };

  uploadFile = () => {
    const data = new FormData();
    data.append("file", this.state.file);
    axios
      .post("http://localhost:5000/netcdf/readfile", data, {
        onUploadProgress: (ProgressEvent) => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100,
          });
        },
      })
      .then((res) => {
        this.setState({ data: res.data }, () => {
          var { data, delimeter, newline, skiprow } = this.state;
          this.updateTable(data, delimeter, newline, skiprow);
        });
      });
  };

  addDelimeter = (sep) => {
    var { delimeter } = this.state;
    if (!delimeter.includes(sep)) delimeter.push(sep);
    this.setState({ delimeter, delimeterchange: true });
  };

  removeDelimeter = (sep) => {
    var { delimeter } = this.state;
    delimeter = delimeter.filter((d) => d !== sep);
    this.setState({ delimeter, delimeterchange: true });
  };

  onChangeSkiprow = (event) => {
    this.setState({ skiprow: parseInt(event.target.value) });
  };

  onChangeAttributes = (attributes) => {
    this.setState({ attributes });
  };

  onChangeDimensions = (dimensions) => {
    this.setState({ dimensions });
  };

  onChangeVariables = (variables) => {
    this.setState({ variables });
  };

  createNetcdf = () => {
    var { file, attributes, dimensions, variables } = this.state;

    var outvariables = variables.map((v) => {
      v = {
        name: v.name,
        dimensions: [v.dimension],
        type: v.type,
        attributes: [
          {
            name: "units",
            value: v.unit,
          },
        ],
      };
      return v;
    });

    var data = {
      filename: file.name,
      attributes,
      dimensions,
      variables: outvariables,
    };
    console.log(data);
  };

  updateTable = (data, delimeter, newline, skiprow) => {
    var lines = data.split(newline);
    lines = lines.slice(skiprow, skiprow.length);
    var nrows = lines.length;
    var ncols = 0;
    var table = lines.map((l) => {
      let line = this.splitOnArray(l, delimeter);
      if (line.length > ncols) ncols = line.length;
      return line;
    });
    this.setState({ ncols, nrows, table, delimeterchange: false });
  };

  componentDidUpdate(prevProps, prevState) {
    var { data, delimeter, newline, skiprow, delimeterchange } = this.state;
    if (
      newline !== prevState.newline ||
      skiprow !== prevState.skiprow ||
      delimeterchange
    ) {
      this.updateTable(data, delimeter, newline, skiprow);
    }
  }

  render() {
    var {
      data,
      skiprow,
      attributes,
      dimensions,
      variables,
      ncols,
      nrows,
      table,
    } = this.state;
    document.title = "Convert to NetCDF | Datalakes";
    return (
      <div className="netcdf">
        <h1>Convert Scientific Data to NetCDF</h1>
        <div className="download">
          <div className="fileselect">
            <input type="file" onChange={this.onChangeFile} />
          </div>
        </div>
        <div className="format">
          <div className="row">
            <div className="skiprows">
              <div>Skip Rows</div>
              <input
                type="number"
                value={skiprow}
                onChange={this.onChangeSkiprow}
                min="0"
                step="1"
              />
            </div>
            <Delimeter add={this.addDelimeter} remove={this.removeDelimeter} />
          </div>
          <div className="row">
            <Attributes
              attributes={attributes}
              onChangeAttributes={this.onChangeAttributes}
            />
            <Dimensions
              dimensions={dimensions}
              variables={variables}
              onChangeVariables={this.onChangeVariables}
              onChangeDimensions={this.onChangeDimensions}
            />
          </div>

          <Variables
            variables={variables}
            dimensions={dimensions}
            onChangeVariables={this.onChangeVariables}
            ncols={ncols}
            nrows={nrows}
          />
          <div className="create">
            <button onClick={this.createNetcdf}>Create NetCDF</button>
          </div>
        </div>
        {data !== "" && (
          <div className="preview">
            <div className="parse"></div>
            <PreviewTable
              table={table}
              ncols={ncols}
              nrows={nrows}
              variables={variables}
            />

            <div className="netcdf"></div>
          </div>
        )}
      </div>
    );
  }
}

export default NetCDF;

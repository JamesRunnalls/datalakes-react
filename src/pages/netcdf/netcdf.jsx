import React, { Component } from "react";
import axios from "axios";
import textlist from "./textlist";
import "./netcdf.css";

class PreviewTable extends Component {
  state = {};
  render() {
    var { data, delimiter, newline } = this.props;

    var lines = data.split(newline);
    var max_line_length = 0;
    var table = lines.map((l) => {
      let line = l.split(delimiter[0]);
      if (line.length > max_line_length) max_line_length = line.length;
      return line;
    });

    var tablecontent = [];
    for (var i = 0; i < table.length; i++) {
      let tablerow = [];
      let rowlength = table[i].length;
      for (var j = 0; j < max_line_length; j++) {
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
        <table>
          <tbody>{tablecontent}</tbody>
        </table>
      </React.Fragment>
    );
  }
}

class NetCDF extends Component {
  state = {
    file: "",
    loaded: 0,
    data: "",
    delimiter: [","],
    newline: "\n",
  };

  onChangeFile = (event) => {
    let name = event.target.files[0].name.split(".");
    let ext = name[name.length - 1];
    if (!textlist.includes(ext)) {
      alert(
        "Not a recognised text extension. This converter only works with text files."
      );
    }
    this.setState({ file: event.target.files[0], loaded: 0 });
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
        this.setState({ data: res.data });
      });
  };

  render() {
    var { data, delimiter, newline } = this.state;
    document.title = "Convert to NetCDF | Datalakes";
    return (
      <React.Fragment>
        <div className="download">
          <input type="file" onChange={this.onChangeFile} />
          <button onClick={this.uploadFile}>Upload</button>
        </div>
        {data !== "" && (
          <div className="preview">
            <div className="parse"></div>
            <PreviewTable data={data} delimiter={delimiter} newline={newline} />

            <div className="netcdf"></div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default NetCDF;

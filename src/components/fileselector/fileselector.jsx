import React, { Component } from "react";
import "./fileselector.css";

class FileSelector extends Component {
  state = {};

  longestArray = (arr) => {
    var len = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].length > len) len = arr[i].length;
    }
    return len;
  };

  updateArray = (event) => {
    var { accompanyingdata, handleAccompanyingData } = this.props;
    var id = event.target.id;
    if (accompanyingdata.includes(id)) {
      accompanyingdata = accompanyingdata.filter((ad) => ad !== id);
    } else {
      accompanyingdata.push(id);
    }
    handleAccompanyingData(accompanyingdata);
  };

  render() {
    var { allFiles, accompanyingdata } = this.props;
    allFiles = JSON.parse(JSON.stringify(allFiles));
    var files = allFiles.map((af) => af.split("/"));
    var len = this.longestArray(files);
    var tree = [{ name: "git", children: [] }];
    
    for (var i = 0; i < files.length; i++) {
      for (var j = 0; j < tree.length; j++) {
        var name = files[i].slice(0, 2).join("/");
        if (tree[j].children.filter((tc) => tc.name === name).length === 0) {
          tree[j].children.push({ name, children: [] });
        }
      }
    }

    console.log(tree);

    console.log(allFiles);

    var test = [];
    for (var j = 0; j < accompanyingdata.length; j++) {
      var checked = accompanyingdata.includes(allFiles[j]);
      test.push(
        <div key={j} className="file">
          <input
            type="checkbox"
            className="file-checkbox"
            id={allFiles[j]}
            title={checked ? "Remove file" : "Include file"}
            onChange={this.updateArray}
            checked={checked}
          />
          {files[j][files[j].length - 1]}
        </div>
      );
    }

    return <div className="fileselector">{test}</div>;
  }
}

export default FileSelector;

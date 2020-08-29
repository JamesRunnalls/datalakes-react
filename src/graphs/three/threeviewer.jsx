import React, { Component } from "react";
import * as THREE from "three";
import axios from "axios";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { apiUrl } from "../../config.json";
import * as d3 from "d3";
import "./threeviewer.css";
import Loading from "../../components/loading/loading";

class ThreeViewer extends Component {
  state = {
    loaded: false,
  };
  modelLoader = async (url) => {
    var loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(url, (data) => resolve(data), null, reject);
    });
  };

  async componentDidMount() {
    this.model = await this.modelLoader("./models/lakegeneva.glb");
    var { data } = await axios.get(
      apiUrl + "/externaldata/meteolakes/threed/geneva/velocity/737873"
    );
    var { depths, arr } = data;

    // Map global go-ordinate to grid co-ordinates
    var min, max;
    this.model.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        ({ min, max } = new THREE.Box3().setFromObject(child));
      }
    });

    let x_array = arr.map((q) => q[0]);
    let y_array = arr.map((q) => q[1]);

    let min_x = Math.min(...x_array);
    let min_y = Math.min(...y_array);
    let max_x = Math.max(...x_array);
    let max_y = Math.max(...y_array);
    let max_z = Math.max(...depths);
    let min_z = Math.min(...depths);

    depths = depths.map(
      (d) => min.z + ((d - min_z) / (max_z - min_z)) * (max.z - min.z)
    );

    arr = arr.map((a) => {
      a[0] = min.x + ((a[0] - min_x) / (max_x - min_x)) * (max.x - min.x);
      a[1] = min.y + ((a[1] - min_y) / (max_y - min_y)) * (max.y - min.y);
      return a;
    });

    var randomPick = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i][2].length; j++) {
        randomPick.push([i, j]);
      }
    }

    var {
      nCols,
      nRows,
      xSize,
      ySize,
      xllcorner,
      yllcorner,
      griddata,
    } = this.dataToGrid(arr, 0.5);

    console.log(griddata);
    console.log(randomPick);

    this.setState(
      {
        nCols,
        nRows,
        xSize,
        ySize,
        xllcorner,
        yllcorner,
        griddata,
        arr,
        depths,
        randomPick,
        loaded: true,
        velocityFactor: 1,
      },
      () => {
        this.sceneSetup();
        this.addCustomSceneObjects();
        this.startAnimationLoop();
        window.addEventListener("resize", this.handleWindowResize);
      }
    );
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }

  sceneSetup = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.maxAge = 1000;
    this.noParticles = 5000;

    this.fadeOut = Math.round(this.maxAge * 0.2);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x747474);
    this.camera = new THREE.PerspectiveCamera(
      75, // fov = field of view
      width / height, // aspect ratio
      0.1, // near plane
      1000 // far plane
    );
    this.camera.position.z = 55;
    this.camera.position.x = 5;
    this.camera.position.y = 15;
    this.controls = new OrbitControls(this.camera, this.mount);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
  };

  initialPositions = () => {
    var { arr, randomPick, depths } = this.state;
    var pl = randomPick.length;
    this.lines.forEach((line) => {
      let pick = randomPick[Math.round(pl * Math.random())];
      let positions = line.data.geometry.attributes.position.array;
      positions[0] = arr[pick[0]][0]; // x
      positions[1] = depths[pick[1]]; // z
      //positions[1] = 0; // z
      positions[2] = -arr[pick[0]][1]; // -y
      positions[3] = positions[0];
      positions[4] = positions[1];
      positions[5] = positions[2];
      line.data.geometry.attributes.position.needsUpdate = true;
    });
  };

  nextPosition = (xin, yin, zin) => {
    let {
      xSize,
      ySize,
      xllcorner,
      yllcorner,
      nCols,
      nRows,
      griddata,
      velocityFactor,
    } = this.state;
    var i = Math.round((yin - yllcorner) / ySize);
    var j = Math.round((xin - xllcorner) / xSize);
    if (i > -1 && i < nRows && j > -1 && j < nCols && griddata[i][j] !== null) {
      var u = 0;
      var v = 0;
      if (griddata[i][j][0].length > 0) u = griddata[i][j][0][0];
      if (griddata[i][j][1].length > 0) v = griddata[i][j][1][0];
      var x = xin + v * velocityFactor;
      var y = yin + u * velocityFactor;
      //var x = xin + (Math.random() - 0.5) / 10;
      //var y = yin + (Math.random() - 0.5) / 10;
      return { x, y, z: zin };
    } else {
      return false;
    }
  };

  dataToGrid = (arr, radius) => {
    function createAndFillTwoDArray({ rows, columns, defaultValue }) {
      return Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => defaultValue)
      );
    }

    var data = JSON.parse(JSON.stringify(arr));

    var nCols = 200;
    var nRows = 200;

    let x_array = data.map((df) => df[0]);
    let y_array = data.map((df) => df[1]);

    let min_x = Math.min(...x_array);
    let min_y = Math.min(...y_array);
    let max_x = Math.max(...x_array);
    let max_y = Math.max(...y_array);

    let xSize = (max_x - min_x) / nCols;
    let ySize = (max_y - min_y) / nRows;

    let quadtree = d3
      .quadtree()
      .extent([
        [min_x, min_y],
        [max_x, max_y],
      ])
      .addAll(data);

    var outdata = createAndFillTwoDArray({
      rows: nRows + 1,
      columns: nCols + 1,
      defaultValue: null,
    });
    var x, y;
    for (var i = 0; i < nRows + 1; i++) {
      y = max_y - i * ySize;
      for (var j = 0; j < nCols + 1; j++) {
        x = min_x + j * xSize;
        let quad = quadtree.find(x, y, radius);
        if (quad !== undefined) {
          outdata[i][j] = [
            JSON.parse(JSON.stringify(quad[2])),
            JSON.parse(JSON.stringify(quad[3])),
          ];
        }
      }
    }
    return {
      nCols,
      nRows,
      xSize,
      ySize,
      xllcorner: min_x,
      yllcorner: min_y,
      griddata: outdata,
    };
  };

  updatePositions = () => {
    var { arr, randomPick, depths } = this.state;
    var pl = randomPick.length;
    this.lines.forEach((line) => {
      let positions = line.data.geometry.attributes.position.array;
      let colors = line.data.geometry.attributes.color.array;
      if (line.age < line.maxAge - this.fadeOut) {
        // Move to next position
        line.age++;
        var nextposition = this.nextPosition(
          positions[(line.age - 1) * 3],
          positions[(line.age - 1) * 3 + 2],
          positions[(line.age - 1) * 3 + 1]
        );
        if (nextposition) {
          positions[line.age * 3] = nextposition.x;
          positions[line.age * 3 + 1] = nextposition.z;
          positions[line.age * 3 + 2] = nextposition.y;
          for (let c = 1; c < line.age; c++) {
            colors[c * 4 - 1] = Math.exp(1 - 1 / (c / line.age) ** 2);
          }
          line.data.geometry.attributes.color.needsUpdate = true;
          line.data.geometry.setDrawRange(0, line.age);
          line.data.geometry.attributes.position.needsUpdate = true;
        } else {
          line.age = line.maxAge;
        }
      } else if (line.age < line.maxAge) {
        // Fade out line
        line.age++;
        for (let c = 1; c < line.age; c++) {
          colors[c * 4 - 1] = Math.max(
            colors[c * 4 - 1] - colors[c * 4 - 1] / (line.maxAge - line.age),
            0
          );
        }
        line.data.geometry.attributes.color.needsUpdate = true;
      } else {
        // Reset particle location
        line.age = 0;
        line.maxAge =
          Math.round((this.maxAge - this.fadeOut) * Math.random()) +
          this.fadeOut;
        let pick = randomPick[Math.round(pl * Math.random())];
        positions[0] = arr[pick[0]][0]; // x
        positions[1] = depths[pick[1]]; // z
        //positions[1] = 0; // z
        positions[2] = -arr[pick[0]][1]; // -y
        positions[3] = positions[0] + 0.1;
        positions[4] = positions[1] + 0.1;
        positions[5] = positions[2] + 0.1;
        for (let c = 0; c < this.maxAge * 4; c++) {
          colors[c] = 1;
        }
        line.data.geometry.setDrawRange(0, line.age);
        line.data.geometry.attributes.position.needsUpdate = true;
        line.data.geometry.attributes.color.needsUpdate = true;
      }
    });
  };

  addCustomSceneObjects = () => {
    var vertexShader = `
      precision mediump float;
      precision mediump int;

      attribute vec4 color;
      varying vec4 vColor;

      void main()    {

        vColor = color;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

      }
    `;
    var fragmentShader = `
      precision mediump float;
      precision mediump int;

      varying vec4 vColor;

      void main()    {

        vec4 color = vec4( vColor );
        gl_FragColor = color;

      }
    `;

    this.model.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.color.setHex(0x808080);
        child.material.opacity = 0.2;
      }
    });
    this.scene.add(this.model.scene);

    var box = new THREE.BoxHelper(this.model.scene, 0xffff00);
    this.scene.add(box);

    // geometry
    var geometry = new THREE.BufferGeometry();

    var colors = new Array(this.maxAge * 4).fill(1);
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 4, true)
    );

    var positions = new Float32Array(this.maxAge * 3); // 3 vertices per point
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Set draw range
    geometry.setDrawRange(0, 0);

    // Material
    var material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
    });
    this.lines = [];

    for (var p = 0; p < this.noParticles; p++) {
      let line = new THREE.Line(geometry.clone(), material.clone());
      this.lines.push({
        data: line,
        age: 0,
        maxAge:
          Math.round((this.maxAge - this.fadeOut) * Math.random()) +
          this.fadeOut,
      });
      this.scene.add(line);
    }

    var axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // update positions
    this.initialPositions();

    var light = new THREE.AmbientLight(0x404040);
    this.scene.add(light);
  };

  startAnimationLoop = () => {
    this.updatePositions();
    this.renderer.render(this.scene, this.camera);
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
  };

  handleWindowResize = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  render() {
    var { loaded } = this.state;
    return (
      <div className="temp">
        <div className="threeviewer" ref={(ref) => (this.mount = ref)}>
          {!loaded && (
            <div className="loading">
              <Loading />
              Loading 3D Model
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ThreeViewer;

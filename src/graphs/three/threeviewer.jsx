import React, { Component } from "react";
import * as THREE from "three";
import axios from "axios";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { apiUrl } from "../../config.json";
import * as d3 from "d3";
import "./threeviewer.css";

class ThreeViewer extends Component {
  modelLoader = async (url) => {
    var loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(url, (data) => resolve(data), null, reject);
    });
  };

  async componentDidMount() {
    this.model = await this.modelLoader("./models/lakegeneva.glb");
    var { data } = await axios.get(
      apiUrl + "/externaldata/meteolakes/threed/zurich/velocity/737873"
    );
    var { depths, arr } = data;

    // Map global go-ordinate to grid co-ordinates
    var min, max;
    this.model.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.computeBoundingBox();
        ({ min, max } = child.geometry.boundingBox);
      }
    });

    let x_array = arr.map((q) => q[0]);
    let y_array = arr.map((q) => q[1]);

    let min_x = Math.min(...x_array);
    let min_y = Math.min(...y_array);
    let max_x = Math.max(...x_array);
    let max_y = Math.max(...y_array);

    //depths = depths * - max.z/Math.max()
    console.log(min, max);

    let quadtree = d3
      .quadtree()
      .extent([
        [min_x, min_y],
        [max_x, max_y],
      ])
      .addAll(arr);

    var randomPick = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i][2].length; j++) {
        randomPick.push([i, j]);
      }
    }

    this.setState({ arr, quadtree, depths, randomPick }, () => {
      this.sceneSetup();
      this.addCustomSceneObjects();
      this.startAnimationLoop();
      window.addEventListener("resize", this.handleWindowResize);
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }

  sceneSetup = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.maxAge = 500;
    this.noParticles = 2000;

    this.fadeOut = Math.round(this.maxAge * 0.1);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x535470);
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
      positions[0] = arr[pick[0]][0];
      positions[1] = arr[pick[0]][1];
      positions[2] = depths[pick[1]];
      positions[3] = positions[0];
      positions[4] = positions[1];
      positions[5] = positions[2];
      line.data.geometry.attributes.position.needsUpdate = true;
    });
  };

  updatePositions = () => {
    this.lines.forEach((line) => {
      let positions = line.data.geometry.attributes.position.array;
      let colors = line.data.geometry.attributes.color.array;
      if (line.age < line.maxAge - this.fadeOut) {
        // Move to next position
        line.age++;
        positions[line.age * 3] =
          positions[(line.age - 1) * 3] + Math.random() / 10;
        positions[line.age * 3 + 1] =
          positions[(line.age - 1) * 3 + 1] + (Math.random() - 0.5) / 10;
        positions[line.age * 3 + 2] =
          positions[(line.age - 1) * 3 + 2] + Math.random() / 10;
        for (let c = 1; c < line.age; c++) {
          colors[c * 4 - 1] = Math.exp(1 - 1 / (c / line.age) ** 2);
        }
        line.data.geometry.attributes.color.needsUpdate = true;
        line.data.geometry.setDrawRange(0, line.age);
        line.data.geometry.attributes.position.needsUpdate = true;
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
        positions[0] = (Math.random() - 0.5) * 50;
        positions[1] = (Math.random() - 0.5) * 50;
        positions[2] = (Math.random() - 0.5) * 50;
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
        this.test = child;
      }
    });
    this.scene.add(this.model.scene);

    var box = new THREE.Box3();
    console.log(this.test);
    box.copy(this.test.geometry.boundingBox);
    this.scene.add(box);
    var bbox = new THREE.Box3().setFromObject(this.model.scene);
    this.scene.add(bbox);
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
    return <div className="threeviewer" ref={(ref) => (this.mount = ref)} />;
  }
}

export default ThreeViewer;

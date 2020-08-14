import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./threeviewer.css";

class ThreeViewer extends Component {
  componentDidMount() {
    this.sceneSetup();
    this.addCustomSceneObjects();
    this.startAnimationLoop();
    window.addEventListener("resize", this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    window.cancelAnimationFrame(this.requestID);
    this.controls.dispose();
  }

  sceneSetup = () => {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.maxAge = 200;
    this.noParticles = 2000;

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

  loadModel = (gltf) => {
    this.scene.add(gltf.scene);
  };

  loadModelError = (error) => {
    console.error(error);
  };

  initialPositions = () => {
    this.lines.forEach((line) => {
      let positions = line.data.geometry.attributes.position.array;
      positions[0] = (Math.random() - 0.5) * 50;
      positions[1] = (Math.random() - 0.5) * 50;
      positions[2] = (Math.random() - 0.5) * 50;
      positions[3] = positions[0] + 0.1;
      positions[4] = positions[1] + 0.1;
      positions[5] = positions[2] + 0.1;
      line.data.geometry.setDrawRange(0, line.age);
      line.data.geometry.attributes.position.needsUpdate = true;
    });
  };

  updatePositions = () => {
    this.lines.forEach((line) => {
      line.age++;
      let positions = line.data.geometry.attributes.position.array;
      positions[line.age * 3] =
        positions[(line.age - 1) * 3] + Math.random() / 10;
      positions[line.age * 3 + 1] =
        positions[(line.age - 1) * 3 + 1] + (Math.random() - 0.5) / 10;
      positions[line.age * 3 + 2] =
        positions[(line.age - 1) * 3 + 2] + Math.random() / 10;
      line.data.geometry.setDrawRange(0, line.age);
      line.data.geometry.attributes.position.needsUpdate = true;
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

    var loader = new GLTFLoader();
    loader.load(
      "./models/lakegeneva.glb",
      this.loadModel,
      undefined,
      this.loadModelError
    );

    // geometry
    var geometry = new THREE.BufferGeometry();
    var colors = [];
    for (var i = 0; i < this.maxAge; i++) {
      colors.push(1);
      colors.push(1);
      colors.push(1);
      colors.push(i / this.maxAge);
      colors.push(1);
      colors.push(1);
      colors.push(1);
      colors.push(i / this.maxAge);
    }

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
      let line = new THREE.Line(geometry.clone(), material);
      this.lines.push({ data: line, age: 0 });
      this.scene.add(line);
    }

    // update positions
    this.initialPositions();

    const lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    this.scene.add(lights[0]);
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

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

    this.scene = new THREE.Scene();
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
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
  };

  loadModel = (gltf) => {
    this.scene.add(gltf.scene);
  };

  loadModelError = (error) => {
    console.error(error);
  };

  addCustomSceneObjects = () => {
    var loader = new GLTFLoader();
    loader.load(
      "./models/lakegeneva.glb",
      this.loadModel,
      undefined,
      this.loadModelError
    );

    var x = 100;
    var y = 100;
    var geometry = new THREE.Geometry();
    for (var i = 0; i < x; i++) {
      for (var j = 0; j < y; j++) {
        var v = new THREE.Vector3();
        v.x = i * 10;
        v.y =
          Math.sin((i / 100) * Math.PI * 2) + Math.cos((j / 100) * Math.PI) * 2;
        v.z = j * 10;
        geometry.vertices.push(v);
      }
    }
    this.points = new THREE.Points(geometry);
    this.scene.add(this.points);

    const lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    this.scene.add(lights[0]);
  };

  startAnimationLoop = () => {
    var geometry = this.points.geometry;
    geometry.vertices.forEach(function (v) {
      v.y = v.y + Math.random() - 0.5
      v.x = v.x + Math.random() - 0.5
      v.z = v.z + Math.random() - 0.5
    });
    geometry.verticesNeedUpdate = true;
    //geometry.colorsNeedUpdate = true;
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

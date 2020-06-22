import L from "leaflet";
import * as d3 from "d3";

L.VectorFieldAnim = (L.Layer ? L.Layer : L.Class).extend({
  options: {
    paths: 1600,
    color: "black", // html-color | function colorFor(value) [e.g. chromajs.scale]
    width: 2.0, // number | function widthFor(value)
    fade: 0.96, // 0 to 1
    duration: 5, // milliseconds per 'frame'
    maxAge: 200, // number of maximum frames per path
    velocityScale: 100,
    maxDistance: 100,
  },
  initialize: function (inputdata, options) {
    this._inputdata = inputdata;
    this._searchinput = inputdata.flat().filter((id) => id !== null);
    L.Util.setOptions(this, options);
    this.timer = null;
  },

  onAdd: function (map) {
    this._map = map;

    if (!this._canvas) {
      this._initCanvas();
    }

    if (this.options.pane) {
      this.getPane().appendChild(this._canvas);
    } else {
      map._panes.overlayPane.appendChild(this._canvas);
    }

    map.on("moveend", this._reset, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      //map.on("zoomanim", this._animateZoom, this);
    }

    //this._reset();
  },

  _reset: function () {
    this._stopAnimation();
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._drawLayer();
  },

  onRemove: function (map) {
    if (this.options.pane) {
      this.getPane().removeChild(this._canvas);
    } else {
      map.getPanes().overlayPane.removeChild(this._canvas);
    }

    map.off("moveend", this._reset, this);

    if (map.options.zoomAnimation) {
      //map.off("zoomanim", this._animateZoom, this);
    }
  },

  addTo: function (map) {
    map.addLayer(this);
    return this;
  },

  _initCanvas: function () {
    var canvas = (this._canvas = L.DomUtil.create(
      "canvas",
      "leaflet-vectorfield-layer leaflet-layer"
    ));

    var originProp = L.DomUtil.testProp([
      "transformOrigin",
      "WebkitTransformOrigin",
      "msTransformOrigin",
    ]);
    canvas.style[originProp] = "50% 50%";

    var size = this._map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;

    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(
      canvas,
      "leaflet-zoom-" + (animated ? "animated" : "hide")
    );

    this._canvas = canvas;
    this._ctx = canvas.getContext("2d");
    this._width = canvas.width;
    this._height = canvas.height;

    this._nRows = this._inputdata.length;
    this._nCols = this._inputdata[0].length;
  },

  _drawLayer: function () {
    this._ctx.clearRect(0, 0, this._width, this._height);
    this._paths = this._prepareParticlePaths();
    let self = this;
    this.timer = d3.timer(function (elapsed) {
      self._moveParticles();
      self._drawParticles();
    }, this.options.duration);
  },

  _moveParticles: function () {
    let self = this;
    this._paths.forEach(function (par) {
      if (par.x === null || par.age > self.options.maxAge) {
        par.age = 0;
        self._randomPosition(par);
        par.xt = null;
        par.yt = null;
        par.ut = null;
        par.vt = null;
      } else {
        let xt = par.x + par.u * self.options.velocityScale;
        let yt = par.y + par.v * self.options.velocityScale;

        let newPar = self._getValueAtPoint(xt, yt);
        if (newPar.x === null) {
          par.xt = null;
          par.yt = null;
          par.ut = null;
          par.vt = null;
        } else {
          par.xt = xt;
          par.yt = yt;
          par.ut = newPar.u;
          par.vt = newPar.v;
        }

        if (par.xt === null) {
          par.age = self.options.maxAge;
        }
      }

      par.age += 1;
    });
  },

  _drawParticles: function () {
    // Previous paths...
    let ctx = this._ctx;
    let prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //ctx.globalCompositeOperation = 'source-over';
    ctx.globalCompositeOperation = prev;

    // fading paths...
    ctx.fillStyle = `rgba(0, 0, 0, ${this.options.fade})`;
    ctx.lineWidth = this.options.width;
    ctx.strokeStyle = this.options.color;

    // New paths
    let self = this;
    this._paths.forEach(function (par) {
      self._drawParticle(ctx, par);
    });
  },

  _drawParticle: function (ctx, par) {
    if (par.age <= this.options.maxAge && par.x !== null && par.xt !== null) {
      let sourcelatlng = this._CHtolatlng([par.y, par.x]);
      let targetlatlng = this._CHtolatlng([par.yt, par.xt]);
      let source = new L.latLng(sourcelatlng[0], sourcelatlng[1]);
      let target = new L.latLng(targetlatlng[0], targetlatlng[1]);

      let pA = this._map.latLngToContainerPoint(source);
      let pB = this._map.latLngToContainerPoint(target);

      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);

      // next-step movement
      par.x = par.xt;
      par.y = par.yt;
      par.u = par.ut;
      par.v = par.vt;

      // colormap vs. simple color
      let color = this.options.color;
      if (typeof color === "function") {
        ctx.strokeStyle = color(par.m);
      }

      let width = this.options.width;
      if (typeof width === "function") {
        ctx.lineWidth = width(par.m);
      }

      ctx.stroke();
    }
  },

  _getValueAtPoint(x, y) {
    let par = {};
    let distance = this._searchinput.map((s) => {
      return { data: s, dist: Math.sqrt((x - s[1]) ** 2 + (y - s[0]) ** 2) };
    });
    distance.sort((a, b) => (a.dist > b.dist ? 1 : -1));
    if (distance[0].dist < this.options.maxDistance) {
      par.x = distance[0].data[1];
      par.y = distance[0].data[0];
      par.u = distance[0].data[3];
      par.v = distance[0].data[4];
    } else {
      par.x = null;
      par.y = null;
      par.u = null;
      par.v = null;
    }
    return par;
  },

  _prepareParticlePaths: function () {
    let paths = [];

    for (var i = 0; i < this.options.paths; i++) {
      let p = this._randomPosition();
      p.age = this._randomAge();
      paths.push(p);
    }
    return paths;
  },
  _randomAge: function () {
    return Math.floor(Math.random() * this.options.maxAge);
  },
  _randomPosition: function (o = {}) {
    let i = (Math.random() * this._nCols) | 0;
    let j = (Math.random() * this._nRows) | 0;

    if (this._inputdata[j][i] === null) {
      o.x = null;
      o.y = null;
      o.u = null;
      o.v = null;
    } else {
      o.x = this._inputdata[j][i][1];
      o.y = this._inputdata[j][i][0];
      o.u = this._inputdata[j][i][3];
      o.v = this._inputdata[j][i][4];
    }
    return o;
  },
  _CHtolatlng: function (yx) {
    var y_aux = (yx[0] - 600000) / 1000000;
    var x_aux = (yx[1] - 200000) / 1000000;
    var lat =
      16.9023892 +
      3.238272 * x_aux -
      0.270978 * Math.pow(y_aux, 2) -
      0.002528 * Math.pow(x_aux, 2) -
      0.0447 * Math.pow(y_aux, 2) * x_aux -
      0.014 * Math.pow(x_aux, 3);
    var lng =
      2.6779094 +
      4.728982 * y_aux +
      0.791484 * y_aux * x_aux +
      0.1306 * y_aux * Math.pow(x_aux, 2) -
      0.0436 * Math.pow(y_aux, 3);
    lat = (lat * 100) / 36;
    lng = (lng * 100) / 36;

    return [lat, lng];
  },
  _stopAnimation: function () {
    if (this.timer) {
      this.timer.stop();
    }
  },
});

L.vectorFieldAnim = function (inputdata, options) {
  return new L.VectorFieldAnim(inputdata, options);
};

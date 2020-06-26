import L from "leaflet";
import * as d3 from "d3";

L.VectorFieldAnim = (L.Layer ? L.Layer : L.Class).extend({
  options: {
    paths: 800,
    color: "black",
    width: 0.5,
    fade: 0.97,
    duration: 10,
    maxAge: 50,
    velocityScale: 700,
  },
  initialize: function (inputdata, options) {
    this._inputdata = inputdata;
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
    map.on("click", this._onClick, this);
    map.on("moveend", this._reset, this);
    map.on("movestart", this._clear, this);
    this._reset();
  },

  _reset: function () {
    this._stopAnimation();
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._drawLayer();
  },

  _clear: function () {
    this._ctx.clearRect(0, 0, this._width, this._height);
    this._stopAnimation();
  },

  onRemove: function (map) {
    if (this.options.pane) {
      this.getPane().removeChild(this._canvas);
    } else {
      map.getPanes().overlayPane.removeChild(this._canvas);
    }
    map.off("click", this._onClick, this);
    map.off("moveend", this._reset, this);
    map.off("movestart", this._clear, this);
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
  },

  _drawLayer: function () {
    this._ctx.clearRect(0, 0, this._width, this._height);
    this._paths = this._prepareParticlePaths();
    let self = this;
    /*for (var i = 0; i < 2000; i++) {
      self._moveParticles();
      self._drawParticles();
    }*/
    this.timer = d3.timer(function () {
      self._moveParticles();
      self._drawParticles();
    }, this.options.duration);
  },

  _moveParticles: function () {
    let { vectordata } = this._inputdata;
    let self = this;
    this._paths.forEach(function (par) {
      if (par.age > self.options.maxAge) {
        self._randomPosition(par);
        par.age = 0;
      }
      let xt = par.x + par.u * self.options.velocityScale;
      let yt = par.y + par.v * self.options.velocityScale;
      let index = self._getIndexAtPoint(xt, yt);
      if (index === null) {
        self._randomPosition(par);
        par.age = 0;
      } else {
        par.xt = xt;
        par.yt = yt;
        par.ut = vectordata[index[0]][index[1]][0];
        par.vt = vectordata[index[0]][index[1]][1];
      }

      par.age += 1;
    });
  },

  _drawParticles: function () {
    // Previous paths...
    let ctx = this._ctx;
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = "source-over";
    //ctx.globalCompositeOperation = prev;

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
    if (par.age <= this.options.maxAge && par !== null && par.xt) {
      let sourcelatlng = this._CHtolatlng([par.x, par.y]);
      let targetlatlng = this._CHtolatlng([par.xt, par.yt]);
      let source = new L.latLng(sourcelatlng[0], sourcelatlng[1]);
      let target = new L.latLng(targetlatlng[0], targetlatlng[1]);

      try {
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
          let mag = Math.sqrt(par.u ** 2 + par.v ** 2);
          ctx.strokeStyle = color(mag);
        }

        let width = this.options.width;
        if (typeof width === "function") {
          let mag = Math.sqrt(par.u ** 2 + par.v ** 2);
          ctx.lineWidth = width(mag);
        }

        ctx.stroke();
      } catch (e) {
        this._stopAnimation();
      }
    }
  },

  _getIndexAtPoint(x, y) {
    let {
      xSize,
      ySize,
      xllcorner,
      yllcorner,
      nCols,
      nRows,
      vectordata,
    } = this._inputdata;
    var i = vectordata.length - Math.round((y - yllcorner) / ySize);
    var j = Math.round((x - xllcorner) / xSize);
    if (
      i > -1 &&
      i < nRows &&
      j > -1 &&
      j < nCols &&
      vectordata[i][j] !== null
    ) {
      return [i, j];
    } else {
      return null;
    }
  },

  _prepareParticlePaths: function () {
    let paths = [];
    for (var i = 0; i < this.options.paths; i++) {
      let p = this._randomPosition();
      if (p !== null) {
        p.age = this._randomAge();
        paths.push(p);
      }
    }
    return paths;
  },
  _randomAge: function () {
    return Math.floor(Math.random() * this.options.maxAge);
  },
  _randomPosition: function (o = {}) {
    let {
      xSize,
      ySize,
      xllcorner,
      yllcorner,
      nCols,
      nRows,
      vectordata,
    } = this._inputdata;

    delete o.xt;
    delete o.yt;
    delete o.ut;
    delete o.vt;

    var maxiter = 1000;
    for (var k = 0; k < maxiter; k++) {
      let i = (Math.random() * nRows) | 0;
      let j = (Math.random() * nCols) | 0;
      if (vectordata[i][j] !== null) {
        o.x = xllcorner + j * xSize + xSize * Math.random() - xSize / 2;
        o.y =
          yllcorner +
          (vectordata.length - i) * ySize +
          ySize * Math.random() -
          ySize / 2;
        o.u = vectordata[i][j][0];
        o.v = vectordata[i][j][1];
        return o;
      }
    }
    return null;
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
  _WGSlatlngtoCH: function (lat, lng) {
    lat = lat * 3600;
    lng = lng * 3600;
    var lat_aux = (lat - 169028.66) / 10000;
    var lng_aux = (lng - 26782.5) / 10000;
    var y =
      2600072.37 +
      211455.93 * lng_aux -
      10938.51 * lng_aux * lat_aux -
      0.36 * lng_aux * lat_aux ** 2 -
      44.54 * lng_aux ** 3 -
      2000000;
    var x =
      1200147.07 +
      308807.95 * lat_aux +
      3745.25 * lng_aux ** 2 +
      76.63 * lat_aux ** 2 -
      194.56 * lng_aux ** 2 * lat_aux +
      119.79 * lat_aux ** 3 -
      1000000;
    return { x, y };
  },
  _stopAnimation: function () {
    if (this.timer) {
      this.timer.stop();
    }
  },
  _onClick: function (t) {
    var e = this._queryValue(t);
    this.fire("click", e);
  },
  _queryValue: function (click) {
    var { vectordata } = this._inputdata;
    var point = this._WGSlatlngtoCH(click.latlng.lat, click.latlng.lng);
    let index = this._getIndexAtPoint(point.y, point.x);
    if (index === null) {
      click["value"] = { u: null, v: null };
    } else {
      click["value"] = {
        u: vectordata[index[0]][index[1]][0],
        v: vectordata[index[0]][index[1]][1],
      };
    }
    return click;
  },
});

L.vectorFieldAnim = function (inputdata, options) {
  return new L.VectorFieldAnim(inputdata, options);
};

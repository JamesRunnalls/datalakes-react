import L from "leaflet";

function arrows(canvas) {
  if (!(this instanceof arrows)) return new arrows(canvas);

  this._canvas = canvas =
    typeof canvas === "string" ? document.getElementById(canvas) : canvas;

  this._ctx = canvas.getContext("2d");
  this._width = canvas.width;
  this._height = canvas.height;

  this._max = 1;
  this._data = [];
}

arrows.prototype = {
  data: function(data) {
    this._data = data;
    return this;
  },

  max: function(max) {
    this._max = max;
    return this;
  },

  add: function(point) {
    this._data.push(point);
    return this;
  },

  clear: function() {
    this._data = [];
    return this;
  },

  radius: function(r, blur) {
    blur = blur === undefined ? 15 : blur;
    var circle = (this._circle = this._createCanvas()),
      ctx = circle.getContext("2d"),
      r2 = (this._r = r + blur);
    return this;
  },

  resize: function() {
    this._width = this._canvas.width;
    this._height = this._canvas.height;
  },

  draw: function() {
    var ctx = this._ctx;
    ctx.clearRect(0, 0, this._width, this._height);

    for (var i = 0, len = this._data.length, p; i < len; i++) {
      p = this._data[i];
      var cell = { x: p[0], y: p[1], value: p[2], rotation: Math.PI };
      this._drawArrow(cell, ctx);
    }

    return this;
  },

  _drawArrow: function(cell, ctx) {
    // Arrow Size
    const size = 20;

    // Arrow Center
    ctx.save();
    ctx.translate(cell.x, cell.y);

    // Arrow Color
    var color = "#000000";
    //if (typeof color === "function") {
    //  ctx.strokeStyle = color(value);
    ctx.strokeStyle = color;

    // Arrow Rotation
    ctx.rotate(cell.rotation); // Rotation in rads

    // Set other properties
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    // Draw Path
    ctx.beginPath();
    ctx.moveTo(-size / 2, 0);
    ctx.lineTo(+size / 2, 0);
    ctx.moveTo(size * 0.25, -size * 0.25);
    ctx.lineTo(+size / 2, 0);
    ctx.lineTo(size * 0.25, size * 0.25);
    ctx.stroke();
    ctx.restore();
  },

  _createCanvas: function() {
    if (typeof document !== "undefined") {
      return document.createElement("canvas");
    } else {
      // create a new canvas instance in node.js
      // the canvas class needs to have a default constructor without any parameter
      return new this._canvas.constructor();
    }
  }
};

L.VectorField = (L.Layer ? L.Layer : L.Class).extend({
  initialize: function(inputdata, options) {
    this._inputdata = inputdata;
    L.setOptions(this, options);
  },

  setInputData: function(inputdata) {
    this._inputdata = inputdata;
    return this.redraw();
  },

  addInputData: function(inputdata) {
    this._inputdata.push(inputdata);
    return this.redraw();
  },

  setOptions: function(options) {
    L.setOptions(this, options);
    if (this._arrows) {
      this._updateOptions();
    }
    return this.redraw();
  },

  redraw: function() {
    if (this._arrows && !this._frame && this._map && !this._map._animating) {
      this._frame = L.Util.requestAnimFrame(this._redraw, this);
    }
    return this;
  },

  onAdd: function(map) {
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
      map.on("zoomanim", this._animateZoom, this);
    }

    this._reset();
  },

  onRemove: function(map) {
    if (this.options.pane) {
      this.getPane().removeChild(this._canvas);
    } else {
      map.getPanes().overlayPane.removeChild(this._canvas);
    }

    map.off("moveend", this._reset, this);

    if (map.options.zoomAnimation) {
      map.off("zoomanim", this._animateZoom, this);
    }
  },

  addTo: function(map) {
    map.addLayer(this);
    return this;
  },

  _initCanvas: function() {
    var canvas = (this._canvas = L.DomUtil.create(
      "canvas",
      "leaflet-vectorfield-layer leaflet-layer"
    ));

    var originProp = L.DomUtil.testProp([
      "transformOrigin",
      "WebkitTransformOrigin",
      "msTransformOrigin"
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

    this._arrows = arrows(canvas);
    this._updateOptions();
  },

  _updateOptions: function() {
    this._arrows.radius(
      this.options.radius || this._arrows.defaultRadius,
      this.options.blur
    );

    if (this.options.gradient) {
      this._arrows.gradient(this.options.gradient);
    }
    if (this.options.max) {
      this._arrows.max(this.options.max);
    }
  },

  _reset: function() {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);

    var size = this._map.getSize();

    if (this._arrows._width !== size.x) {
      this._canvas.width = this._arrows._width = size.x;
    }
    if (this._arrows._height !== size.y) {
      this._canvas.height = this._arrows._height = size.y;
    }

    this._redraw();
  },

  _redraw: function() {
    if (!this._map) {
      return;
    }
    console.log(this._inputdata)
    var data = [],
      r = this._arrows._r,
      size = this._map.getSize(),
      bounds = new L.Bounds(L.point([-r, -r]), size.add([r, r])),
      max = this.options.max === undefined ? 1 : this.options.max,
      maxZoom =
        this.options.maxZoom === undefined
          ? this._map.getMaxZoom()
          : this.options.maxZoom,
      vv =
        1 /
        Math.pow(2, Math.max(0, Math.min(maxZoom - this._map.getZoom(), 12))),
      cellSize = r / 2,
      grid = [],
      panePos = this._map._getMapPanePos(),
      offsetX = panePos.x % cellSize,
      offsetY = panePos.y % cellSize,
      i,
      len,
      p,
      cell,
      x,
      y,
      j,
      len2,
      k,
      lat,
      lng,
      u,
      v;

    for (i = 0, len = this._inputdata.length; i < len; i++) {
      lat = this._inputdata[i][0];
      lng = this._inputdata[i][1];
      u = this._inputdata[i][2];
      v = this._inputdata[i][3];
      p = this._map.latLngToContainerPoint([lat, lng]);
      if (bounds.contains(p)) {
        x = Math.floor((p.x - offsetX) / cellSize) + 2;
        y = Math.floor((p.y - offsetY) / cellSize) + 2;

        var alt =
          this._inputdata[i].alt !== undefined
            ? this._inputdata[i].alt
            : this._inputdata[i][2] !== undefined
            ? +this._inputdata[i][2]
            : 1;
        k = alt * vv;

        grid[y] = grid[y] || [];
        cell = grid[y][x];

        if (!cell) {
          grid[y][x] = [p.x, p.y, k];
        } else {
          cell[0] = (cell[0] * cell[2] + p.x * k) / (cell[2] + k); // x
          cell[1] = (cell[1] * cell[2] + p.y * k) / (cell[2] + k); // y
          cell[2] += k; // cumulated intensity value
        }
      }
    }

    for (i = 0, len = grid.length; i < len; i++) {
      if (grid[i]) {
        for (j = 0, len2 = grid[i].length; j < len2; j++) {
          cell = grid[i][j];
          if (cell) {
            data.push([
              Math.round(cell[0]),
              Math.round(cell[1]),
              Math.min(cell[2], max)
            ]);
          }
        }
      }
    }

    console.log(data)

    this._arrows.data(data).draw();
    this._frame = null;
  },

  _animateZoom: function(e) {
    var scale = this._map.getZoomScale(e.zoom),
      offset = this._map
        ._getCenterOffset(e.center)
        ._multiplyBy(-scale)
        .subtract(this._map._getMapPanePos());

    if (L.DomUtil.setTransform) {
      L.DomUtil.setTransform(this._canvas, offset, scale);
    } else {
      this._canvas.style[L.DomUtil.TRANSFORM] =
        L.DomUtil.getTranslateString(offset) + " scale(" + scale + ")";
    }
  }
});

L.vectorField = function(inputdata, options) {
  return new L.VectorField(inputdata, options);
};

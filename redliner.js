L.Control.Redliner = L.Control.extend({
    options: {
    },
    toggle: function() {
        var self = this
        this.state.open = !this.state.open
        if (this.state.open) {
            this.setTool('move')
        } else {
            if (this.state.currentTool.name != 'move') {
                var terminatePromise = new Promise(self.state.currentTool.terminate)
                    .then(function(result) {
                        self.enableMapControls()
                    }, function(err) {
                        console.log(err)
                    })
            }
        }
    },
    enableMapControls: function() {
        var self = this
        self._map.zoomControl.enable();
        self._map.dragging.enable();
        self._map.touchZoom.enable();
        self._map.doubleClickZoom.enable();
        self._map.scrollWheelZoom.enable();
        self._map.boxZoom.enable();
        self._map.keyboard.enable();
        if (self._map.tap) {
            self._map.tap.enable();
        }
    },
    disableMapControls: function() {
        var self = this
        self._map.zoomControl.disable();
        self._map.dragging.disable();
        self._map.touchZoom.disable();
        self._map.doubleClickZoom.disable();
        self._map.scrollWheelZoom.disable();
        self._map.boxZoom.disable();
        self._map.keyboard.disable();
        if (self._map.tap) {
            self._map.tap.disable();
        }                    
    },
    startDrawingMode: function(addListeners) {
        // clear the canvas
        this.state.drawingCanvas = L.canvas({ padding: 0 })
        this.state.drawingCanvas.addTo(this._map)        
        if (this.state.comment.drawing) {
            this.loadDrawingToCanvas()
            this.state.comment.drawing.removeFrom(this._map)
        }
        
        // add listeners to canvas
        addListeners(this.state.drawingCanvas._container)
    },
    loadDrawingToCanvas: function() {
        var self = this
        var image = self.state.comment.drawing
        var canvas = self.state.drawingCanvas._container;
        var context = canvas.getContext('2d');
        var imageObj = new Image();
        var newWidth = image._image.width
        var newHeight = image._image.height
        imageObj.onload = function () {
            context.drawImage(imageObj, image._image._leaflet_pos.x, image._image._leaflet_pos.y, newWidth, newHeight);
            image.removeFrom(self.ownMap);
        };

        imageObj.src = image._image.src;
    },
    stopDrawingMode: function(cb) {
        var canvas = this.state.drawingCanvas._container;
        var context = this.state.drawingCanvas._ctx;
        var canvasDrawing = canvas.toDataURL("data:image/png");
        var imageBoundsXY = this.state.drawingCanvas._bounds;
        var imageBoundsMinCoord = this._map.layerPointToLatLng(imageBoundsXY.min);
        var imageBoundsMaxCoord = this._map.layerPointToLatLng(imageBoundsXY.max);
        var imageBounds = [
            [imageBoundsMinCoord.lat, imageBoundsMinCoord.lng],
            [imageBoundsMaxCoord.lat, imageBoundsMaxCoord.lng]
        ];
        // merge previous...
        if (this.state.comment.drawing) {
            this.mergeWithOldDrawing(canvasDrawing, imageBounds, cb)
        } else {
            this.state.comment.drawing = L.imageOverlay(canvasDrawing, imageBounds)
            this.state.comment.drawing.addTo(this._map)
            this.state.drawingCanvas.removeFrom(this._map)
            cb()
        }
    },
    mergeWithOldDrawing: function(drawing, bounds, cb) {
        var self = this
        var mergeCanvas = self.state.mergeCanvas
        var oldDrawing = this.state.comment.drawing
        var mergeContext = mergeCanvas.getContext('2d')
        var mapBounds = self._map.getBounds()

        var newX_left = self._map.latLngToLayerPoint(mapBounds._southWest).x;
        var newX_right = self._map.latLngToLayerPoint(mapBounds._northEast).x;
        var newY_top = self._map.latLngToLayerPoint(mapBounds._northEast).y;
        var newY_bottom = self._map.latLngToLayerPoint(mapBounds._southWest).y;
        var oldX_left = self._map.latLngToLayerPoint(oldDrawing._bounds._southWest).x;
        var oldX_right = self._map.latLngToLayerPoint(oldDrawing._bounds._northEast).x;
        var oldY_top = self._map.latLngToLayerPoint(oldDrawing._bounds._northEast).y;
        var oldY_bottom = self._map.latLngToLayerPoint(oldDrawing._bounds._southWest).y;

        var leftMost = Math.min(newX_left, oldX_left);
        var rightMost = Math.max(newX_right, oldX_right);
        var topMost = Math.min(newY_top, oldY_top);
        var bottomMost = Math.max(newY_bottom, oldY_bottom);

        mergeCanvas.height = bottomMost - topMost;
        mergeCanvas.width = rightMost - leftMost;

        var oldImageToCanvas = new Image();
        var newImageToCanvas = new Image();
        var mergedDrawingLayer;
        var newSouthWest = self._map.layerPointToLatLng([leftMost, bottomMost]);
        var newNorthEast = self._map.layerPointToLatLng([rightMost, topMost]);

        oldImageToCanvas.onload = function () {
            mergeContext.drawImage(oldImageToCanvas, oldX_left - leftMost, oldY_top - topMost, oldX_right - oldX_left, oldY_bottom - oldY_top);
            newImageToCanvas.src = drawing;
        };
        newImageToCanvas.onload = function () {
            // to make the eraser tool work... I can deal with this later
            mergeContext.globalCompositeOperation = "destination-out";
            mergeContext.fillStyle = "white";
            mergeContext.fillRect(newX_left - leftMost, newY_top - topMost, newX_right - newX_left, newY_bottom - newY_top);
            mergeContext.globalCompositeOperation = "source-over";
            mergeContext.drawImage(newImageToCanvas, newX_left - leftMost, newY_top - topMost, newX_right - newX_left, newY_bottom - newY_top);
            var mergedDrawing = mergeCanvas.toDataURL("data:image/png");
            self.state.comment.drawing.removeFrom(self._map)
            self.state.comment.drawing = L.imageOverlay(mergedDrawing, [newSouthWest, newNorthEast]);
            self.state.comment.drawing.addTo(self._map)
            self.state.drawingCanvas.removeFrom(self._map)            
            cb()
        };
        oldImageToCanvas.src = this.state.comment.drawing._url;
    },
    drawLine: function (x, y, size, color) {
        var self = this
        //operation properties
        var ctx = self.state.drawingCanvas._ctx
        if (color === 'eraser') {
            color = 'black' // doesn't matter lol
            ctx.globalCompositeOperation = "destination-out";            
        } else {
            ctx.globalCompositeOperation = "source-over";
        }
        // If lastX is not set, set lastX and lastY to the current position
        if (self.state.lastX == -1) {
            self.state.lastX = x;
            self.state.lastY = y;
        }

        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(self.state.lastX, self.state.lastY);
        ctx.lineTo(x, y);
        ctx.lineWidth = size;
        ctx.stroke();
        ctx.closePath();
        // Update the last position to reference the current position
        self.state.lastX = x;
        self.state.lastY = y;
    },
    getMousePos: function (e) {
        pos = this._map.mouseEventToLayerPoint(e);
        return {
            x: pos.x,
            y: pos.y,
        };
    },
    initialize: function (options) {
        var self = this
        L.setOptions(this, options)
        this.state = {
            open: false,
            currentTool: null,
            comment: {},
            stroke: null,
            lastX: -1,
            lastY: -1,
            drawingCanvas: L.canvas({ padding: 0 }),
            mergeCanvas: document.createElement('canvas'),
            saving: false
        }        
        this.toolListeners = {
            redPenDown: function() {
                self.state.stroke = true
            },
            redPenUp: function() {
                self.state.stroke = false
                self.state.lastX = -1
                self.state.lastY = -1                
            },
            redPenMove: function(e) {
                if (self.state.stroke) {
                    var pos = self.getMousePos(e);                
                    self.state.mouseX = pos.x;
                    self.state.mouseY = pos.y;
                    self.drawLine(self.state.mouseX, self.state.mouseY, 3, 'red');
                }
            },        
            yellowPenDown: function() {
                self.state.stroke = true
            },
            yellowPenUp: function() {
                self.state.stroke = false
                self.state.lastX = -1
                self.state.lastY = -1                
            },
            yellowPenMove: function(e) {
                if (self.state.stroke) {
                    var pos = self.getMousePos(e);                
                    self.state.mouseX = pos.x;
                    self.state.mouseY = pos.y;
                    self.drawLine(self.state.mouseX, self.state.mouseY, 3, 'yellow');
                }
            },        
            blackPenDown: function() {
                self.state.stroke = true
            },
            blackPenUp: function() {
                self.state.stroke = false
                self.state.lastX = -1
                self.state.lastY = -1                
            },
            blackPenMove: function(e) {
                if (self.state.stroke) {
                    var pos = self.getMousePos(e);                
                    self.state.mouseX = pos.x;
                    self.state.mouseY = pos.y;
                    self.drawLine(self.state.mouseX, self.state.mouseY, 3, 'black');
                }
            },        
            eraserDown: function() {
                self.state.stroke = true
            },
            eraserUp: function() {
                self.state.stroke = false
                self.state.lastX = -1
                self.state.lastY = -1                
            },
            eraserMove: function(e) {
                if (self.state.stroke) {
                    var pos = self.getMousePos(e);                
                    self.state.mouseX = pos.x;
                    self.state.mouseY = pos.y;
                    self.drawLine(self.state.mouseX, self.state.mouseY, 35, 'eraser');
                }
            }
        }
        this.tools = [
            {
                name: 'move',
                init: function() {
                    self.enableMapControls()
                },
                terminate: function(resolve) {
                    self.disableMapControls()
                    resolve();                    
                }
            },
            {
                name: 'redpen',
                init: function() {
                    self.disableMapControls()
                    self.startDrawingMode(function(canvas) {
                        // add listeners to canvas
                        canvas.addEventListener('mousedown', self.toolListeners.redPenDown);          
                        canvas.addEventListener('mouseup', self.toolListeners.redPenUp);          
                        canvas.addEventListener('mousemove', self.toolListeners.redPenMove);          
                    })                  
                },
                terminate: function(resolve) {
                    self.enableMapControls()
                    self.stopDrawingMode(resolve)
                }
            },
            {
                name: 'yellowpen',
                init: function() {
                    self.disableMapControls()
                    self.startDrawingMode(function(canvas) {
                        // add listeners to canvas
                        canvas.addEventListener('mousedown', self.toolListeners.yellowPenDown);          
                        canvas.addEventListener('mouseup', self.toolListeners.yellowPenUp);          
                        canvas.addEventListener('mousemove', self.toolListeners.yellowPenMove);          
                    })                  
                },
                terminate: function(resolve) {
                    self.enableMapControls()
                    self.stopDrawingMode(resolve)
                }
            },
            {
                name: 'blackpen',
                init: function() {
                    self.disableMapControls()
                    self.startDrawingMode(function(canvas) {
                        // add listeners to canvas
                        canvas.addEventListener('mousedown', self.toolListeners.blackPenDown);          
                        canvas.addEventListener('mouseup', self.toolListeners.blackPenUp);          
                        canvas.addEventListener('mousemove', self.toolListeners.blackPenMove);          
                    })                  
                },
                terminate: function(resolve) {
                    self.enableMapControls()
                    self.stopDrawingMode(resolve)
                }
            },
            {
                name: 'eraser',
                init: function() {
                    self.disableMapControls()
                    self.startDrawingMode(function(canvas) {
                        // add listeners to canvas
                        canvas.addEventListener('mousedown', self.toolListeners.eraserDown);          
                        canvas.addEventListener('mouseup', self.toolListeners.eraserUp);          
                        canvas.addEventListener('mousemove', self.toolListeners.eraserMove);          
                    })                  
                },
                terminate: function(resolve) {
                    self.enableMapControls()
                    self.stopDrawingMode(resolve)
                }
            }
        ]
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-redliner  leaflet-control');        
        return container
    },
    setTool: function(toolName) {
        var self = this
        if (self.state.currentTool && self.state.currentTool.name == toolName) {
            return
        }
        if (this.state.currentTool) {
            var terminatePromise = new Promise(self.state.currentTool.terminate)
                .then(function(result) {
                    var tool
                    self.tools.forEach(function(eachTool) {
                        if (eachTool.name == toolName) {
                            tool = eachTool
                        }
                    })
                    tool.init()
                    self.state.currentTool = tool
                }, function(err) {
                    console.log(err)
                })
        } else {
            var tool
            self.tools.forEach(function(eachTool) {
                if (eachTool.name == toolName) {
                    tool = eachTool
                }
            })
            tool.init()
            self.state.currentTool = tool            
        }
    }
});

L.control.redliner = function (options) {
    return new L.Control.Redliner(options);
};

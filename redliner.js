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
    startTextMode: function(addListeners) {
        // clear the canvas
        this.state.textCanvas = L.canvas({ padding: 0 })
        this.state.textCanvas.addTo(this._map)                
        // add listeners to canvas
        addListeners(this.state.textCanvas._container)
    },    
    stopTextMode: function(cb) {
        // clear the canvas
        try {
            this.state.textCanvas.removeFrom(this._map)
            this.state.textCanvas = null
        } catch (e) {
            
        }
        cb()      
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
    renderText: function(marker) {
        var self = this;
        var textBox = document.getElementById(marker.textId);
        var val = textBox.value        
        var boundingRect = textBox.getBoundingClientRect();
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        //hardcoded for now
        canvas.height = 1000;
        canvas.width = 1000;
        var lineHeight = 25;
        var colWidth = 18;
        ctx.font = "30px monospace";
        var col = 0;
        var row = 0;
        // parsing every character, this is going to turn into a beast one day
        val.split('').forEach(function (splitChar) {
            ctx.fillText(splitChar, col * colWidth, (row + 1) * lineHeight); // figure out the relationship between this offset and the font size....
            col++;
            if ((col == 30) || splitChar == '\n') {
                col = 0;
                row++;
            }
        });

        var img = new Image();

        img.onload = function () {
            self.placeText({
                marker: marker,
                img: img,
                textId: marker.textId,
                val: val
            });
        };

        img.src = self.cropImageFromCanvas(ctx, canvas);
    },
    placeText: function(args) {
        var self = this; // I should get this tattooed on my forehead.

        var marker = args.marker;
        var img = args.img;
        var textId = args.textId;
        var val = args.val;

        var markerToPoint = self._map.latLngToLayerPoint(marker._latlng);
        var southWest = self._map.layerPointToLatLng([markerToPoint.x + img.width, markerToPoint.y + img.height]);
        var northEast = marker._latlng;
        var newTextImageOverlay = L.imageOverlay(img.src, [southWest, northEast], { interactive: true, pane: 'markerPane' });
        marker.bounds = {
            northEast: northEast,
            southWest: southWest,
        };
        marker.dataUrl = img.src;
        marker.textVal = val;
        marker.textZoomLevel = self._map.getZoom();

        // eraser listeners
        newTextImageOverlay.on('mouseover', function () {
            if (self.state.currentTool.name == 'eraser') {
                L.DomUtil.addClass(newTextImageOverlay._image, 'text-hover-erase');
            }
        });
        newTextImageOverlay.on('mouseout', function () {
            if (self.state.currentTool.name == 'eraser') {
                L.DomUtil.removeClass(newTextImageOverlay._image, 'text-hover-erase');
            }
        });
        newTextImageOverlay.on('click', function () {
            if (self.state.currentTool.name == 'eraser') {
                newTextImageOverlay.removeFrom(self._map)
                marker.removeFrom(self._map)
                marker.deleted = true
            }
        });

        // text tool listeners (for editing)
        newTextImageOverlay.on('mouseover', function () {
            if (self.state.currentTool.name == 'text') {
                L.DomUtil.addClass(newTextImageOverlay._image, 'text-hover-edit');
            }
        });
        newTextImageOverlay.on('mouseout', function () {
            if (self.state.currentTool.name == 'text') {
                L.DomUtil.removeClass(newTextImageOverlay._image, 'text-hover-edit');
            }
        });
        newTextImageOverlay.on('click', function () {
            if (self.state.currentTool.name == 'text') {
                self._map.setView(marker._latlng, marker.textZoomLevel, { animate: false });
                self._map.panBy([200, 150], { animate: false });                
                marker.addTo(self._map)
                newTextImageOverlay.removeFrom(self._map)
                self.toolListeners.textClick(null, marker)
            }
        });

        marker.textImage = newTextImageOverlay
        newTextImageOverlay.removeFrom(self._map)
    },
    cropImageFromCanvas: function(ctx, canvas) {
        var w = canvas.width,
        h = canvas.height,
        pix = { x: [], y: [] },
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
        x, y, index;

        for (y = 0; y < h; y++) {
            for (x = 0; x < w; x++) {
                index = (y * w + x) * 4;
                if (imageData.data[index + 3] > 0) {
                    pix.x.push(x);
                    pix.y.push(y);
                }
            }
        }
        pix.x.sort(function (a, b) {
            return a - b;
        });
        pix.y.sort(function (a, b) {
            return a - b;
        });
        var n = pix.x.length - 1;

        w = pix.x[n] - pix.x[0] + 5;
        h = pix.y[n] - pix.y[0] + 5;

        var cut = ctx.getImageData(pix.x[0] - 3, pix.y[0] - 3, w, h);

        canvas.width = w;
        canvas.height = h;
        ctx.putImageData(cut, 0, 0);

        var image = canvas.toDataURL();
        return image;
    },
    getMousePos: function (e) {
        pos = this._map.mouseEventToLayerPoint(e);
        return {
            x: pos.x,
            y: pos.y,
        };
    },
    generateGUID: function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    },
    initialize: function (options) {
        var self = this
        L.setOptions(this, options)
        this.state = {
            open: false,
            currentTool: null,
            comment: {
                drawing: null,
                text: []
            },
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
            },
            textClick: function(e, prevMarker) {
                var marker, coords, id
                if (e == null) {
                    prevMarker.addTo(self._map)
                    textBox = document.getElementById(prevMarker.textId);
                    textBox.value = prevMarker.textVal
                    textBox.focus();
                    textBox.addEventListener('input', self.toolListeners.inputRenderText);                    
                } else {
                    if (self.state.placeText) {
                        coords = self._map.containerPointToLatLng([e.layerX, e.layerY]);                    
                        var id = self.generateGUID()
                        var myIcon = L.divIcon({
                            className: 'text-comment-div',
                            html: '<textarea id="' + id + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="text-comment-input" rows="6" cols="30" maxlength="130"></textarea>'
                        });
                        marker = L.marker(coords, {
                            icon: myIcon
                        });
                        marker.textId = id;
                        marker.addTo(self._map);
                        self.state.currentMarker = marker
                        self._map.setView(marker._latlng, self._map.getZoom(), { animate: false });
                        self._map.panBy([200, 150], { animate: false });
                        
                        self.state.comment.text.push(marker)
                        textBox = document.getElementById(id);
                        textBox.focus();
                        textBox.addEventListener('input', self.toolListeners.inputRenderText);
                        
                    } else {
                        self.state.currentMarker.removeFrom(self._map)
                        self.state.currentMarker.textImage.addTo(self._map)
                    }      
                }
                self.state.placeText = !self.state.placeText
            },
            inputRenderText: function (e) {
                self.renderText(self.state.currentMarker);
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
            },
            {
                name: 'text',
                init: function() {
                    self.disableMapControls()
                    self.startTextMode(function(canvas) {
                        // add listeners to canvas
                        self.state.placeText = true
                        canvas.addEventListener('click', self.toolListeners.textClick);          
                    })                  
                },
                terminate: function(resolve) {
                    self.enableMapControls()
                    // if tool is switched or panel is closed without saving the text note, it is deleted.
                    self.state.currentMarker.removeFrom(self._map)
                    self.state.currentMarker.deleted = true
                    self.stopTextMode(resolve)
                }
            },            
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

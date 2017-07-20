L.Control.Redliner = L.Control.extend({
    options: {
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
        // spawn a canvas
        this.state.drawingCanvas = L.canvas({ padding: 0 })
        this.state.drawingCanvas.addTo(this._map)
        // add listeners to canvas
        addListeners(this.state.drawingCanvas._container)
    },
    stopDrawingMode: function() {
        // save image from canvas...

        
        // augment old image...

        // remove and destroy drawingCanvas
        this.state.drawingCanvas.removeFrom(this._map)
        this.state.drawingCanvas = null
    },
    drawLine: function (x, y, size, color) {
        var self = this
        //operation properties
        var ctx = self.state.drawingCanvas._ctx
        ctx.globalCompositeOperation = "source-over";

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
            currentTool: null,
            comment: null,
            stroke: null,
            lastX: -1,
            lastY: -1
        }        
        this.toolListeners = {
            redPenDown: function() {
                console.log('pen down')
                self.state.stroke = true
            },
            redPenUp: function() {
                console.log('pen up')
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
            }            
        }
        this.tools = [
            {
                name: 'move',
                init: function() {
                    self.enableMapControls()
                },
                terminate: function() {
                    self.disableMapControls()
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
                terminate: function() {
                    self.enableMapControls()
                    self.stopDrawingMode()                  
                    
                }
            }
        ]
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-redliner  leaflet-control');        
        return container
    },
    newComment: function() {
        this.state.comment = {
            name: 'Comment',
            drawing: {
                dataUrl: null,
                latitude: null,
                longitude: null
            }
        }
    },
    setTool: function(toolName) {
        this.state.currentTool ? this.state.currentTool.terminate() : null
        var tool
        this.tools.forEach(function(eachTool) {
            if (eachTool.name == toolName) {
                tool = eachTool
            }
        })
        tool.init()
        this.state.currentTool = tool
    }
    
});





L.control.redliner = function (options) {
    return new L.Control.Redliner(options);
};

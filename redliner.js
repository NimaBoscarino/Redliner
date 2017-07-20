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
    initialize: function (options) {
        var self = this
        L.setOptions(this, options)
        this.toolListeners = {
            redPenDown: function() {
                self.state.stroke = true
                console.log('REEEEE')
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
                    })                  
                },
                terminate: function() {
                    self.enableMapControls()
                    self.stopDrawingMode()                  
                    
                }
            }
        ];
        this.state = {
            currentTool: null,
            comment: null
        }
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

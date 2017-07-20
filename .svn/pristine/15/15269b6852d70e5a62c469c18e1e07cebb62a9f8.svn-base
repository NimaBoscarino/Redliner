L.Control.hatPanel = L.Control.extend({
	options: {
		position: 'topright',
		autoPan: true,
		initializeOpen: true,
		title: 'Panel Title',
        removeLeafletControlClassOfAddedControls: true
	},	
	initialize: function (options) {
		L.setOptions(this, options);
		
	}, // initialize()
	
	onAdd: function (map) {
		this._map = map;
		
		this._container = L.DomUtil.create('div', 'leaflet-control-hatpanel');
		if (this.options.initializeOpen)
			L.DomUtil.addClass(this._container, 'open');
		else
			L.DomUtil.addClass(this._container, 'closed');

		L.DomEvent.disableClickPropagation(this._container);

		var titleBar = L.DomUtil.create('div', 'leaflet-control-hatpanel-titlebar', this._container);
		var closeButton = this._closeButton = L.DomUtil.create('a', 'close', titleBar);
		
		var titleBarTxt = L.DomUtil.create('div', 'leaflet-control-hatpanel-titlebar-txt', titleBar);
		titleBarTxt.innerHTML = this.options.title;
		
		var panelContent = this._panelContentContainer = L.DomUtil.create('div', 'leaflet-control-hatpanel-panelcontent', this._container);
		
		closeButton.innerHTML = '&times;';
        


		// L.DomEvent.on(closeButton, 'click', this.toggle, this);
        L.DomEvent.on(titleBar, 'click', this.toggle, this);
        // L.DomEvent.on(titleBarTxt, 'click', this.toggle, this);

        
		
		

		return this._container;
	}, // onAdd()
		
	
	isVisible: function () {
        return L.DomUtil.hasClass(this._container, 'open');
    },
	
	
	
	show: function () {
        if (!this.isVisible()) {
            L.DomUtil.addClass(this._container, 'open');
            L.DomUtil.removeClass(this._container, 'closed');
            this._closeButton.innerHTML = '&times;';
            
            if (this.options.autoPan) {
                this._map.panBy([-this.getOffset() / 2, 0], {
                    duration: 0.5
                });
            }
            // this.fire('show');
        }
    },

    hide: function (e) {
        if (this.isVisible()) {
            L.DomUtil.removeClass(this._container, 'open');
            L.DomUtil.addClass(this._container, 'closed');
            this._closeButton.innerHTML = '&laquo;';
            if (this.options.autoPan) {
                this._map.panBy([this.getOffset() / 2, 0], {
                    duration: 0.5
                });
            }

            if (this._queryMapMarker)
            {
                this._map.removeLayer(this._queryMapMarker);
            }

            // this.fire('hide');
        }
        if(e) {
            L.DomEvent.stopPropagation(e);
        }
    },

    toggle: function () {
        if (this.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    },
	getOffset: function () {
        if (this.options.position === 'right') {
            return -this._container.offsetWidth;
        } else {
            return this._container.offsetWidth;
        }
    },
	addControl: function (c) {
		// if the control has a special 'addToHatPanel' function, use that.
		if (c.addToHatPanel)
		{
		    c.addToHatPanel(this, this._panelContentContainer, this._map);
		}
		// -- hack to add a control to this panel, rather than just to the map
		else if (c._map && c._container)
		{	
			this._panelContentContainer.appendChild(c._container);
		}
		// -- if the control hasn't been added to the map, add it and then force it into this panel.
		else if (!c._map)
		{
			c.addTo(this._map);
			this._panelContentContainer.appendChild(c._container);
		}
		
	}
	
}); // extend control
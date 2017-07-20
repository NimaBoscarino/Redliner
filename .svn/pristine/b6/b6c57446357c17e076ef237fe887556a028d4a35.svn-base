$(document).ready(function(){
	
	var bounds = new L.LatLngBounds(new L.LatLng(-85, -200), new L.LatLng(85, 250));
		var map = L.map('map', {
		attributionControl: false,
		maxBounds: bounds,
		maxBoundsViscosity: 0.4,
	}).setView([49.2827, -123.1207], 13);
	// disable double click to zoom
	map.doubleClickZoom.disable();
	map.options.minZoom = 3;
	// NOTE: do not use stamen without API key for production
	var Stamen_Toner = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png'
	}).addTo(map);
	
	var scaleControl = L.control.scale({position: 'topright'});
	var attributionControl = L.control.attribution({position: 'topright'});
	
	var panelLegend = new L.Control.hatPanel({title: 'Legend', autoPan: false, initializeOpen: true }).addTo(map);
	var panelDrawing = new L.Control.hatPanel({title: 'Comments', autoPan: false, initializeOpen: false }).addTo(map);
	
	panelLegend.addControl(scaleControl);
	panelDrawing.addControl(attributionControl);
	
});
function MapFrame(params)  {
	//Init
	var map;
	var markers = [];
	var iws = []; //info windows
	var listeners = [];
	var opacity = 0;
	var strokeOpacityBase = 0.5;

	for (var i= 0; i < params.data.length; i++) {
		map = params.map;
		//console.dir(params.data[i]);
		var ll = new google.maps.LatLng(params.data[i].lat, params.data[i].lng);
		//TODO: abstract the icon and allow it to be set per marker
		var mObj = {
			position: ll,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 4,
				fillColor: "#ff0000",
				fillOpacity: opacity,
				strokeWeight: 1,
				strokeOpacity: strokeOpacityBase * opacity
			},
		};
		if (params.data[i].title) {
			mObj.title = params.data[i].title;
		}
		if (params.data[i].color) {
			mObj.icon.fillColor = params.data[i].color;
		}
		var m = new google.maps.Marker(mObj);
		markers[i] = m;
	}
	setMarkerOpacities();

	if (params.exData != undefined) {
		this.exData = params.exData;
	}


	//Private functions

	function showIW(y) {
		//console.log("showIW " + y);
		//console.dir(markers);
		if (iws[y] === undefined) {
			var iwObj = {
				content: markers[y].title
			};
			if (params.data[y].iwContent) {
				iwObj.content = params.data[y].iwContent;
			}
			var iw = new google.maps.InfoWindow(iwObj);
			iws[y] = iw;
		}
		iws[y].open(map,markers[y]);
	}

	function setMarkerOpacities() {
		for (var i= 0; i < markers.length; i++) {
			var color = markers[i].icon.fillColor;
			var curIcon = markers[i].icon;
			curIcon.fillOpacity = opacity;
			curIcon.strokeOpacity = strokeOpacityBase * opacity;
			markers[i].setIcon(curIcon);
		}
	}


	//Public Functions


	this.draw = function() {
		var callback;
		if (opacity <= 0) {
			return;
		}
		for (var i= 0; i < markers.length; i++) {
			callback = function(i) {
				return function () {
					showIW(i);
				};
			}(i);
			markers[i].setMap(map);
			//google.maps.event.addListener(markers[i], 'click', function() { showIW(i); }); //Y U no work?
			listeners[i] = google.maps.event.addListener(markers[i], 'click', callback);
		}
	}

	this.setOpacity = function(o) {
		opacity = o;
		if (opacity <= 0) {
			opacity = 0;
			this.hide();
			return;
		}
		setMarkerOpacities();
	}

	this.setRelativeOpacity = function(o) {
		this.setOpacity(opacity += o);
	}

	this.hide = function() {
		for (var i= 0; i < markers.length; i++) {
			markers[i].setMap(null)
			google.maps.event.removeListener(listeners[i]);
			listeners[i] = null;
		}
		listeners = [];
	}
}


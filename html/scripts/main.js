var crimeApp;
$(document).ready(function() {
	crimeApp = new CrimeApp();
	crimeApp.init();
});


function CrimeApp() {
	//v0.1.6

	var map, mapManager, callTypes, calls;
	var mapInitDone, sliderReady, wasPlaying, callsLoaded, typesLoaded;
	var firstFrameDate;
	var secPerFrame = 600;

	//Public functions

	this.init = function init() {
		var mapOptions = {
			center: new google.maps.LatLng(43.082, -89.400),
			zoom: 11,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		
		map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
		google.maps.event.addListener(map, 'dragend', onMapDragEnd);

		mapManager = new MapPlayer({
			onFrame: onFrame,
			fps: 6,
			decay: 12,
		});

		$.getJSON("scripts/call_types.json", onLoadCallTypes);
		$.getJSON("scripts/calls.json", onLoadCalls);
	}

	//Private functions

	function roundMinutesDown(time) {
		var tDate = new Date(time);
		var minutes = tDate.getMinutes();
		var minutes = minutes - (minutes % (secPerFrame / 60));
		tDate.setMinutes(minutes);
		return tDate;
	}

	function formatTime(time) {
		var fDate = new Date(time);
		var niceDateText;
		var hours, hourLabel, minutes;

		hours = fDate.getHours();
		if (hours < 12) {
			hourLabel = "am";
		} else {
			hourLabel = "pm";
			hours -= 12;
		}
		if (hours == 0) {
			hours = 12;
		}

		minutes = fDate.getMinutes();
		if (minutes.toString().length == 1) {
			minutes = "0" + minutes;
		}

		niceDateText = fDate.toDateString() + ", "; 
		niceDateText += hours + ":" + minutes + hourLabel;

		return niceDateText;
	}

	function onLoadComplete() {
		//Don't turn on the UI until ajax is done.
		if (!(typesLoaded && callsLoaded)) {
			return;
		}

		//Create frames based on data
		var i, //each frame
			j, //each call per frame
			f; //new frame object
		for (i = 0; i < calls.length; i++) {
			for (j = 0; j < calls[i]['data'].length; j++) {
				calls[i]['data'][j].color = callTypes[calls[i]['data'][j]['it']].color;
				calls[i]['data'][j].iwContent = 
					calls[i]['data'][j]['title'] + "<br/>" + 
					"#" + calls[i]['data'][j]['in'] + "<br/>" +
					callTypes[calls[i]['data'][j]['it']].title;
			}
			f = new MapFrame({
				exData: { title: calls[i]['t'] },
				map: map,
				data: calls[i]['data']
			});
			mapManager.pushFrame(f);
		}
		mapManager.draw();

		firstFrameDate = roundMinutesDown(calls[0]['data'][0]['d']);

		$("#slider").on("slidecreate", function() {
			sliderReady = true;
		});
		$("#slider").on("slidestart", function() {
			wasPlaying = mapManager.isPlaying();
			mapManager.pause();
		});
		$("#slider").on("slide", function(event, ui) {
			var seekTime = firstFrameDate.getTime();
			seekTime += (secPerFrame * ui.value * 1000);
			$("#curTime").text(formatTime(seekTime));
		});
		$("#slider").on("slidestop", function(event, ui) {
			jump(ui.value);
			if (wasPlaying) {
				mapManager.play();
			}
		});
		$("#slider").slider({
			min: 0,
			max: mapManager.numFrames(),
		});

		$("#playToggle").click(btnTogglePlay);
		$("#playToggle").removeAttr("disabled");
		$("#nextFrame").click(btnNextFrame);
		$("#nextFrame").removeAttr("disabled");
		//$("#speedUp").on("click", btnSpeedUp);
		//$("#speedDown").on("click", btnSpeedDown);

		$("#btnLegend").click(btnLegend);
		$("#btnInfo").click(btnInfo);
		$("#btnSearch").click(btnSearch);
		$("#btnContact").click(btnContact);

		setTimeout(function() {$("#loading").fadeOut(300);}, 1000); //allow 1s for map draw
	}

	function onLoadCallTypes(data) {
		callTypes = data;
		typesLoaded = true;
		onLoadComplete();
	}

	function onLoadCalls(data) {
		calls = data;
		callsLoaded = true;
		onLoadComplete();
	}

	function onMapDragEnd() {
		//console.log(map.getCenter().toString());
	}

	function onFrame(infos) {
		//$("#curTime").text(formatTime(infos.exData.title) + " (" + infos.index + "/" + infos.count + ")");
		$("#curTime").text(formatTime(infos.exData.title));
		$("#tod").tod({date: String(infos.exData.title)});
		if (sliderReady === true) {
			$("#slider").slider("option", "value", infos.index);
		}
	}

	function jump(i) {
		mapManager.jump(i);
		mapManager.draw();
	}

	function btnLegend() {
		//mapManager.pause();
		$("#legendDialog").dialog({
			title: "Legend",
			//modal: true,
			width: 500,
			resizable: false,
		});
	}

	function btnInfo() {
		mapManager.pause();
		$("#infoDialog").dialog({
			title: "Info",
			modal: true,
			width: 500,
			resizable: false,
		});
	}

	function btnSearch() {
		mapManager.pause();
		$("#searchDialog").dialog({
			title: "Search",
			modal: true,
			width: 500,
			resizable: false,
		});
	}

	function btnContact() {
		mapManager.pause();
		$("#contactDialog").dialog({
			title: "Contact",
			modal: true,
			width: 500,
			resizable: false,
		});
	}

	function btnNextFrame() {
		console.log("main.nextFrame()");
		mapManager.drawNext();
	}

	function btnTogglePlay() {
		mapManager.togglePlay();
		if (mapManager.isPlaying()) {
			$("#playToggle").val("Pause");
			$("#nextFrame").attr("disabled","disabled");
		} else {
			$("#playToggle").val("Play");
			$("#nextFrame").removeAttr("disabled");
		}

	}

	function btnSpeedUp() {
		//TODO
		console.log("speed up");
	}
	
	function btnSpeedDown() {
		//TODO
		console.log("speed down");
	}
}



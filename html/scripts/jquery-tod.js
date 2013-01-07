(function($) {
	/*
		note: 'this' in the jquery plugin context refers to the dom node we were invoked on.
		For that reason, you should return 'this' to maintain chainability.

		XXX TODO BUG ETC: This is ultra Q&D!  I intend to flesh this out into a real plugin
		after this project.  Much thanks to http://wesnoth.org/ for hours of fun and for
		lending me these images.  Everything here is GPLv3!
	*/
	var methods = {
		init: function(options) {
			return this.each(function() {
				var $this = $(this),
					data = $(this).data('tod');

				if (options !== undefined && options['date']) {
					//console.log("tod init with " + options['date']);
					var oDate = new Date(options['date']);
				} else {
					//console.log("tod init with now()");
					var oDate = new Date();
				}

				var img = oDate.getHours();
				//console.log("tod hours is " + img);
				img = "images/tod/" + img + ".png";

				if (! data) {
					//init tod on a new dom element
					//console.log("not data");
					$(this).data('tod', {
						tod_set: true,
						options: options,
						img: img
					});
					$(this).html("<img id=\"jquery-tod-img\"src=\"" + img + "\" style=\"width:135px;height:39px\"/>");
				} else if (data.img != img) {
					//XXX why am I doing this with data instead of attr?
					//console.log("!= img");
					data.img = img;
					$(this).data('tod', data);
					$("#jquery-tod-img").attr("src", img)
				}

			});
		},
		setTime: function(newTime) { //XXX do not use! blah data.tod.blah
			console.log("setTime here: " + newTime);
			return this.each(function() {
				var data = $(this).data('tod');
				if (! data || data.tod === undefined) {
					//XXX should do more here
					//$.error("tod.setTime() on a non-tod object!");
				}

				var oDate = new Date(newTime);
				var img = oDate.getHours();
				img = "images/tod/" + img + ".png";
				$(this).html("<img src=\"" + img + "\"/>");
			});
		}
	};

	$.fn.tod = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on tod.');
		}
	};
})(jQuery);

/*

framework.js

TODO: zamienić .images na .resourcesToLoad (img, txt, ...)

*/

define(['jquery', 'jquery-mousewheel'], function($){
	return function(wrapper){
		console.assert(typeof wrapper === "object");

		wrapper.images = wrapper.images || [];
		wrapper.fullscreen = wrapper.fullscreen || false;

		wrapper.onUpdate = wrapper.onUpdate || function(){};
		wrapper.onRender = wrapper.onRender || function(){};

		wrapper.onMouseEnter = wrapper.onMouseEnter || function(){};
		wrapper.onMouseLeave = wrapper.onMouseLeave || function(){};
		wrapper.onMouseMove = wrapper.onMouseMove || function(){};
		wrapper.onMouseDown = wrapper.onMouseDown || function(){};
		wrapper.onMouseUp = wrapper.onMouseUp || function(){};
		wrapper.onMouseWheel = wrapper.onMouseWheel || function(){};

		// ~~~

		this._ = wrapper;

		// ~~~

		var loadedImages = {};
		var loadedImagesCount = 0;

		this.canvas = $("#canvas3d");

		var context = $(this.canvas)[0].getContext("2d");

		if(wrapper.fullscreen){
			context.canvas.width = parseInt($("body").width());
			context.canvas.height = parseInt(window.innerHeight);
		}

		$(window).resize(function(){
			context.canvas.width = parseInt($("body").width());
			context.canvas.height = parseInt(window.innerHeight);
		});

		var oldTime = (new Date()).getTime();
		var newTime = 0;
		var delta = 0;

		var X = 0;
		var Y = 0;

		$(this.canvas).mouseenter($.proxy(wrapper.onMouseEnter, wrapper));
		$(this.canvas).mouseleave($.proxy(wrapper.onMouseLeave, wrapper));
		
		$(this.canvas).mousemove($.proxy(function(e){
			X = e.pageX - $(this.canvas).offset().left;
			Y = e.pageY - $(this.canvas).offset().top;

			wrapper.onMouseMove.call(wrapper, X, Y);
		}, this));
		
		$(this.canvas).mousedown(function(){ wrapper.onMouseDown.call(wrapper, X, Y); });
		$(this.canvas).mouseup(function(){ wrapper.onMouseUp.call(wrapper, X, Y); });
		$(this.canvas).mousewheel(function(e){ wrapper.onMouseWheel.call(wrapper, e.deltaY); });

		this.step = $.proxy(function(){
			newTime = (new Date()).getTime();
			delta = (newTime - oldTime) / 1000;

			wrapper.onUpdate(delta);
			wrapper.onRender(delta, context, loadedImages);

			requestAnimationFrame(this.step);

			oldTime = newTime;
		}, this);

		this.start = function(){
			console.log('starting loading requested ' + wrapper.images.length + ' image(s)');

			for(var i = 0; i < wrapper.images.length; i++){
				var name = wrapper.images[i];

				loadedImages[name] = new Image();

				loadedImages[name].onload = $.proxy(function(){
					loadedImagesCount++;
					if(loadedImagesCount >= wrapper.images.length){
						console.log('...done loading images, lauching game');
						// console.clear();

						oldTime = (new Date()).getTime();
						requestAnimationFrame(this.step);
					}
				}, this);

				loadedImages[name].src = "imgs/" + name + ".png";
			}
		};
	};
});
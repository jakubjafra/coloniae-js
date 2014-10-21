/*

framework.js

*/

define(['jquery', 'jquery-mousewheel'], function($){
	function initFpsCounter(){
		var stats = new Stats();
		stats.setMode(0); // 0: fps, 1: ms

		// Align top-left
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.right = '0px';
		stats.domElement.style.bottom = '100px';

		$("#on_canvas").append(stats.domElement);

		return stats;
	}

	return function(wrapper){
		console.assert(typeof wrapper === "object");

		wrapper.resources = wrapper.resources || [];
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

		this.stats = initFpsCounter();

		// ~~~

		var loadedResources = {};
		var loadedResourcesCount = 0;

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

			this.stats.begin();

			wrapper.onUpdate(delta);
			wrapper.onRender(delta, context, loadedResources);

			this.stats.end();

			oldTime = newTime;

			requestAnimationFrame(this.step);
		}, this);

		this.start = function(){
			console.log('starting loading requested ' + wrapper.resources.length + ' image(s)');

			for(var i = 0; i < wrapper.resources.length; i++){
				var name = wrapper.resources[i];

				loadedResources[name] = new Image(); // TODO: Uwolnić resources od bycia stricte Image.

				loadedResources[name].onload = $.proxy(function(){
					loadedResourcesCount++;
					if(loadedResourcesCount >= wrapper.resources.length){
						console.log('...done loading images, lauching game');

						oldTime = (new Date()).getTime();
						requestAnimationFrame(this.step);
					}
				}, this);

				loadedResources[name].src = "imgs/" + name + ".png";
			}
		};
	};
});
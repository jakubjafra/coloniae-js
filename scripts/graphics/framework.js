/*

framework.js

*/

define(['jquery', 'three-stats', 'jquery-mousewheel'], function($, Stats){
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
		wrapper.loadedResources = {};

		wrapper.fullscreen = wrapper.fullscreen || false;

		wrapper.onUpdate = wrapper.onUpdate || function(){};
		wrapper.onRender = wrapper.onRender || function(){};
		wrapper.onLoadResources = wrapper.onLoadResources || function(){};

		wrapper.onKeyDown = wrapper.onKeyDown || function(){};
		wrapper.onKeyUp = wrapper.onKeyUp || function(){};

		wrapper.onMouseEnter = wrapper.onMouseEnter || function(){};
		wrapper.onMouseLeave = wrapper.onMouseLeave || function(){};
		wrapper.onMouseMove = wrapper.onMouseMove || function(){};
		wrapper.onMouseDown = wrapper.onMouseDown || function(){};
		wrapper.onMouseUp = wrapper.onMouseUp || function(){};
		wrapper.onMouseWheel = wrapper.onMouseWheel || function(){};

		wrapper.onMouseClick = wrapper.onMouseClick || function(){};

		// ~~~

		this._ = wrapper;

		this.stats = initFpsCounter();

		// ~~~

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

		var wasMouseCursorMovedSinceMouseDown = false;
		var lastMouseDown = 0;

		$("body").keydown(function(e){ wrapper.onKeyDown.call(wrapper, e.which); });
		$("body").keyup(function(e){ wrapper.onKeyUp.call(wrapper, e.which); });

		$(this.canvas).mouseenter($.proxy(wrapper.onMouseEnter, wrapper));
		$(this.canvas).mouseleave($.proxy(wrapper.onMouseLeave, wrapper));
		
		$(this.canvas).mousemove($.proxy(function(e){
			console.log(e.target);

			X = e.pageX - $(this.canvas).offset().left;
			Y = e.pageY - $(this.canvas).offset().top;

			wasMouseCursorMovedSinceMouseDown = true;

			wrapper.onMouseMove.call(wrapper, X, Y);
		}, this));
		
		$(this.canvas).mousedown(function(){
			wasMouseCursorMovedSinceMouseDown = false;
			lastMouseDown = (new Date()).getTime();

			wrapper.onMouseDown.call(wrapper, X, Y);
		});
		
		$(this.canvas).mouseup(function(){
			wrapper.onMouseUp.call(wrapper, X, Y);

			if(!wasMouseCursorMovedSinceMouseDown || ((new Date()).getTime() - lastMouseDown) < 200)
				wrapper.onMouseClick.call(wrapper, X, Y);
		});

		$(this.canvas).mousewheel(function(e){ wrapper.onMouseWheel.call(wrapper, e.deltaY); });

		this.step = $.proxy(function(){
			newTime = (new Date()).getTime();
			delta = (newTime - oldTime) / 1000;

			this.stats.begin();

			wrapper.onUpdate(delta);
			wrapper.onRender(delta, context, wrapper.loadedResources);

			this.stats.end();

			oldTime = newTime;

			requestAnimationFrame(this.step);
		}, this);

		this.start = function(){
			console.log('starting loading requested ' + wrapper.resources.length + ' image(s)');

			for(var i = 0; i < wrapper.resources.length; i++){
				var name = wrapper.resources[i];

				wrapper.loadedResources[name] = new Image(); // TODO: Uwolnić resources od bycia stricte Image.

				wrapper.loadedResources[name].onload = $.proxy(function(){
					loadedResourcesCount++;
					if(loadedResourcesCount >= wrapper.resources.length){
						console.log('...done loading images, lauching game');

						wrapper.onLoadResources(wrapper.loadedResources);

						oldTime = (new Date()).getTime();
						requestAnimationFrame(this.step);
					}
				}, this);

				wrapper.loadedResources[name].src = "imgs/" + name + ".png";
			}
		};
	};
});
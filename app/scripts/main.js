/*

main.js

*/


require.config({
	baseUrl: 'scripts',

	paths: {
		'jquery': '../externals/jquery-2.1.1.min',
		'jquery-mousewheel': '../externals/jquery.mousewheel.min',
		'extend': '../externals/extend',
		'three': '../externals/three.min',
		'three-stats': '../externals/stats.min',
		'underscore': '../externals/underscore-min',
		'angular': '../externals/angular.min',
		'text': '../externals/text'
	},

	shim: {
		'jquery-mousewheel': {
			deps: [ 'jquery' ],
			exports: 'jQuery.mousewheel'
		},

		'three': {
			exports: 'THREE'
		},

		'three-stats': {
			exports: 'Stats'
		},

		'underscore': {
			exports: '_'
		},

		'angular': {
			exports: 'angular'
		}
	}
});

console.log('loading dependencies');

require([	'jquery',
			'jquery-mousewheel',
			'extend',
			'underscore',
			'./logic',
			'./graphics',
			'./graphics/gui/gui'
		],
		function(
			$,
			_a,
			_b,
			_,
			Logic,
			Graphics,
			Gui
		){
			$("head").append('<script src="scripts/logic/tile.js"></script>');
			$("head").append('<script src="scripts/logic/algorithms.js"></script>');
			$("head").append('<script src="scripts/logic/product.js"></script>');
			$("head").append('<script src="scripts/logic/storage.js"></script>');
			$("head").append('<script src="scripts/logic/country.js"></script>');
			$("head").append('<script src="scripts/logic/island.js"></script>');
			$("head").append('<script src="scripts/logic/map.js"></script>');
			$("head").append('<script src="scripts/logic/militaryUnit.js"></script>');
			$("head").append('<script src="scripts/logic/ship.js"></script>');
			$("head").append('<script src="scripts/logic/structure.js"></script>');
			$("head").append('<script src="scripts/logic/building.js"></script>');
			$("head").append('<script src="scripts/logic/publicBuilding.js"></script>');
			$("head").append('<script src="scripts/logic/houseGroup.js"></script>');
			$("head").append('<script src="scripts/logic/storageBuilding.js"></script>');
			$("head").append('<script src="scripts/logic/productionBuilding.js"></script>');
			$("head").append('<script src="scripts/logic/civilianUnit.js"></script>');
			$("head").append('<script src="scripts/logic/gameDefinitions.js"></script>');

			// ~~~

			// bindowanie wyświetlania logów konsoli na ekran,
			// może być pomocne tymczasowo
			var originalConsoleLog = console.log;
			console.log = function(msg, show){
				originalConsoleLog.apply(console, arguments);

				if(show !== false){
					var newElement = document.createElement("div");
					newElement.appendChild(document.createTextNode(msg));

					setTimeout(function(){
						$(newElement).parent().find('br').eq(0).remove();
						$(newElement).remove();
					}, 1000);

					$("#console").append(newElement).append("<br>");
				}
			};

			// ~~~

			// inicjalzacja planszy, etc. -- tymczasowe
			Logic.init();

			/*
			islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(FOOD_ID), 1000); // tymczasowe
			islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(CLOTH_ID), 1000); // tymczasowe
			islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(LIQUOR_ID), 1000); // tymczasowe
			*/

			// uruchomienie gry
			Graphics.start();
			Gui.start();
});

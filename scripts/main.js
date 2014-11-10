/*

main.js

*/


require.config({
	baseUrl: 'scripts',

	paths: {
		'jquery': '../__externals/jquery-2.1.1.min',
		'jquery-mousewheel': '../__externals/jquery.mousewheel.min',
		'extend': '../__externals/extend',
		'three': '../__externals/three.min',
		'three-stats': '../__externals/stats.min',
		'underscore': '../__externals/underscore-min',
		'angular': '../__externals/angular.min',
		'text': '../__externals/text'
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

require([	'jquery', 'jquery-mousewheel', 'extend', 'underscore',					// externals libs
			'./logic', './graphics', './graphics/gui/gui'								// local files
		],	function($, _a, _b, _, Logic, Graphics, Gui){
			// ZA CHUJA nie wiem czemu to się nie chce ładować w tej kolejności
			// kiedy ładuję przez Require. Popierdolone to jest. Tak działa. LOL.
			// Rozwiązaniem jest podzielenie tego na prawidłowe moduły Require,
			// ale mi się kurwa nie chce.
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
			$("head").append('<script src="scripts/logic/houseGroup.js"></script>');
			$("head").append('<script src="scripts/logic/storageBuilding.js"></script>');
			$("head").append('<script src="scripts/logic/productionBuilding.js"></script>');
			$("head").append('<script src="scripts/logic/civilianUnit.js"></script>');
			$("head").append('<script src="scripts/logic/gameDefinitions.js"></script>');

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
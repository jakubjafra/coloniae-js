/*

logic.js

*/

define(['jquery', 'underscore', 'extend',
		// wczytanie logiki:
		'./logic/tile',
		'./logic/algorithms',
		'./logic/product',
		'./logic/storage',
		'./logic/country',
		'./logic/island',
		'./logic/map',
		'./logic/ship',
		'./logic/structure',
		'./logic/building',
		'./logic/houseGroup',
		'./logic/storageBuilding',
		'./logic/productionBuilding',
		'./logic/civilianUnit',
		'./logic/gameDefinitions'
		],
	function(){
		return {
			// tymczasowe tworzenie planszy:
			init: function(){
				console.log("creating map, sample buildings, etc.");

				createMap(40, 50);

				var mainIsland = new Island();

				var playerCountry = new Country();
				playerCountry.type = PLAYER_COUNTRY;

				var ship = new Ship();

				ship.setPosition(tiles.coords(19, 0));
				// ship.moveTo(tiles.coords(19, 1));

				playerCountry.coins = 10000; // tymczasowe

				tiles[19][4].countryId = 0;
				var port = new Port(19, 4, countries[0], true);
				
				islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(TOOLS_ID), 100); // tymczasowe
				islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(WOOD_ID), 100); // tymczasowe
				// islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(BRICKS_ID), 1000); // tymczasowe

				/*
				new Road(19, 4, countries[0]);

				// new Harbor(19, 1, countries[0]);

				new Marketplace(21, 13, countries[0]);
				new Marketplace(10, 8, countries[0]);
				new Marketplace(31, 8, countries[0]);

				new Quarry(11, 15, countries[0], undefined, WEST);
				new IronMine(11, 13, countries[0], undefined, WEST);
				
				for(var i = 0; i < 6; i++)
					new Road((19-6) + i, 4, countries[0]);

				for(var i = 0; i < 6; i++)
					new Road(20 + i, 4, countries[0]);

				for(var i = 0; i < 6; i++)
					new Road(19, 5 + i, countries[0]);

				// new Road(20, 12, countries[0]);

				for(var i = 0; i < 6; i++)
					new Road((19-6) + i, 11, countries[0]);

				for(var i = 0; i < 6; i++)
					new Road(20 + i, 11, countries[0]);

				for(var i = 0; i < 7; i++)
					new Road(19, 11 + i, countries[0]);

				for(var i = 0; i < 16; i++)
					new Road(12, 2 + i, countries[0]);

				for(var i = 0; i < 6; i++)
					new Road(6 + i, 4, countries[0]);

				for(var i = 0; i < 6; i++)
					new Road(6 + i, 11, countries[0]);

				for(var i = 0; i < 16; i++)
					new Road(26, 2 + i, countries[0]);

				for(var i = 0; i < 6; i++)
					new Road(27 + i, 4, countries[0]);

				for(var i = 0; i < 6; i++)
					new Road(27 + i, 11, countries[0]);
				*/
			}
		};
});
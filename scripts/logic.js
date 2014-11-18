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
		'./logic/militaryUnit',
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
		
		HARD_UPDATE_INTERVAL = 1.0;

		function updateForAllNotUndefined(object, updateFuncName, param){
			for(var i = 0; i < object.length; i++)
				if(object[i] != undefined)
					object[i][updateFuncName].call(object[i], param);
		}

		var hardUpdateCount = 0.0;

		return {
			timeFlowSpeed: 4,

			update: function(delta){
				// Kolejność update'ów JEST WAŻNA (islands musi być pierwsze).

				hardUpdateCount += delta;

				for(; hardUpdateCount >= HARD_UPDATE_INTERVAL; hardUpdateCount -= HARD_UPDATE_INTERVAL){
					var gameTimeDelta = HARD_UPDATE_INTERVAL * this.timeFlowSpeed; 
					
					updateForAllNotUndefined(islands, 'hardUpdate', gameTimeDelta);
					updateForAllNotUndefined(structures, 'hardUpdate', gameTimeDelta);
					updateForAllNotUndefined(civilianUnits, 'hardUpdate', gameTimeDelta);
					updateForAllNotUndefined(militaryUnits, 'hardUpdate', gameTimeDelta);
				}

				var gameTimeDelta = delta * this.timeFlowSpeed;

				updateForAllNotUndefined(islands, 'softUpdate', gameTimeDelta);
				updateForAllNotUndefined(structures, 'softUpdate', gameTimeDelta);
				updateForAllNotUndefined(civilianUnits, 'softUpdate', gameTimeDelta);
				updateForAllNotUndefined(militaryUnits, 'softUpdate', gameTimeDelta);
			},

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
				ship.countryId = playerCountry.id;

				playerCountry.coins = 10000; // tymczasowe

				tiles[19][4].countryId = 0;
				var port = new Port(19, 4, countries[0], true);
				
				islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(TOOLS_ID), 100); // tymczasowe
				islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(WOOD_ID), 100); // tymczasowe
				islands[0].mainMarketplaces[0].storage.add(islands[0].mainMarketplaces[0].storage.special(FOOD_ID), 5); // tymczasowe

				// new House(19, 7, countries[0]);

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
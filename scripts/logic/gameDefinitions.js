/*

logic/gameDefinitions.js

*/

// tile.js

// ~~~

// product.js

// *** raw ***
WOOL_ID = 		(new Product("Wool")).id;
CATTLE_ID = 	(new Product("Cattle")).id;
GRAIN_ID = 		(new Product("Grain")).id;
FLOUR_ID = 		(new Product("Flour")).id;
COCOA_ID = 		(new Product("Cocoa")).id;
SUGARCANE_ID = 	(new Product("Sugarcane")).id;
SPICE_ID = 		(new Product("Spice")).id;
TOBACCO_ID = 	(new Product("Tobacco")).id;
WOOD_ID = 		(new Product("Wood")).id;
ORE_ID = 		(new Product("Ore")).id;
IRON_ID = 		(new Product("Iron")).id;
BRICKS_ID = 	(new Product("Bricks")).id;
GOLD_ID = 		(new Product("Gold")).id;

// *** products ***
FOOD_ID = 				(new Product("Food")).id;
CLOTH_ID = 				(new Product("Cloth")).id;
LIQUOR_ID = 			(new Product("Liquor")).id;
TOBACCO_PRODUCTS_ID = 	(new Product("Tobacco products")).id;
TOOLS_ID = 				(new Product("Tools")).id;
JEWLERY_ID =			(new Product("Jewlery")).id;
CLOTHES_ID = 			(new Product("Clothes")).id;

goods = [
	FOOD_ID,
	CLOTH_ID,
	LIQUOR_ID,
	SPICE_ID,
	TOBACCO_PRODUCTS_ID,
	COCOA_ID,
	CLOTHES_ID,
	JEWLERY_ID
];

// storage.js

// ~~~

// country.js

// ~~~

// island.js

// ~~~

// structure.js

var tilesFertility = {}; // tile_index -> fertility array (based on tile.island.fertility)

function getFertilityFor(coords, plant){
	if(	tilesFertility[tiles.index(coords)] != undefined &&
		tilesFertility[tiles.index(coords)][plant.structName] != undefined)
		return tilesFertility[tiles.index(coords)][plant.structName];
	else {
		var tile = tiles.at(coords);

		console.assert(tile.islandId != INVALID_ID);

		var fertility = islands[tile.islandId].fertility[plant.structName] || 1;
		var calcFerility = (Math.random() <= fertility);

		if(tilesFertility[tiles.index(coords)] == undefined)
			tilesFertility[tiles.index(coords)] = {};

		tilesFertility[tiles.index(coords)][plant.structName] = calcFerility;
		
		return calcFerility;
	}
}

var FieldPlant = Structure.extend(function(){
	this.requiredResources = makeRequiredResources(5);

	this.isWithered = false; // czy dane pole jest uschnięte

	this.onBuild = function(){
		if(this.isGhost)
			return;

		this.isWithered = !getFertilityFor(this.centerTile().index, this);
	};
});

var TreeFld = buildable("Tree field", FieldPlant.extend(function(){}));

var GrainFld = buildable("Grain field", FieldPlant.extend(function(){}));

var CocoaFld = buildable("Cocoa field", FieldPlant.extend(function(){}));

var SugarcaneFld = buildable("Sugarcane field", FieldPlant.extend(function(){}));

var WineFld = buildable("Wine field", FieldPlant.extend(function(){}));

var SpiceFld = buildable("Spice field", FieldPlant.extend(function(){}));

var TobaccoFld = buildable("Tobacco field", FieldPlant.extend(function(){}));

var CottonFld = buildable("Cotton field", FieldPlant.extend(function(){}));

var Quarry = buildable("Quarry", Structure.extend(function(){
	this.requiredResources = makeRequiredResources(150, 2, undefined, 6);

	this.possibleRotation = [ NORTH, WEST ];

	this.width = 2;
	this.height = 1;

	this.makeRequiredTerrainMap = function(){
		this.createPlainTerrainMap(2, 2);

		this.requiredTerrainMap[0][0] = 3;
		this.requiredTerrainMap[1][0] = 3;
	};
}));

// ~~~

// zastanawiam się nad stworzeniem managera...

// building.js

var roads = [];

var Road = buildable("Road", Building.extend(function(){
	this.requiredResources = makeRequiredResources(5);

	this.width = 1;
	this.height = 1;

	this.onBuild = function(){
		roads.push(tiles.index(this.tilesUnder[0]));
	};

	this.onRemove = function(){
		for(var i = 0; i < roads.length; i++)
			if(roads[i] == tiles.index(this.tilesUnder[0]))
				delete roads[i];
	};
}));

var Harbor = buildable("Harbor", Road.extend(function(){
	this.requiredResources = makeRequiredResources(5, undefined, 2);

	this.makeRequiredTerrainMap = function(){
		this.createPlainTerrainMap();

		this.requiredTerrainMap[0][0] = 1;
	}
}));

// ~~~

// houseGroup.js

var PionersHouseGroup = HouseGroup.extend(function(){
	// grupa ta pojawia się automatycznie po wybudowaniu domu, nie ma wymaganych surowców
	this.requiredResources = {};

	this.type = PIONERS;
	this.name = "Pioners";

	this.peopleNeededToLevelUp = 2;

	this.baseIncome = 2;

	this.constructor = function(island, country){
		this.super(island, country);

		this.consumption[FOOD_ID] = (1.18750 / 60);
		this.consumption[CLOTH_ID] = true;
		this.consumption[LIQUOR_ID] = true;

		this.calcConsumptionCount();

		this.step[FOOD_ID] = 1;
	}
});

var SettlersHouseGroup = HouseGroup.extend(function(){
	this.requiredResources = makeRequiredResources(undefined, 3, undefined, 1,
		makeBonusResources(CLOTH_ID, 1, LIQUOR_ID, 1));
	this.baseIncome = Math.pow(2, (this.type + 1));

	this.type = SETTLERS;
	this.name = "Settlers";

	this.peopleNeededToLevelUp = 6;

	this.baseIncome = 4;

	this.constructor = function(island, country){
		this.super(island, country);

		this.consumption[FOOD_ID] = (1.18750 / 60);
		this.consumption[CLOTH_ID] = (0.56250 / 60);
		this.consumption[LIQUOR_ID] = (0.43750 / 60);
		this.consumption[SPICE_ID] = true;
		this.consumption[TOBACCO_PRODUCTS_ID] = true;

		this.calcConsumptionCount();

		this.step[FOOD_ID] = 1;
		this.step[CLOTH_ID] = 1;
		this.step[LIQUOR_ID] = 1;
	}
});

var CitizensHouseGroup = HouseGroup.extend(function(){
	this.requiredResources = makeRequiredResources(undefined, 2, 6, 1,
		makeBonusResources(SPICE_ID, 1, TOBACCO_PRODUCTS_ID, 1));

	this.type = CITIZENS;
	this.name = "Citizens";

	this.peopleNeededToLevelUp = 15;

	this.baseIncome = 8;

	this.constructor = function(island, country){
		this.super(island, country);

		this.consumption[FOOD_ID] = (1.18750 / 60);
		this.consumption[CLOTH_ID] = (0.62500 / 60);
		this.consumption[LIQUOR_ID] = (0.56250 / 60);
		this.consumption[SPICE_ID] = (0.43750 / 60);
		this.consumption[TOBACCO_PRODUCTS_ID] = (0.43750 / 60);
		this.consumption[COCOA_ID] = true;

		this.calcConsumptionCount();

		this.step[FOOD_ID] = 1;
		this.step[CLOTH_ID] = 1;
		this.step[LIQUOR_ID] = 1;
		this.step[SPICE_ID] = 1;
		this.step[TOBACCO_PRODUCTS_ID] = 1;
	}
});

var MerchantsHouseGroup = HouseGroup.extend(function(){
	this.requiredResources = makeRequiredResources(undefined, 3, 9, 3,
		makeBonusResources(COCOA_ID, 1));

	this.type = MERCHANTS;
	this.name = "Merchants";

	this.peopleNeededToLevelUp = 25;

	this.baseIncome = 16;

	this.constructor = function(island, country){
		this.super(island, country);

		this.consumption[FOOD_ID] = (1.18750 / 60);
		this.consumption[CLOTH_ID] = (0.68750 / 60);
		this.consumption[LIQUOR_ID] = (0.62500 / 60);
		this.consumption[SPICE_ID] = (0.56250 / 60);
		this.consumption[TOBACCO_PRODUCTS_ID] = (0.56250 / 60);
		this.consumption[COCOA_ID] = (0.62500 / 60);
		this.consumption[CLOTHES_ID] = true;
		this.consumption[JEWLERY_ID] = true;

		this.calcConsumptionCount();

		this.step[FOOD_ID] = 1;
		this.step[CLOTH_ID] = 1;
		this.step[LIQUOR_ID] = 1;
		this.step[SPICE_ID] = 1;
		this.step[TOBACCO_PRODUCTS_ID] = 1;
		this.step[COCOA_ID] = 1;
	}
});

var AristocratsHouseGroup = HouseGroup.extend(function(){
	this.requiredResources = makeRequiredResources(undefined, 3, 12, 3,
		makeBonusResources(CLOTHES_ID, 1, JEWLERY_ID, 1));

	this.type = ARISTOCRATS;
	this.name = "Aristocrats";

	this.peopleNeededToLevelUp = 40;

	this.baseIncome = 32;

	this.constructor = function(island, country){
		this.super(island, country);

		this.consumption[FOOD_ID] = (1.18750 / 60);
		this.consumption[LIQUOR_ID] = (0.68750 / 60);
		this.consumption[SPICE_ID] = (0.56250 / 60);
		this.consumption[TOBACCO_PRODUCTS_ID] = (0.56250 / 60);
		this.consumption[COCOA_ID] = (0.56250 / 60);
		this.consumption[CLOTHES_ID] = (0.43750 / 60);
		this.consumption[JEWLERY_ID] = (0.12500 / 60);

		this.calcConsumptionCount();

		this.step[FOOD_ID] = 1;
		this.step[LIQUOR_ID] = 1;
		this.step[SPICE_ID] = 1;
		this.step[TOBACCO_PRODUCTS_ID] = 1;
		this.step[COCOA_ID] = 1;
		this.step[CLOTHES_ID] = 1;
		this.step[JEWLERY_ID] = 1;
	};

	this.canUpgrade = function(house){
		return false;
	};
});

var House = buildable("House", Building.extend(function(){
	this.requiredResources = makeRequiredResources(undefined, 3);

	this.width = 2;
	this.height = 2;

	this.people = 1;
	this.type = PIONERS;

	this.onBuild = function(){
		if(this.isGhost)
			return;

		this.super.onBuild();

		var island = islands[this.centerTile().islandId];
		var country = countries[this.centerTile().countryId];

		if(island.houseGroups[country.id] == undefined){
			island.houseGroups[country.id] = [
				new PionersHouseGroup(island, country),
				new SettlersHouseGroup(island, country),
				new CitizensHouseGroup(island, country),
				new MerchantsHouseGroup(island, country),
				new AristocratsHouseGroup(island, country)
			];
		}
		
		island.houseGroups[country.id][this.type].addHouse(this);
	};

	this.onRemove = function(){
		this.super.onRemove();

		var island = islands[this.centerTile().islandId];
		var country = countries[this.centerTile().countryId];

		island.houseGroups[country.id][this.type].removeHouse(this);
	};
}));

// ~~~

// storageBuilding.js

var Marketplace = buildable("Marketplace", StorageBuilding.extend(function(){
	this.requiredResources = makeRequiredResources(200, 10, undefined, 4);
	this.operatingCost = makeOperatingCost(10);

	this.width = 3;
	this.height = 4;

	this.sourcesRadius = 11;

	this.chooseFilter_portersArray = [];

	this.porters = [ new Porter(this), new Porter(this) ];
	this.minSourceQuantity = 10;

	this.sourcesFilter = function(building){
		return (building instanceof StorageBuilding) && !(building instanceof Marketplace);
	};

	this.onBuild = function(){
		if(this.isGhost)
			return;

		this.super.onBuild();
		
		// marketplacy rozciągają władzę tego państwa na okolicznych regionach
		var buildingCountryId = this.centerTile().countryId;
		var radius = Math.floor(this.sourcesRadius);

		for(var k = 0; k < this.tilesUnder.length; k++){
			var underTile = this.tilesUnder[k];

			for(var i = -radius; i <= radius; i++){
				for(var j = -radius; j <= radius; j++){
					if(this.sourcesRadius < Math.sqrt(i*i + j*j))
						continue;

					if(tiles.exsist(underTile.x + i, underTile.y + j)){
						var tile = tiles.at(underTile.x + i, underTile.y + j);

						if(tile.terrainLevel >= 1 && this.centerTile().islandId == tile.islandId)
							tile.countryId = buildingCountryId;
					}
				}
			}
		}

		function addThisPorters(){
			for(var i = 0; i < this.porters.length; i++)
				this.chooseFilter_portersArray.push(this.porters[i]);
		}

		// marketplacy na tej samej wyspie współdzielą jedno storage, to samo po
		// głównym marketplaceu
		var thisIslandId = this.centerTile().islandId;
		var thisCountryId = this.centerTile().countryId;
		if(islands[thisIslandId].mainMarketplaces[thisCountryId] == undefined){
			islands[thisIslandId].mainMarketplaces[thisCountryId] = this;

			for(var i = 0; i < products.length; i++)
				this.storage.catagories[products[i].id] = i;

			addThisPorters.call(this);
		}
		else{
			var mainMarketplace = islands[thisIslandId].mainMarketplaces[thisCountryId];
			
			this.storage = mainMarketplace.storage;

			this.chooseFilter_portersArray = mainMarketplace.chooseFilter_portersArray;
			addThisPorters.call(this);
		}
	};
}));

var Port = buildable("Port", Marketplace.extend(function(){
	this.requiredResources = makeRequiredResources(100, 6, undefined, 3);
	this.operatingCost = makeOperatingCost(15);

	this.width = 3;
	this.height = 2;

	this.sourcesRadius = 11;

	this.makeRequiredTerrainMap = function(){
		this.createPlainTerrainMap(3, 3);

		this.requiredTerrainMap[0][-1] = 1;
		this.requiredTerrainMap[1][-1] = 1;
		this.requiredTerrainMap[2][-1] = 1;
	};

	this.onBuild = function(){
		if(this.isGhost)
			return;

		this.super.onBuild();

		var offsetX = Math.floor((this.width - 1) / 2);
		var offsetY = Math.floor((this.height - 1) / 2);

		for(var i = (this.width - Object.keys(this.requiredTerrainMap).length); i < this.width; i++){
			for(var j = (this.height - Object.keys(this.requiredTerrainMap[i]).length); j < this.height; j++){
				if(i == -1 || j == -1){
					var tileX = this.centerTile().x + i - offsetX;
					var tileY = this.centerTile().y + j - offsetY;

					new Harbor(tileX, tileY, countries[this.centerTile().countryId], true);
				}
			}
		}
	};
}));

// ~~~

// productionBuilding.js

var Butcher = buildable("Butcher", Workshop.extend(function(){
	this.requiredResources = makeRequiredResources(150, 4, 10, 3);
	this.operatingCost = makeOperatingCost(5, 0);

	this.baseProduction = 2.4 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = FOOD_ID;

		this.inputConsumption[INPUT_1] = 2;
		this.storage.catagories[INPUT_1] = CATTLE_ID;
	};
}));

var WeavingHut = buildable("Weaving hut", Workshop.extend(function(){
	this.requiredResources = makeRequiredResources(200, 6, undefined, 3);
	this.operatingCost = makeOperatingCost(10, 5);

	this.baseProduction = 1.95 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = CLOTH_ID;

		this.inputConsumption[INPUT_1] = 2;
		this.storage.catagories[INPUT_1] = WOOL_ID;
	};
}));

var OreSmelter = buildable("Ore smelter", Workshop.extend(function(){
	this.requiredResources = makeRequiredResources(200, 1, 4, 3);
	this.operatingCost = makeOperatingCost(25, 10);

	this.baseProduction = 1.9 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = IRON_ID;

		this.inputConsumption[INPUT_1] = 1;
		this.storage.catagories[INPUT_1] = ORE_ID;
		this.inputConsumption[INPUT_2] = 1;
		this.storage.catagories[INPUT_2] = WOOD_ID;
	};
}));

var Toolmaker = buildable("Toolmaker", Workshop.extend(function(){
	this.requiredResources = makeRequiredResources(150, 2, 5, 3);
	this.operatingCost = makeOperatingCost(25, 10);

	this.baseProduction = 1.65 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = TOOLS_ID;

		this.inputConsumption[INPUT_1] = 0.5;
		this.storage.catagories[INPUT_1] = IRON_ID;
	};
}));

var Windmill = buildable("Windmill", Workshop.extend(function(){
	this.requiredResources = makeRequiredResources(100, 6, undefined, 3);
	this.operatingCost = makeOperatingCost(5, 0);

	this.baseProduction = 3 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = FLOUR_ID;

		this.inputConsumption[INPUT_1] = 2;
		this.storage.catagories[INPUT_1] = GRAIN_ID;
	};
}));

var Bakery = buildable("Bakery", Workshop.extend(function(){
	this.requiredResources = makeRequiredResources(150, 6, undefined, 2);
	this.operatingCost = makeOperatingCost(5, 0);

	this.baseProduction = 3 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = FOOD_ID;

		this.inputConsumption[INPUT_1] = 2;
		this.storage.catagories[INPUT_1] = FLOUR_ID;
	};
}));

var RumDistillery = buildable("Rum distillery", Workshop.extend(function(){
	this.requiredResources = makeRequiredResources(200, 2, 5, 3);
	this.operatingCost = makeOperatingCost(25, 7);

	this.baseProduction = 2.5 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = LIQUOR_ID;

		this.inputConsumption[INPUT_1] = 2;
		this.storage.catagories[INPUT_1] = SUGARCANE_ID;
	};
}));

var TobaccoProducts = buildable("Tobacco products", Workshop.extend(function(){
	this.requiredResources = makeRequiredResources(200, 2, 5, 3);
	this.operatingCost = makeOperatingCost(20, 10);

	this.baseProduction = 2 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = TOBACCO_PRODUCTS_ID;

		this.inputConsumption[INPUT_1] = 2;
		this.storage.catagories[INPUT_1] = TOBACCO_ID;
	};
}));

var Goldsmith = buildable("Goldsmith", Workshop.extend(function(){
	this.requiredResources = makeRequiredResources(1500, 2, 10, 7);
	this.operatingCost = makeOperatingCost(45, 20);

	this.baseProduction = 1.25 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = JEWLERY_ID;

		this.inputConsumption[INPUT_1] = 0.5;
		this.storage.catagories[INPUT_1] = GOLD_ID;
	};
}));

var Taylor = buildable("Taylor", Workshop.extend(function(){
	this.requiredResources = makeRequiredResources(150, 6, 2, 3);
	this.operatingCost = makeOperatingCost(10, 5);

	this.baseProduction = 2 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = CLOTHES_ID;

		this.inputConsumption[INPUT_1] = 1;
		this.storage.catagories[INPUT_1] = CLOTH_ID;
	};
}));

// ~~~

var CattleFarm = buildable("Cattle farm", Farm.extend(function(){
	this.requiredResources = makeRequiredResources(100, 4, undefined, 1);
	this.operatingCost = makeOperatingCost(5, 0);

	this.harvestRadius = 2;
	this.requiredCrop = "__PLAINS_TILES__";

	this.baseProduction = 2.4 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = CATTLE_ID;
	};

	this.forEachTileInRadius = function(tile){
		if(tile.terrainLevel == PLAINS && tile.buildingData == null)
			this.goodOnes++;
	};
}));

var SheepFarm = buildable("Sheep farm", Farm.extend(function(){
	this.requiredResources = makeRequiredResources(200, 4, undefined, 2);
	this.operatingCost = makeOperatingCost(5, 0);

	this.harvestRadius = 2.5;
	this.requiredCrop = "__PLAINS_TILES__";

	this.baseProduction = 1.95 / 60;

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = WOOL_ID;
	};

	this.forEachTileInRadius = function(tile){
		if(tile.terrainLevel == PLAINS && tile.buildingData == null)
			this.goodOnes++;
	};
}));

var Lumberjack = buildable("Lumberjack", Farm.extend(function(){
	this.requiredResources = makeRequiredResources(50, undefined, undefined, 2);
	this.operatingCost = makeOperatingCost(5, 0);

	this.harvestRadius = 3;

	this.baseProduction = 2.8 / 60;

	this.requiredCrop = "Tree field";

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = WOOD_ID;
	}
}));

var GrainFarm = buildable("Grain farm", Farm.extend(function(){
	this.requiredResources = makeRequiredResources(100, 5, undefined, 2);
	this.operatingCost = makeOperatingCost(5, 0);

	this.harvestRadius = 1.5;

	this.baseProduction = 3 / 60;

	this.requiredCrop = "Grain field";

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = GRAIN_ID;
	}
}));

var CocoaPlantation = buildable("Cocoa plantation", Farm.extend(function(){
	this.requiredResources = makeRequiredResources(300, 3, 8, 2);
	this.operatingCost = makeOperatingCost(35, 15);

	this.harvestRadius = 2.5;

	this.baseProduction = 1.4 / 60;

	this.requiredCrop = "Cocoa field";

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = COCOA_ID;
	}
}));

var SugarcanePlantation = buildable("Sugarcane plantation", Farm.extend(function(){
	this.requiredResources = makeRequiredResources(300, 3, 8, 2);
	this.operatingCost = makeOperatingCost(25, 10);

	this.harvestRadius = 2.5;

	this.baseProduction = 2.3 / 60;

	this.requiredCrop = "Sugarcane field";

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = SUGARCANE_ID;
	}
}));

var Winery = buildable("Winery", Farm.extend(function(){
	this.requiredResources = makeRequiredResources(300, 3, 8, 2);
	this.operatingCost = makeOperatingCost(35, 15);

	this.harvestRadius = 2.5;

	this.baseProduction = 1.15 / 60;

	this.requiredCrop = "Wine field";

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = LIQUOR_ID;
	}
}));

var SpicePlantation = buildable("Spice plantation", Farm.extend(function(){
	this.requiredResources = makeRequiredResources(300, 3, 8, 2);
	this.operatingCost = makeOperatingCost(35, 15);

	this.harvestRadius = 2.5;

	this.baseProduction = 1.4 / 60;

	this.requiredCrop = "Spice field";

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = SPICE_ID;
	}
}));

var TobaccoPlantation = buildable("Tobacco plantation", Farm.extend(function(){
	this.requiredResources = makeRequiredResources(300, 3, 8, 2);
	this.operatingCost = makeOperatingCost(35, 15);

	this.harvestRadius = 2.5;

	this.baseProduction = 1.9 / 60;

	this.requiredCrop = "Tobacco field";

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = TOBACCO_ID;
	}
}));

var CottonPlantation = buildable("Cotton plantation", Farm.extend(function(){
	this.requiredResources = makeRequiredResources(300, 3, 8, 2);
	this.operatingCost = makeOperatingCost(25, 10);

	this.harvestRadius = 2.5;

	this.baseProduction = 3.1 / 60;

	this.requiredCrop = "Cotton field";

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = WOOL_ID;
	}
}));

var Stonemason = buildable("Stonemason", Farm.extend(function(){
	this.requiredResources = makeRequiredResources(100, 5, undefined, 5);
	this.operatingCost = makeOperatingCost(5, 0);

	this.harvestRadius = 2;

	this.baseProduction = 2.9 / 60;

	this.requiredCrop = "Quarry";

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = BRICKS_ID;
	};

	this.hardUpdate = function(delta){
		this.super.hardUpdate(delta, false);

		this.calculateEffectivity();
		
		// musi mieć tylko w zasięgu jakiś Kamieniołom
		if(this.effectivity > 0)
			this.effectivity = 1;

		this.calculateProduction(delta);
	};
}));

var IronMine = buildable("Iron mine", Farm.extend(function(){
	this.width = 2;
	this.height = 1;

	this.possibleRotation = [ NORTH, WEST ];

	this.requiredResources = makeRequiredResources(1000, 20, 5, 10);
	this.operatingCost = makeOperatingCost(60, 20);

	this.harvestRadius = 0;
	this.requiredCrop = "__MOUTAIN_TILES__"; // see gui.js

	this.baseProduction = 1.4 / 60;

	this.makeRequiredTerrainMap = function(){
		this.createPlainTerrainMap(2, 2);

		this.requiredTerrainMap[0][0] = 3;
		this.requiredTerrainMap[1][0] = 3;
	};

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = ORE_ID;
	};

	this.hardUpdate = function(delta){
		this.super.hardUpdate(delta, false);

		this.effectivity = 1;
		this.calculateProduction(delta);
	};
}));

var GoldMine = buildable("Gold mine", Farm.extend(function(){
	this.width = 2;
	this.height = 1;

	this.requiredResources = makeRequiredResources(1000, 20, 5, 10);
	this.operatingCost = makeOperatingCost(60, 20);

	this.harvestRadius = 0;
	this.requiredCrop = "__MOUTAIN_TILES__"; // see gui.js

	this.baseProduction = 0.75 / 60;

	this.makeRequiredTerrainMap = function(){
		this.createPlainTerrainMap(2, 2);

		this.requiredTerrainMap[0][0] = 3;
		this.requiredTerrainMap[1][0] = 3;
	};

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = GOLD_ID;
	};

	this.hardUpdate = function(delta){
		this.super.hardUpdate(delta, false);

		this.effectivity = 1;
		this.calculateProduction(delta);
	};
}));

var FishermanHut = buildable("Fisherman hut", Farm.extend(function(){
	this.width = 1;
	this.height = 1;

	this.requiredResources = makeRequiredResources(100, 5, 0, 3);
	this.operatingCost = makeOperatingCost(5, 0);

	this.harvestRadius = 5;
	this.requiredCrop = "__WATER_TILES__"; // see 'forEachTileInRadius'

	this.baseProduction = 0.75 / 60;

	this.makeRequiredTerrainMap = function(){
		this.createPlainTerrainMap(1, 1);

		this.requiredTerrainMap[0][0] = 1;
	};

	this.onBuild = function(){
		this.super.onBuild();

		this.storage.catagories[OUTPUT] = FOOD_ID;
	};

	this.forEachTileInRadius = function(tile){
		if(tile.terrainLevel < COAST)
			this.goodOnes++;
	};
}));

// ~~~

// civilianUnit.js

PORTER_CAPACITY = 10;

// Tragarz - transportuje surowce.
var Porter = CivilianUnit.extend(function(){
	this.storage = new Storage();

	// "prywatne" source i dest dla CAŁEGO kursu w tę i spowrotem
	// publiczne sourceBuilding i destBuilding są tylko w jedną stronę
	this.origin = undefined;
	this.destination = undefined;

	this.bringType = undefined;

	this.ownedBy = undefined;

	this.constructor = function(building){
		this.super();

		this.ownedBy = building;
	};

	this.begin = function(origin, dest){
		return this.setupRoute(origin, dest);
	};

	this.end = function(){
		this.bringType = undefined;

		this.origin = undefined;
		this.destination = undefined;
	};

	this.bring = function(origin, dest, type){
		this.origin = origin;
		this.destination = dest;

		this.bringType = type;
		return this.begin(origin, dest);
	};

	this.onStart = function(){};

	this.onReach = function(){
		if(tiles.at(this.position).buildingData === this.destination){
			this.destinationBuilding.storage.transferTo(this.storage, this.bringType, PORTER_CAPACITY);

			this.begin(this.destinationBuilding, this.sourceBuilding);
		} else if(tiles.at(this.position).buildingData === this.origin){
			this.storage.transferTo(this.destinationBuilding.storage, this.bringType, Infinity);

			this.end();
		}
	};
});
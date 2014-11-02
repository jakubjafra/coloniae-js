/*

structure.js

*/

/*

Nowe struktury tworzy się tylko przez:
	new <nazwa_budynku>(x, y)
cała magia dzieje się w konstruktorze.

*/

// Wszystkie możliwe (i mające sens) do zbudowania na mapie struktury.
var structsClass = [];
function buildable(name, X){
	structsClass.push({ name: name, class: X, index: structsClass.length });
	X.prototype.structName = name;

	return X;
}

// ~~~

function haveRequriedResources(requiredResources, marketplace){
	var ret = true;

	$.each(requiredResources, function(i, v){
		switch(Number(i)){
			case INVALID_ID:
				// coins
				if(countries[tiles.at(marketplace.tilesUnder[0]).countryId].coins < v)
					return (ret = false);
				break;

			default:
				// product
				if(marketplace.storage.of(i) < v)
					return (ret = false);
				break;
		}
	});

	return ret;
}

function useRequiredResources(requiredResources, marketplace){
	$.each(requiredResources, function(i, v){
		switch(Number(i)){
			case INVALID_ID:
				// coins
				console.assert(countries[tiles.at(marketplace.tilesUnder[0]).countryId].coins >= v);
				countries[tiles.at(marketplace.tilesUnder[0]).countryId].coins -= v;
				break;

			default:
				// product
				console.assert(marketplace.storage.of(i) >= v);
				marketplace.storage.remove(marketplace.storage.special(i), v);
				break;
		}
	});
}

function makeRequiredResources(coins, wood, bricks, tools, etc){
	var arr = {};

	if(coins != undefined) 		arr[INVALID_ID] = coins;
	if(wood != undefined) 		arr[WOOD_ID] = wood;
	if(bricks != undefined) 	arr[BRICKS_ID] = bricks;
	if(tools != undefined) 		arr[TOOLS_ID] = tools;
	if(etc != undefined) 		$.extend(arr, etc);

	return arr;
}

function makeBonusResources(etc){
	var arr = {};

	console.assert(arguments.length % 2 == 0);
	for(var i = 0; i < arguments.length; i += 2){
		arr[arguments[i]] = arguments[i + 1];
	}

	return arr;
}

function canBeBuild(x, y, building){
	var offsetX = Math.floor((building.width - 1) / 2);
	var offsetY = Math.floor((building.height - 1) / 2);

	for(var i in building.requiredTerrainMap){
		for(var j in building.requiredTerrainMap[i]){
			var tileX = x + parseInt(i) - offsetX;
			var tileY = y + parseInt(j) - offsetY;

			if(!(tileX >= 0 && tileX < tiles.size.x) ||
			   !(tileY >= 0 && tileY < tiles.size.y)){
				return false;
			}

			var tile = tiles[tileX][tileY];

			if(building.requiredTerrainMap[i][j] != tile.terrainLevel)
				return false;

			if(tile.buildingData != null)
				if(tile.buildingData.canBeOverwritten == false)
					return false;
		}
	}
	
	return true;
}

// stałe do obrotów
NORTH = 10;
// EAST = 20;
// SOUTH = 30;
WEST = 40;

var structures = [];

var Structure = Class.extend(function(){
	// Id struktury
	this.structureId = INVALID_ID;
	// Wielkość budynku.
	this.width = 1;
	this.height = 1;
	// Tilesy na których stoi budynek.
	this.tilesUnder = [];
	// Czy jest wybudowane.
	this.isGhost = true;
	// Czy może być nadpisane przez budowę budynku.
	this.canBeOverwritten = true;
	// Mapa wymaganego terenu na którym może zostać wybudowany budynek
	this.requiredTerrainMap = {};
	// obrócenie budynku
	this.rotation = NORTH;
	// Wymagane surowce do wybudowania
	this.requiredResources = {}; // <- INVALID_ID to monety

	this.createPlainTerrainMap = function(width, height){
		var wDiff = width - this.width; wDiff = wDiff || 0;
		var hDiff = height - this.height; hDiff = hDiff || 0;

		width = width || this.width;
		height = height || this.height;

		this.requiredTerrainMap = {};
		for(var i = (this.width - width); i < (width - wDiff); i++){
			this.requiredTerrainMap[i] = {};
			for(var j = (this.height - height); j < (height - hDiff); j++){
				this.requiredTerrainMap[i][j] = 2;
			}
		}
	};

	this.rotateTerrainMap = function(){
		switch(this.rotation){
			case WEST:
					var newWidth = this.height;
					var newHeight = this.width;

					var newTerrainMap = {};

					for(var i in this.requiredTerrainMap){
						for(var j in this.requiredTerrainMap[i]){
							var newX = -parseInt(j);
							var newY = (newHeight - 1 - Math.abs(parseInt(i)));

							console.log(i + " " + j + " -> " + newX + " " + newY);

							if(newTerrainMap[newX] == undefined)
								newTerrainMap[newX] = {};

							newTerrainMap[newX][newY] = this.requiredTerrainMap[i][j];
						}
					}

					this.requiredTerrainMap = $.extend(true, {}, newTerrainMap);

					this.width = newWidth;
					this.height = newHeight;
				break;

			default:
				break;
		}
	};

	this.centerTile = function(){
		var offsetX = Math.floor((this.width - 1) / 2);
		var offsetY = Math.floor((this.height - 1) / 2);
		return tiles[this.tilesUnder[0].x + offsetX][this.tilesUnder[0].y + offsetY];
	};

	this.northTile = function(){
		return tiles[this.tilesUnder[0].x][this.tilesUnder[0].y];
	};

	this.southTile = function(){
		return tiles[this.tilesUnder[0].x + this.width - 1][this.tilesUnder[0].y + this.height - 1];
	};

	// zwraca false jeśli dany tile nie jest tilesem budynku
	// jeśli jest to zwraca pozycję lokalną względem początku budynku (względem this.tilesUnder[0])
	this.isUnder = function(tile){
		for(var i = 0; i < this.tilesUnder.length; i++){
			var thisTile = this.tilesUnder[i];
			if(thisTile.x == tile.x && thisTile.y == tile.y){
				var localX = thisTile.x - this.tilesUnder[0].x;
				var localY = thisTile.y - this.tilesUnder[0].y;

				return tiles.coords(localX, localY);
			}
		}

		return false;
	}

	this.forEachBuildingTile = function(tileFunction, x, y){
		var offsetX = Math.floor((this.width - 1) / 2);
		var offsetY = Math.floor((this.height - 1) / 2);

		if(x == undefined || y == undefined){
			x = this.centerTile().x;
			y = this.centerTile().y;
		}

		for(var i = 0; i < this.width; i++){
			for(var j = 0; j < this.height; j++){
				var tileX = x + i - offsetX;
				var tileY = y + j - offsetY;

				var tile = tiles[tileX][tileY];

				tileFunction.call(this, tile);
			}
		}
	}

	this.__baseConstructor__ = function(x, y, ghostOrCountry, isFree, forEachTile, callHandler, rotation){
		this.rotation = rotation || NORTH;

		this.makeRequiredTerrainMap();
		this.rotateTerrainMap();

		// ghost
		if(ghostOrCountry != undefined && ghostOrCountry == null)
			return true;

		isFree = (isFree != undefined);

		if(ghostOrCountry instanceof Country || ghostOrCountry == undefined){
			var countryId = tiles[x][y].countryId;
			if(ghostOrCountry != undefined && countryId != ghostOrCountry.id){
				console.log("tried to add building not in players' area (" + this.structName + ' @ ' + x + ', ' + y + ')');
				return false;
			}

			if(!canBeBuild(x, y, this)){
				console.log('creating building on exsisting building OR terrain requment for this building not met; deined anyway (' + this.structName + ' @ ' + x + ', ' + y + ')');
				return false;
			}

			if(!isFree && ghostOrCountry != undefined){
				var marketplace = islands[tiles.at(x, y).islandId].mainMarketplaces[tiles.at(x, y).countryId];
				if(!haveRequriedResources(this.requiredResources, marketplace)){
					console.log('do not have required resources to build');
					return false;
				}

				useRequiredResources(this.requiredResources, marketplace);
			}

			this.forEachBuildingTile(function(tile){
				if(tile.buildingData != null){
					console.assert(tile.buildingData.canBeOverwritten == true);
					tile.buildingData.remove();
				}

				this.tilesUnder.push(tiles.coords(tile.x, tile.y));
				tile.buildingData = this;

				if(forEachTile != undefined)
					forEachTile.call(this, tile);
			}, x, y);

			this.structureId = structures.length;
			structures.push(this);

			if(callHandler == undefined)
				this.onBuild();

			this.isGhost = false;
		}

		console.log("successfully builded " + this.structName + " @ " + x + ", " + y);

		return true;
	};

	// Jest przypał z nadpisywaniem konstruktora, jeśli nie trzeba lepiej tego nie robić.
	this.constructor = function(x, y, ghostOrCountry, isFree, rotation){
		this.__baseConstructor__(x, y, ghostOrCountry, isFree, undefined, undefined, rotation);
	};

	this.remove = function(call){
		this.forEachBuildingTile(function(tile){
			tile.buildingData = null;
		});

		delete structures[this.structureId];

		if(call == undefined)
			this.onRemove();
	};

	this.makeRequiredTerrainMap = this.createPlainTerrainMap;

	this.softUpdate = function(delta){};
	this.hardUpdate = function(delta){};

	this.onBuild = function(){};
	this.onRemove = function(){};
});

/*

na przyszłość dla modów:

Structure = Structure.extend(function(){
	// inject
});

musi być dokonane PRZED ew. dziedziczeniem po tej klasie -- zmiany NIE zachodzą
gdy już wykonano dziedziczenie :(

Generalnie modowanie jest do dupy aktualnie.

*/
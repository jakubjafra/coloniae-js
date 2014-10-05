/*

tmp.js

*/

INVALID_ID = -1;
INVALID_TYPE = INVALID_ID;

OCEAN = -2;
SEA = -1;
SHALLOW = 0;
COAST = 1;
PLAINS = 2;
HILLSIDE = 3;
MOUTAIN = 4;

var Tile = Class.extend(function(){
	// indeks
	this.index = 0;
	// pozycja
	this.x = 0;
	this.y = 0;
	// określa wysokość nad poziomem morza (parzyste płaskie, nieparzyste wzgórza)
	this.terrainLevel = 2;
	// dodatkowe dane dot. terenu
	this.terrainType = undefined;
	// dane budynku
	this.buildingData = null;
	// id państwa do którego należy ten tile
	this.countryId = INVALID_ID;
	// id wyspy (nie dot. terenów morskich)
	this.islandId = INVALID_ID;

	this.constructor = function(x, y){
		this.index = tiles.index(x, y);

		this.x = x;
		this.y = y;
	}
});

var tiles = {};

function bindUsefulMapFunctions(){
	tiles.at = function(x, y){
		if(x instanceof Object)
			return tiles.at(x.x, x.y);
		else if(y == undefined)
			return tiles.at(tiles.coords(x, undefined));
		else{
			console.assert(tiles[x] != undefined, "x out of range");
			console.assert(tiles[x][y] != undefined, "y out of range");

			return tiles[x][y];
		}
	};

	tiles.exsist = function(x, y){
		if(tiles[x] != undefined)
			if(tiles[x][y] != undefined)
				return true;
		return false;
	};

	// miłe funkcje zamieniajace postać obiektową {x: 1, y: 1} na postać liczbową 101 i odwrotnie
	// bo generalnie pozycję można przedstawiać na 3 sposoby:
	// {x: 1, y: 1}  LUB  x = 1; y = 1;  LUB  xy = 101
	// i te funkcje pomagają operować na tak różnych sposobach przedstawiania

	tiles.coords = function(x, y) {
		if(x instanceof Object)
			return x;
		else if(y == undefined)
			return {x: Math.floor(x / 100), y: (x - (Math.floor(x / 100) * 100))};
		else
			return {x: x, y: y};
	};

	tiles.index = function(x, y) {
		if(x instanceof Object)
			return 100 * x.x + x.y;
		else if(y == undefined)
			return x;
		else
			return 100 * x + y;
	};
}

bindUsefulMapFunctions();

function createMap(x, y){
	tiles = {};
	
	bindUsefulMapFunctions();

	tiles.size = tiles.coords(x, y);

	for(var i = 0; i < x; i++){
		tiles[i] = {};
		for(var j = 0; j < y; j++){
			tiles[i][j] = new Tile(i,j);

			if(i == 0 || i == (x-1))
				tiles[i][j].terrainLevel = SHALLOW;
			
			if(j != 0 && j != (y-1) && (i == 1 || i == (x-2)))
				tiles[i][j].terrainLevel = COAST;

			if(j == 0 || j == (y-1))
				tiles[i][j].terrainLevel = SHALLOW;
			
			if(i != 0 && i != (x-1) && (j == 1 || j == (y-2)))
				tiles[i][j].terrainLevel = COAST;

			// tymczasowo:
			if(tiles[i][j].terrainLevel >= COAST)
				tiles[i][j].islandId = 0;
		}
	}

	// tymczasowo: (stawianie góry)
	function makeMountain(_X_, _Y_){
		for(var i = 0; i < 6; i++){
			for(var j = 0; j < 6; j++){
				var tile = tiles[_X_ + i][_Y_ + j];

				if(i == 0 || i == 5 || j == 0 || j == 5)
					tile.terrainLevel = HILLSIDE;
				else
					tile.terrainLevel = MOUTAIN;

				tile.terrainType = tiles.coords(_X_ + 1, _Y_ + 1);
			}
		}
	}

	makeMountain(6, 12);
	makeMountain(4, 5);
}
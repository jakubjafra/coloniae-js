/*

map.js

*/

function makeIsland(x, y, w, h){
	var newIsland = new Island();

	for(var i = 0; i < h; i++){
		for(var j = 0; j < w; j++){
			console.assert(tiles.exsist(i + x, j + y));
			var tile = tiles[i + x][j + y];

			tile.terrainLevel = PLAINS;

			if(i == 0 || i == (h-1))
				tile.terrainLevel = SHALLOW;
		
			if(j != 0 && j != (w-1) && (i == 1 || i == (h-2)))
				tile.terrainLevel = COAST;

			if(j == 0 || j == (w-1))
				tile.terrainLevel = SHALLOW;
			
			if(i != 0 && i != (h-1) && (j == 1 || j == (w-2)))
				tile.terrainLevel = COAST;

			if(tile.terrainLevel >= COAST)
				tile.islandId = newIsland.id;

			if(tile.terrainLevel == PLAINS && Math.random() > 0.55){
				new TreeFld(tile.x, tile.y, undefined, true);
			}
		}
	}

	return newIsland;
}

function makeMountain(x, y){
	for(var i = 0; i < 6; i++){
		for(var j = 0; j < 6; j++){
			var tile = tiles[x + i][y + j];

			if(tile.buildingData != null)
				tile.buildingData.remove();

			if(i == 0 || i == 5 || j == 0 || j == 5)
				tile.terrainLevel = HILLSIDE;
			else
				tile.terrainLevel = MOUTAIN;

			tile.terrainType = tiles.coords(x + 1, y + 1);
		}
	}
}

function createMap(x, y){
	tiles = new bindUsefulMapFunctions();

	tiles.size = tiles.coords(x, y);

	for(var i = 0; i < x; i++){
		tiles[i] = {};
		for(var j = 0; j < y; j++){
			tiles[i][j] = new Tile(i,j);
		}
	}

	makeIsland(2, 2, 16, 36);
	makeIsland(6, 21, 10, 10);
	
	// makeMountain(6, 12);
	makeMountain(8, 7);
}
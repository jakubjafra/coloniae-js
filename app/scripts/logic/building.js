/*

building.js

*/

function makeOperatingCost(turned_on, turned_off){
	var arr = {};

	arr.on = (turned_on || 0);
	arr.off = (turned_off || 0);

	return arr;
}

var buildings = [];

var Building = Structure.extend(function(){
	// Id
	this.id = INVALID_ID;
	// Budynki nie mogą być nadpisane.
	this.canBeOverwritten = false;
	// koszty operacyjne
	this.operatingCost = makeOperatingCost(0, 0);

	// nie wolno nadpisywać konstruktora w budynkach!
	this.constructor = function(x, y, ghostOrCountry, isFree, rotation){
		var countryId = tiles[x][y].countryId;
		if(this.__baseConstructor__(x, y, ghostOrCountry, isFree, function(tile){
					// budynek rozszerza teretorium gracza
					tile.countryId = countryId;
				}, false, rotation)
			){

			if(ghostOrCountry == null)
				return;

			this.id = buildings.length;
			buildings.push(this);

			this.onBuild();
		}
	};

	this.remove = function(){
		delete buildings[this.id];
		this.super.remove(false);

		this.onRemove();
	};

	this.hardUpdate = function(delta){
		this.super.hardUpdate(delta);

		var operatingCost = this.operatingCost.on * delta / 60;

		countries[this.centerTile().countryId].coins -= operatingCost;

		var island = islands[this.centerTile().islandId];
		
		if(island.maintenance[this.centerTile().countryId] == undefined)
			island.maintenance[this.centerTile().countryId] = 0;

		island.maintenance[this.centerTile().countryId] += this.operatingCost.on;
	};
});
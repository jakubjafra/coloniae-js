/*

ship.js

*/

function onlyWaterTilesFilter(tile){
	return (tile.terrainLevel < SHALLOW);
}

 // TODO: filter niech uwzględnia także inne jednostki pływające

// Statek, porusza się po morzach,
var Ship = MilitaryUnit.extend(function(){
	this.setupRoute = function(destination){
		// Musi mieć inny algorytm szukania drogi (Dijakstra za droga), etc.
		return AStar(
				tiles.index(this.position),
				tiles.index(destination),
				neighbours(true, onlyWaterTilesFilter)
			);
	};
});
/*

ship.js

*/

function onlyWaterTilesFilter(tile) {
  return tile.terrainLevel < SHALLOW;
}

// TODO: filter niech uwzględnia także inne jednostki pływające

// Statek, porusza się po morzach,
var Ship = MilitaryUnit.extend(function () {
  this.operatingCost = 10;

  this.setupRoute = function (destination, source) {
    source = source || this.position;

    // Musi mieć inny algorytm szukania drogi (Dijakstra za droga), etc.
    return AStar(
      tiles.index(source),
      tiles.index(destination),
      neighbours(true, onlyWaterTilesFilter),
    );
  };

  this.hardUpdate = function (delta) {
    countries[this.countryId].coins -= (this.operatingCost * delta) / 60;
  };
});

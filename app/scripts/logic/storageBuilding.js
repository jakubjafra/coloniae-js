/*

storageBuilding.js

*/

// StorageBuilding będzie dążył do skupiania w swoim wnętrzu określonych surowców
// z dostępnego najbliższego otoczenia.
var StorageBuilding = Building.extend(function () {
  this.width = 2;
  this.height = 2;

  this.porters = [];

  this.storage = new Storage();

  // sourcesList to lista budynków z których ten budynek pobiera surowce,
  // są to budynki które są w promieniu sourcesRadius od tego budynku.
  this.sourcesRadius = 0;
  this.sourcesList = [];

  // Filtr dla źródeł.
  // Do dziediczenia.
  this.sourcesFilter = function (building) {
    return false;
  };

  function calcDistance(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
  }

  // Wywoływać przy każdej zmianie struktury budynków (zbudowaniu lub zburzeniu budynku)
  this.updateSources = function () {
    this.sourcesList = [];
    for (var i = 0; i < buildings.length; i++) {
      if (buildings[i] == undefined) continue;

      var distance = calcDistance(buildings[i].centerTile(), this.centerTile());
      if (distance <= this.sourcesRadius && this.sourcesFilter(buildings[i])) {
        this.sourcesList.push(buildings[i]);
      }
    }
  };

  this.softUpdate = function (delta) {
    this.super.softUpdate(delta);

    this.deployPorters();
  };

  // Funkcja powodująca zapoczątkowanie transportowania jednego towaru z jednego budynku
  // do tego budynku przez tragarza. Tragarze poruszają się po drogach.
  this.deployPorters = function () {
    for (var i = 0; i < this.porters.length; i++) {
      var porter = this.porters[i];

      if (porter.isBusy) continue;

      var destination = this.chooseSource();
      if (destination != undefined)
        for (var i = 0; i < destination.length; i++)
          if (porter.bring(this, destination[i][2], destination[i][1])) break;
    }
  };

  this.minSourceQuantity = 0;

  this.chooseFilter_portersArray = this.porters;

  this.chooseFilter = function (building) {
    if (building.storage.of(OUTPUT) > this.minSourceQuantity) {
      // sprawdza czy już jakiś transport nie idzie do danego budynku
      // (nie wysyła się 2ch transportów w jedno miejsce)
      var can = true;
      for (var j = 0; j < this.chooseFilter_portersArray.length; j++) {
        if (
          this.chooseFilter_portersArray[j].isBusy &&
          this.chooseFilter_portersArray[j].destination === building
        ) {
          can = false;
          break;
        }
      }

      return [can, building.storage.special(OUTPUT)];
    } else return [false];
  };

  // Funkcja wyboru, gdy zwraca undefined nie ma budynku do obsłużenia
  // Do dziedziczenia.
  this.chooseSource = function () {
    var arr = [];

    for (var i = 0; i < this.sourcesList.length; i++) {
      var filter = this.chooseFilter(this.sourcesList[i]);
      if (filter[0])
        arr.push([this.sourcesList[i].storage.at(filter[1]), filter[1], this.sourcesList[i]]);
    }

    if (arr.length == 0) return undefined;

    arr.sort(function (a, b) {
      return a[0] - b[0];
    });

    return arr;
  };

  this.onBuild = function () {
    this.super.onBuild();

    for (var i = 0; i < buildings.length; i++) {
      if (buildings[i] == undefined) continue;

      if (buildings[i] instanceof StorageBuilding) buildings[i].updateSources();
    }
  };

  this.onRemove = function () {
    this.super.onRemove();

    for (var i = 0; i < buildings.length; i++) {
      if (buildings[i] == undefined) continue;

      if (buildings[i] instanceof StorageBuilding) buildings[i].updateSources();
    }
  };
});

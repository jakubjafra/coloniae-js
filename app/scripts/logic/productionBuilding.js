/*

productionBuilding.js

*/

import { INVALID_ID } from './constants';
import { OUTPUT, INPUT_1 } from './storage';
import { StorageBuilding } from './storageBuilding';
import { Porter } from './gameDefinitions';

export var ProductionBuilding = StorageBuilding.extend(function () {
  this.baseProduction = 0; // per second

  this.productionStep = 0.0;

  this.effectivity = 1;
});

export var Workshop = ProductionBuilding.extend(function () {
  this.width = 2;
  this.height = 2;

  this.porters = [new Porter(this)];
  this.minSourceQuantity = 5;

  this.maxInputQuantity = 5;

  this.sourcesRadius = 11;

  this.inputConsumption = {};

  this.onBuild = function () {
    this.super.onBuild();

    this.storage.catagories[OUTPUT] = INVALID_ID;

    this.inputConsumption[INPUT_1] = 1;
    this.storage.catagories[INPUT_1] = INVALID_ID;
  };

  this.sourcesFilter = function (building) {
    return building instanceof Marketplace || building instanceof Farm;
  };

  this.chooseFilter = function (building) {
    var arr = [];

    $.each(
      this.inputConsumption,
      $.proxy(function (i, v) {
        if (this.storage.of(i) >= this.maxInputQuantity) return 'continue';

        var buildingQuantity = building.storage.at(this.storage.special(i));
        if (buildingQuantity > this.minSourceQuantity) {
          arr.push([this.storage.of(i), this.storage.special(i)]);
        }
      }, this),
    );

    if (arr.length == 0) return [false];

    arr.sort(function (a, b) {
      return a[0] - b[0];
    });

    return [true, arr[0][1]];
  };

  this.canProduce = function () {
    // also updates effectivity
    var ret = true;

    $.each(
      this.inputConsumption,
      $.proxy(function (i, v) {
        if (!(this.storage.of(i) >= v)) {
          ret = false;
          return false;
        }
      }, this),
    );

    this.effectivity = ret ? 1 : 0;
    return ret;
  };

  this.hardUpdate = function (delta) {
    this.super.hardUpdate(delta);

    if (this.canProduce()) {
      this.productionStep += this.baseProduction * delta;

      while (this.productionStep >= 1.0 && this.canProduce()) {
        this.storage.add(this.storage.special(OUTPUT), 1);

        $.each(
          this.inputConsumption,
          $.proxy(function (i, v) {
            this.storage.remove(this.storage.special(i), v);
          }, this),
        );
        this.productionStep -= 1.0;
      }
    }
  };

  this.softUpdate = function (delta) {
    this.super.softUpdate(delta);

    if (!this.canProduce()) this.deployPorters();
  };
});

export var Farm = ProductionBuilding.extend(function () {
  this.width = 2;
  this.height = 2;

  this.harvestRadius = 1.5; // najlepiej jedno z [1.5 ; 2 ; 2.5 ; 3]

  this.requiredCrop = undefined;

  this.onBuild = function () {
    this.super.onBuild();

    this.storage.catagories[OUTPUT] = INVALID_ID;
  };

  this.goodOnes = 0;
  this.totalOnes = 0;

  this.forEachTileInRadius = function (tile) {
    if (tile.terrainLevel >= PLAINS && tile.buildingData !== this) {
      if (tile.buildingData == null) {
        if (this.requiredCrop == null) this.goodOnes++;
      } else if (tile.buildingData.structName == this.requiredCrop && !tile.buildingData.isWithered)
        this.goodOnes++;
    }
  };

  this.calculateEffectivity = function () {
    this.goodOnes = 0;
    this.totalOnes = 0;

    var radius = Math.ceil(this.harvestRadius);

    var checked = {};
    for (var k = 0; k < this.tilesUnder.length; k++) {
      var underTile = this.tilesUnder[k];

      for (var i = -radius; i <= radius; i++) {
        for (var j = -radius; j <= radius; j++) {
          if (this.harvestRadius < Math.sqrt(i * i + j * j)) continue;

          if (!tiles.exsist(underTile.x + i, underTile.y + j)) continue;

          var tile = tiles[underTile.x + i][underTile.y + j];

          if (checked[tile.index] == undefined) {
            checked[tile.index] = true;

            if (tile.buildingData !== this) this.totalOnes++;

            this.forEachTileInRadius(tile);
          }
        }
      }
    }

    this.effectivity = this.goodOnes / this.totalOnes;
  };

  this.calculateProduction = function (delta) {
    this.productionStep += this.baseProduction * this.effectivity * delta;
    while (this.productionStep >= 1.0) {
      this.storage.add(this.storage.catagories[OUTPUT], 1);

      this.productionStep -= 1.0;
    }
  };

  this.hardUpdate = function (delta, dontCalc) {
    this.super.hardUpdate(delta);

    if (dontCalc == undefined) {
      this.calculateEffectivity();
      this.calculateProduction(delta);
    }
  };
});

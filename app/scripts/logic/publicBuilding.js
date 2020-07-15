/*

publicBuilding.js

*/

var PublicBuilding = Building.extend(function () {
  this.operatingRadius = 0;

  this.onBuild = function () {
    this.super.onBuild();
  };

  this.onRemove = function () {
    this.super.onRemove();
  };
});

// ~~~

var __publicBuildingsMask__ = [];

function createMask(name) {
  var mask = 1 << __publicBuildingsMask__.length;

  __publicBuildingsMask__.push({
    name: name,
    mask: mask,
  });

  return mask;
}

CHAPEL_MASK = createMask('Chapel');
CHURCH_MASK = createMask('Church');
PUBLICBATH_MASK = createMask('Public bath');
SCHOOL_MASK = createMask('School');
UNIVERSITY_MASK = createMask('University');
THEATRE_MASK = createMask('Theatre');
TAWERN_MASK = createMask('Tawern');

var AreaPublicBuilding = PublicBuilding.extend(function () {
  this.bitMask = 0;

  function applyMask(a, b) {
    return a | b;
  }
  function removeMask(a, b) {
    return a & ~b;
  }

  this.projectMaskToTerrain = function (operation) {
    var radius = Math.ceil(this.operatingRadius);

    for (var k = 0; k < this.tilesUnder.length; k++) {
      var underTile = this.tilesUnder[k];

      for (var i = -radius; i <= radius; i++) {
        for (var j = -radius; j <= radius; j++) {
          if (this.harvestRadius < Math.sqrt(i * i + j * j)) continue;

          if (!tiles.exsist(underTile.x + i, underTile.y + j)) continue;

          var tile = tiles[underTile.x + i][underTile.y + j];
          tile.publicBuildingMask = operation(tile.publicBuildingMask, this.bitMask);
        }
      }
    }
  };

  this.onBuild = function () {
    this.super.onBuild();

    this.projectMaskToTerrain(applyMask);
  };

  this.onRemove = function () {
    // może usunąć maskę innych budynków tego typu jeśli są w odległości mniejszej niż 2*radius
    this.projectMaskToTerrain(removeMask);

    for (var i = 0; i < buildings.length; i++) {
      if (
        buildings[i] != undefined &&
        buildings[i] != this &&
        buildings[i] instanceof AreaPublicBuilding
      ) {
        buildings[i].projectMaskToTerrain(applyMask);
      }
    }

    this.super.onRemove();
  };
});

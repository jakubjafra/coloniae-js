/*

draw.js

*/

define([
  'underscore',
  '../../imgs/atlas.json',
  '../logic',
  '../logic/constants',
  '../logic/tile',
  '../logic/civilianUnit',
  '../logic/militaryUnit',
  '../logic/gameDefinitions',
  '../graphics/gameplayState',
], function (
  _,
  atlas,
  Logic,
  { INVALID_ID },
  { tiles, SEA, SHALLOW, COAST, PLAINS, HILLSIDE, MOUTAIN },
  { civilianUnits },
  { militaryUnits },
  { Porter, FieldPlant, House, Road, Marketplace },
  { gameplayState },
) {
  var flagProgress = {};

  function getFlagForTile(tile, delta) {
    if (flagProgress[tile.index] == undefined) flagProgress[tile.index] = 0;

    flagProgress[tile.index] += delta * Logic.timeFlowSpeed * 4;
    var flagNum = Math.floor((flagProgress[tile.index] % 8) + 1);

    return 'redflag' + flagNum;
  }

  return function (delta, ctx, cameraPosition, getSourceImage, isColorpicking) {
    // TODO: przepisać to
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    var porters = {}; // [porterPosition] -> porterType

    // update porters positions to display
    for (var i = 0; i < civilianUnits.length; i++) {
      var porter = civilianUnits[i];

      if (!(porter instanceof Porter)) continue;

      if (porter.position.x != -1 && porter.position.y != -1 && porter.isBusy)
        porters[tiles.index(porter.position)] = porter.origin instanceof Marketplace ? 1 : 2;
    }

    var screenSize = tiles.coords(ctx.canvas.width, ctx.canvas.height);
    var screenMarginSize = 100;

    var toDrawArray = [];

    var toDrawBuildings = {};
    var toDrawMoutains = {};

    var margin = 0;
    if (isColorpicking) margin = 0;

    var posX, posY;
    function calculateTilePosition(x, y) {
      posX = cameraPosition.x + x * -32 + y * 32;
      posY = cameraPosition.y + y * 16 + x * 16;
    }

    // TODO: rysować tylko widoczne tilesy...
    for (var x = -margin; x < tiles.size.x + margin; x++) {
      for (var y = -margin; y < tiles.size.y + margin; y++) {
        calculateTilePosition.call(this, x, y);

        var outOfScreen =
          posX < -screenMarginSize ||
          posY < -screenMarginSize ||
          posX > screenSize.x + screenMarginSize ||
          posY > screenSize.y + screenMarginSize;

        function drawRawAtlasTile(atlasName, modeName) {
          toDrawArray.push({
            atlasName: atlasName,
            x: x,
            y: y,
            screenX: posX,
            screenY: posY,
            isVisible: !outOfScreen,
            specialMode: modeName,
          });
        }

        function drawAtlasTile(atlasName, tile, mode) {
          drawRawAtlasTile(atlasName, mode);

          if (tile != undefined) {
            if (!outOfScreen && tile.buildingData != null)
              toDrawBuildings[tile.buildingData.structureId] = true;

            if (!outOfScreen && tile.terrainLevel >= HILLSIDE && tile.terrainType != undefined)
              toDrawMoutains[tiles.index(tile.terrainType)] = true;
          }
        }

        // ~~~

        if (!tiles.exsist(x, y)) {
          if (!outOfScreen) drawAtlasTile('sea1', undefined);

          continue;
        }

        var tile = tiles[x][y];
        var tileImage = '';

        if (outOfScreen) {
          if (
            !(
              tile.terrainLevel >= HILLSIDE ||
              (tile.buildingData != undefined &&
                tile.buildingData.width > 1 &&
                tile.buildingData.height > 1)
            )
          )
            continue;
        }

        // (1) teren:

        function buildSpecialTileName(name, hash) {
          function getTile(x, y) {
            if (tiles[x] == undefined || tiles[x][y] == undefined) return new Tile();

            return tiles[x][y];
          }

          return (
            name +
            '_' +
            hash(getTile(x + 1, y)) +
            '_' +
            hash(getTile(x, y + 1)) +
            '_' +
            hash(getTile(x - 1, y)) +
            '_' +
            hash(getTile(x, y - 1))
          );
        }

        switch (tile.terrainLevel) {
          case SEA:
            tileImage = 'sea1';
            break;

          case SHALLOW:
            tileImage = buildSpecialTileName('shallow1', function (tile) {
              switch (tile.terrainLevel) {
                case 0:
                  return 'h';
                case 1:
                  return 'c';
                default:
                  return 's';
              }
            });
            break;

          case COAST:
            tileImage = buildSpecialTileName('coast1', function (tile) {
              switch (tile.terrainLevel) {
                case 0:
                  return 's';
                case 1:
                  return 'c';
                default:
                  return 'i';
              }
            });
            break;

          case PLAINS:
            tileImage = 'grassland1';
            break;

          case HILLSIDE:
            tileImage = buildSpecialTileName('hillside1', function (tile) {
              switch (tile.terrainLevel) {
                case 3:
                  return 'h';
                case 4:
                  return 'm';
                default:
                  return 'i';
              }
            });
            break;

          case MOUTAIN:
            var localX = x - tile.terrainType.x;
            var localY = y - tile.terrainType.y;

            tileImage = 'moutain1_' + localX + '_' + localY;
            break;
        }

        // tilesy wyspy są na wyższym poziomie niż reszta :)
        if (tile.terrainLevel >= PLAINS) posY -= 20;

        // (2) budynek:

        function getBuildingImage(building, offset) {
          var name = _.clone(building.structName).replace(/\s/g, '');
          name = name.toLowerCase();

          if (building instanceof FieldPlant) name = name + (building.isWithered ? 'withered' : '');

          if (building instanceof House) name = name + (building.type + 1).toString();
          // house<level>_...
          else name = name + Math.floor(building.rotation / 10); // <buildingname><side>

          switch (building.structName) {
            case 'Road':
              return buildSpecialTileName(name, function (tile) {
                return tile.buildingData instanceof Road ? 'r' : 'n';
              });

            default:
              return name + '_' + offset.x + '_' + offset.y;
          }
        }

        var canBeOverwritten = true;

        if (tile.buildingData != null) {
          tileImage = getBuildingImage(tile.buildingData, tile.buildingData.isUnder(tile));
          canBeOverwritten = tile.buildingData.canBeOverwritten;
        }

        // (3) ew. budynek testowego (budowanie budynku):

        var wasOverwrittenByTestBuilding = false;

        if (!isColorpicking) {
          if (
            gameplayState.buildMode &&
            gameplayState.testBuilding != undefined &&
            gameplayState.hoveredTile != undefined &&
            canBeOverwritten &&
            tile.islandId != INVALID_ID
          ) {
            for (var i = 0; i < gameplayState.buildingsToPlacement.length; i++) {
              var buildingCoords = gameplayState.buildingsToPlacement[i];

              var offsetX = Math.floor((gameplayState.testBuilding.width - 1) / 2);
              var offsetY = Math.floor((gameplayState.testBuilding.height - 1) / 2);

              var localX = x - buildingCoords.x + offsetX;
              var localY = y - buildingCoords.y + offsetY;

              if (
                localX >= 0 &&
                localX < gameplayState.testBuilding.width &&
                localY >= 0 &&
                localY < gameplayState.testBuilding.height
              ) {
                tileImage = getBuildingImage(
                  gameplayState.testBuilding,
                  tiles.coords(localX, localY),
                );
                wasOverwrittenByTestBuilding = true;
              }
            }
          }
        }

        // ~~~

        if (tileImage != undefined) {
          // special drawing for special modes:

          var mode = 'base';

          if ((gameplayState.buildMode || gameplayState.removeMode) && tile.countryId != 0)
            mode = 'darkner';

          if (
            gameplayState.hoveredTile != undefined &&
            tiles.at_mayRetEmpty(gameplayState.hoveredTile).buildingData != undefined &&
            tiles.at_mayRetEmpty(gameplayState.hoveredTile).buildingData == tile.buildingData
          )
            mode = 'lighter_1';

          if (gameplayState.buildMode && wasOverwrittenByTestBuilding) mode = 'oranger';

          if (gameplayState.removeMode) {
            // TODO: przepisać gameplayState.buildingsToPlacement by wyeliminować tą funkcję
            // ona zżera masę czasu procesora.
            for (var i = 0; i < gameplayState.buildingsToPlacement.length; i++)
              if (
                tile.buildingData ===
                tiles.at_mayRetEmpty(gameplayState.buildingsToPlacement[i]).buildingData
              )
                mode = 'red';
          }

          drawAtlasTile(tileImage, tile, mode);
        }

        // draw porter, if any
        if (porters[tile.index] != undefined)
          drawRawAtlasTile('placeholder_porter' + porters[tile.index]);

        /*
				// draw flag, if any
				if(tile.buildingData != null && tile.buildingData instanceof Port &&
					tiles.index(tile.buildingData.southTile()) == tiles.index(tile)){

					posY -= 80;
					posX += 16;

					drawRawAtlasTile(getFlagForTile(tile, delta));
				}
				else if(tile.buildingData != null && tile.buildingData instanceof Marketplace &&
					tiles.index(tile.buildingData.southTile()) == tiles.index(tile)){

					posY -= 90;
					posX += 25;

					drawRawAtlasTile(getFlagForTile(tile, delta));
				}
				*/
      }
    }

    for (var j = 0; j < militaryUnits.length; j++) {
      var ship = militaryUnits[j];

      if (ship == undefined) continue;

      calculateTilePosition.call(this, ship.position.x, ship.position.y);

      var shipXMovement = ship.rotationVector.x * (ship.lastMoveTime / 1);
      var shipYMovement = ship.rotationVector.y * (ship.lastMoveTime / 1);

      posX += shipXMovement * -32 + shipYMovement * 32;
      posY += shipYMovement * 16 + shipXMovement * 16;

      var x = ship.position.x;
      var y = ship.position.y;

      drawRawAtlasTile('ship_smalltrade_' + ship.rotation);

      // zaznacz jakoś że statek jest zaznaczony
      if (ship === gameplayState.choosedSth && !isColorpicking) {
        drawAtlasTile('ship_smalltrade_' + ship.rotation, tile, 'lighter_3');
      }

      posY -= 64;
      posX += 0;

      drawRawAtlasTile(getFlagForTile(tiles.at(ship.position), delta));
    }

    // faktyczne wyświetlanie
    for (var i = 0; i < toDrawArray.length; i++) {
      var item = toDrawArray[i];

      // aby narysować budynek trzeba sprawdzić czy którykolwiek z jego tilesów
      // znajduje sie na iloście obiektów do narysowania (by go nie rysować gdy jest poza planszą)
      if (tiles.exsist(item.x, item.y)) {
        var tile = tiles[item.x][item.y];

        if (tile != undefined) {
          if (tile.buildingData != null && !(tile.buildingData.structureId in toDrawBuildings))
            continue;

          if (
            tile.terrainLevel >= HILLSIDE &&
            tile.terrainType != undefined &&
            !(tiles.index(tile.terrainType) in toDrawMoutains)
          )
            continue;
        }
      }

      var coords = atlas[item.atlasName];

      if (coords == undefined) continue;

      // rysuje się zawsze od początku tilesa
      var x = item.screenX - Math.floor(coords.w / 2);
      var y = item.screenY - coords.h;

      function drawImage(item, coords, layerName) {
        ctx.drawImage(
          getSourceImage(layerName, item),
          coords.x,
          coords.y,
          coords.w,
          coords.h,
          x,
          y,
          coords.w,
          coords.h,
        );
      }

      // nie używa się specjalnych operacji podczas colorpickingu
      drawImage(
        item,
        coords,
        item.specialMode != undefined && !isColorpicking ? item.specialMode : 'base',
      );
    }
  };
});

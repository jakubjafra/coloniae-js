/*

graphics.js

*/

KEY_ARROW_UP = 38;
KEY_ARROW_DOWN = 40;
KEY_ARROW_LEFT = 37;
KEY_ARROW_RIGHT = 39;

KEYBOARD_MOVE_MAP_DIFF = 20;

define([
  'underscore',
  './logic',
  './graphics/framework',
  './graphics/gameplayState',
  './graphics/drawMethod',
  './graphics/tilePicker',
  './graphics/layerManager',
  './graphics/analytics',
], function (_, Logic, framework, gameplayState, draw, picker, layerManager, analyticModule) {
  var wasAnyAction = false;

  function makeClick(clickedTile, hoverTile, mouseX, mouseY) {
    if (gameplayState.choosedSth instanceof Ship) {
      if (clickedTile.terrainLevel < SHALLOW) {
        console.log(
          'moving ship /#' +
            gameplayState.choosedSth.id +
            '/ to (' +
            clickedTile.x +
            ', ' +
            clickedTile.y +
            ')',
        );

        gameplayState.choosedSth.moveTo(tiles.coords(clickedTile));
      }

      // jak kliknięto w wyspę to usuwamy zaznaczenie na jednostce
      if (clickedTile.islandId != INVALID_ID) gameplayState.choosedSth = undefined;
    }

    // zaznaczenie jednostki
    if (clickedTile.unitId != INVALID_ID)
      gameplayState.choosedSth = militaryUnits[clickedTile.unitId];
    // kliknięcie w budynek
    else if (clickedTile.buildingData != undefined)
      gameplayState.choosedSth = clickedTile.buildingData;
    // albo ostatecznie w nic nie kliknięto.
    else if (!(gameplayState.choosedSth instanceof Ship))
      // <- TODO: to jest chujowe, tymczasowe rozwiązanie
      gameplayState.choosedSth = undefined;

    // TODO: Usunąć to gówno.
    // Przemyśleć jak, przydałby się na pewno jakiś "global controller" do tego typu
    // zmiennych jak gameplayState.choosedSth (może zmiana paradygmatu GUI?)
    if (!wasAnyAction) gameplayState.guiClickHandler(mouseX, mouseY);
  }

  // dodaje budynki na podstawie prostokąta do gameplayState.buildingsToPlacement
  function fillBuildingsToPlacement() {
    gameplayState.buildingsToPlacement = [];

    var fakeBegin = gameplayState.placementRectangle.begin;
    var fakeEnd = gameplayState.placementRectangle.end;

    if (fakeBegin == undefined || fakeEnd == undefined) return;

    var begin = _.clone(fakeBegin);
    var end = _.clone(fakeEnd);

    if (begin.x > end.x) {
      begin.x = fakeEnd.x;
      end.x = fakeBegin.x;
    }

    if (begin.y > end.y) {
      begin.y = fakeEnd.y;
      end.y = fakeBegin.y;
    }

    if (!tiles.exsist(begin) || !tiles.exsist(end)) return;

    for (var i = begin.x; i <= end.x; i += gameplayState.testBuilding.width)
      for (var j = begin.y; j <= end.y; j += gameplayState.testBuilding.height)
        if (canBeBuild(i, j, gameplayState.testBuilding))
          gameplayState.buildingsToPlacement.push(tiles.coords(i, j));
  }

  // dodaje istniejące budynki na podstawie prostokąta do gameplayState.buildingsToPlacement
  function fillBuildingsToRemove() {
    gameplayState.buildingsToPlacement = [];

    var fakeBegin = gameplayState.placementRectangle.begin;
    var fakeEnd = gameplayState.placementRectangle.end;

    if (fakeBegin == undefined || fakeEnd == undefined) return;

    var begin = _.clone(fakeBegin);
    var end = _.clone(fakeEnd);

    if (begin.x > end.x) {
      begin.x = fakeEnd.x;
      end.x = fakeBegin.x;
    }

    if (begin.y > end.y) {
      begin.y = fakeEnd.y;
      end.y = fakeBegin.y;
    }

    if (!tiles.exsist(begin) || !tiles.exsist(end)) return;

    // usuń wszystkie budynki do selektora
    for (var i = begin.x; i <= end.x; i++)
      for (var j = begin.y; j <= end.y; j++)
        if (tiles.exsist(i, j) && tiles.at(i, j).buildingData != null)
          gameplayState.buildingsToPlacement.push(tiles.coords(i, j));
  }

  function endWidePlacement() {
    gameplayState.placementRectangle.begin = tiles.coords(-1, -1);
    gameplayState.placementRectangle.end = tiles.coords(-1, -1);

    gameplayState.buildingsToPlacement = [];

    gameplayState.useWidePlacement = false;
  }

  return new framework(
    new (function () {
      this.resources = ['atlas'];

      this.fullscreen = true;

      this.onKeyDown = function (key) {};
      this.onKeyUp = function (key) {
        switch (key) {
          case KEY_ARROW_UP:
            gameplayState.cameraPosition.y += KEYBOARD_MOVE_MAP_DIFF;
            break;

          case KEY_ARROW_DOWN:
            gameplayState.cameraPosition.y -= KEYBOARD_MOVE_MAP_DIFF;
            break;

          case KEY_ARROW_LEFT:
            gameplayState.cameraPosition.x += KEYBOARD_MOVE_MAP_DIFF;
            break;

          case KEY_ARROW_RIGHT:
            gameplayState.cameraPosition.x -= KEYBOARD_MOVE_MAP_DIFF;
            break;

          default:
            endWidePlacement();

            gameplayState.buildMode = false;
            gameplayState.removeMode = false;
            break;
        }
      };

      this.onMouseEnter = function () {};

      this.onMouseLeave = function () {
        gameplayState.hoveredTile = undefined;

        if (!gameplayState.buildMode || !gameplayState.removeMode) gameplayState.moveMap = false;
        else {
          gameplayState.buildingsToPlacement = [];

          gameplayState.placementRectangle.begin = tiles.coords(-1, -1);
          gameplayState.placementRectangle.end = tiles.coords(-1, -1);

          gameplayState.useWidePlacement = false;
        }
      };

      var oldX = undefined;
      var oldY = undefined;

      var timeout = null;

      this.onMouseMove = function (x, y) {
        // pobieranie hover nad danym tilesem
        gameplayState.hoveredTile = picker.byGeometry(x, y);

        // jeśli myszka się nie rusza to można użyć colorPickingu dla większej dokładności
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          gameplayState.hoveredTile = picker.byColor(x, y);
        }, 100);

        // poruszanie kamerą
        oldX = oldX || x;
        oldY = oldY || y;

        if (gameplayState.moveMap && !(gameplayState.buildMode || gameplayState.removeMode)) {
          gameplayState.cameraPosition.x += x - oldX;
          gameplayState.cameraPosition.y += y - oldY;
        }

        oldX = x;
        oldY = y;

        // ~~~

        // to jest tutaj tylko po to by można było wyświetlić podświetlenie
        // informację dla gracza jakie budynki się gdzie wybudują
        if (
          (gameplayState.buildMode && gameplayState.testBuilding != undefined) ||
          gameplayState.removeMode
        ) {
          gameplayState.placementRectangle.end = picker.byGeometry(x, y);

          if (!gameplayState.useWidePlacement)
            gameplayState.placementRectangle.begin = gameplayState.placementRectangle.end;

          if (gameplayState.buildMode) fillBuildingsToPlacement();
          else fillBuildingsToRemove();
        }
      };

      this.onMouseDown = function (x, y) {
        gameplayState.moveMap = true;

        if (gameplayState.buildMode || gameplayState.removeMode) {
          gameplayState.placementRectangle.begin = picker.byGeometry(x, y);
          gameplayState.useWidePlacement = true;
        }
      };

      this.onMouseUp = function (x, y) {
        gameplayState.moveMap = false;

        // kolejność zawsze jest taka: zdarzenie -> onMouseUp -> onMouseClick
        // ustawienie tutaj tej zmiennej (i ew. poinformowanie że wybudowano coś)
        // usuwa buga powowdującego automatyczne klikniecie w nowo wybudowany budynek
        wasAnyAction = false;

        if (gameplayState.buildMode || gameplayState.removeMode) {
          // uaktualnij placementRectangle
          gameplayState.placementRectangle.end = picker.byGeometry(x, y);

          if (gameplayState.buildMode) {
            fillBuildingsToPlacement();

            // wybuduj budynki z gameplayState.buildingsToPlacement
            for (var i = 0; i < gameplayState.buildingsToPlacement.length; i++) {
              var buildingCoords = gameplayState.buildingsToPlacement[i];

              var structure = structsClass[gameplayState.testBuilding.index];
              new structure.class(
                buildingCoords.x,
                buildingCoords.y,
                countries[0],
                undefined,
                gameplayState.testBuilding.rotation,
              );
            }
          } else {
            fillBuildingsToRemove();

            for (var i = 0; i < gameplayState.buildingsToPlacement.length; i++) {
              var building = tiles.at(gameplayState.buildingsToPlacement[i]).buildingData;

              if (building != null) building.remove();
            }
          }

          // usuń zaznaczenie:

          gameplayState.buildingsToPlacement = [];

          gameplayState.placementRectangle.begin = tiles.coords(-1, -1);
          gameplayState.placementRectangle.end = tiles.coords(-1, -1);

          gameplayState.useWidePlacement = false;

          wasAnyAction = true;
        }
      };

      this.onMouseClick = function (x, y) {
        clickedTile = picker.byColor(x, y);

        if (clickedTile != undefined) {
          console.log('clicked tile (' + clickedTile.x + ', ' + clickedTile.y + ')', false);

          makeClick(clickedTile, gameplayState.hoveredTile, x, y);
        } else console.log('out of board click');
      };

      this.onRender = function (delta, ctx, resources) {
        draw(
          delta,
          ctx,
          gameplayState.cameraPosition,
          function (layerName) {
            return layerManager.getLayer(layerName);
          },
          false,
        );
      };

      this.onUpdate = function (delta) {
        Logic.update(delta);
        analyticModule.update(delta);
      };

      this.onLoadResources = function (resources) {
        layerManager.setBaseLayer(resources['atlas']);

        layerManager.createLayer('lighter_1', function (context, baseLayer) {
          context.globalCompositeOperation = 'lighter';
          context.globalAlpha = 0.1;
          context.drawImage(baseLayer, 0, 0);
        });

        layerManager.createLayer('lighter_3', function (context, baseLayer) {
          context.globalCompositeOperation = 'lighter';
          context.globalAlpha = 0.33;
          context.drawImage(baseLayer, 0, 0);
        });

        layerManager.createLayer('darkner', function (context, baseLayer) {
          context.globalCompositeOperation = 'multiply';
          context.drawImage(baseLayer, 0, 0);
        });

        layerManager.createLayer('oranger_tmp', function (context, baseLayer) {
          context.globalCompositeOperation = 'source-in';
          context.fillStyle = '#CB9A50'; // http://paletton.com/#uid=7050I0kmRmRfLtbjtpupujttbfL
          context.globalAlpha = 0.33;
          context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        });

        layerManager.createLayer('oranger', function (context, baseLayer) {
          context.drawImage(layerManager.getLayer('oranger_tmp'), 0, 0);
        });

        layerManager.createLayer('red_tmp', function (context, baseLayer) {
          context.globalCompositeOperation = 'source-in';
          context.fillStyle = '#9B2E20'; // http://paletton.com/#uid=7050I0kmRmRfLtbjtpupujttbfL
          context.globalAlpha = 0.5;
          context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        });

        layerManager.createLayer('red', function (context, baseLayer) {
          context.drawImage(layerManager.getLayer('red_tmp'), 0, 0);
        });

        // ~~~

        picker.initColorpicking(resources);
      };
    })(),
  );
});

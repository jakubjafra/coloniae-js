/*

tilePicker.js

*/

import { tiles } from '../logic/tile';
import { gameplayState } from '../graphics/gameplayState';
import { drawMethod } from '../graphics/drawMethod';
import { layerManager } from '../graphics/layerManager';

export const tilePicker = new (function () {
  // fast, but choose only tiles, not objects
  this.byGeometry = function (x, y) {
    var arr = [];

    for (var i = 0; i < tiles.size.x; i++) {
      for (var j = 0; j < tiles.size.y; j++) {
        var posX = gameplayState.cameraPosition.x + i * -32 + j * 32;
        var posY = gameplayState.cameraPosition.y + j * 16 + i * 16 - 16;

        if (tiles[i][j].terrainLevel >= 2) posY -= 20;

        if (y >= posY - 16 && y <= posY + 16 && x >= posX - 32 && x <= posX + 32) {
          // magic :)
          function calcMagicDistance(ax, ay, bx, by) {
            return Math.sqrt(((ax - bx) * (ax - bx)) / 2 + (ay - by) * (ay - by) * 2);
          }

          arr.push([calcMagicDistance(posX, posY, x, y), tiles.coords(i, j)]);
        }
      }
    }

    if (arr.length == 0) return undefined;

    arr.sort(function (a, b) {
      return a[0] - b[0];
    });

    return tiles.at(arr[0][1]);
  };

  // ~~~
  // ~~~
  // ~~~

  // canvas po którym się maluje by uzyskać kolor piksela
  // większy canvas jest niepotrzebny
  var colorPickingTestCanvas = document.createElement('canvas');
  colorPickingTestCanvas.width = 1;
  colorPickingTestCanvas.height = 1;

  // dowolna liczba większa od 0 - potrzebne by odróżniać out-of-board od tilesa (0,0)
  var COLOR_PICKING_OFFSET = 1;

  function arrFromIntColor(intColor) {
    var arr = [];

    arr[0] = (intColor >> 16) & 0xff;
    arr[1] = (intColor >> 8) & 0xff;
    arr[2] = intColor & 0xff;

    return arr;
  }

  function colorIntFromArr(arr) {
    var intColor;

    intColor = arr[0];
    intColor = (intColor << 8) + arr[1];
    intColor = (intColor << 8) + arr[2];

    return intColor;
  }

  // ~~~

  this.initColorpicking = function (resources) {
    layerManager.createNewLayer('colorpicking');
  };

  // slower, but very accurate
  this.byColor = function (x, y) {
    if (layerManager.getLayer('colorpicking') == undefined) return;

    var context = colorPickingTestCanvas.getContext('2d');

    var clonedCameraPos = {
      x: gameplayState.cameraPosition.x - x + colorPickingTestCanvas.width / 2,
      y: gameplayState.cameraPosition.y - y + colorPickingTestCanvas.height / 2,
    };

    var colorPickingSourceCanvas_ctx = layerManager.getLayer('colorpicking').getContext('2d');
    colorPickingSourceCanvas_ctx.globalCompositeOperation = 'source-in';

    // undefined informuje metodę draw, że należy obsłużyć color picking
    drawMethod(
      0,
      context,
      clonedCameraPos,
      function (layerName, item) {
        var colorNumber = tiles.index(item.x, item.y);

        colorPickingSourceCanvas_ctx.fillStyle =
          'rgb(' + arrFromIntColor(colorNumber + COLOR_PICKING_OFFSET).join(',') + ')';
        colorPickingSourceCanvas_ctx.fillRect(
          0,
          0,
          colorPickingSourceCanvas_ctx.canvas.width,
          colorPickingSourceCanvas_ctx.canvas.height,
        );

        return colorPickingSourceCanvas_ctx.canvas;
      },
      true,
    );

    var clickedTile = undefined;

    var clickedColor =
      colorIntFromArr(context.getImageData(0, 0, 1, 1).data) - COLOR_PICKING_OFFSET;
    if (clickedColor >= 0 && tiles.exsist(clickedColor)) clickedTile = tiles.at(clickedColor);

    return clickedTile;
  };
})();

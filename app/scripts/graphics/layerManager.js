/*

layerManager.js

*/

var layerManager = new (function () {
  var layers = {};

  this.setBaseLayer = function (baseImage) {
    layers['base'] = baseImage;
  };

  this.createLayer = function (name, callback) {
    var canvas = this.createNewLayer(name);
    var context = canvas.getContext('2d');

    callback.call(undefined, context, this.getLayer('base'));
  };

  this.createNewLayer = function (name) {
    console.assert(!(name in layers));

    layers[name] = document.createElement('canvas');

    layers[name].width = layers['base'].width;
    layers[name].height = layers['base'].height;

    layers[name].getContext('2d').drawImage(layers['base'], 0, 0);

    return layers[name];
  };

  this.getLayer = function (name) {
    return layers[name];
  };
})();

define([], function () {
  return layerManager;
});

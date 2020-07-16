import $ from 'jquery';
import angular from 'angular';

import { products } from '../../logic/product';

import imageTemplate from './views/image.html';
import buildingDialogTemplate from './views/buildingDialog.html';

var directives = angular.module('directives', []);

function makeBuildingImageLink(input) {
  if (input == undefined || input.length == 0) input = 'unknown';

  var name = input.replace(/\s/g, '');
  name = name.toLowerCase();

  if (name == 'port') name += '1';

  var image = 'imgs/gui/buildings/' + name + '.png';
  return image;
}

directives.directive('buildingImage', function () {
  return {
    scope: {
      imgName: '=name',
    },
    link: function (scope) {
      scope.$watch('imgName', function () {
        scope.imgSrc = makeBuildingImageLink(scope.imgName);
      });
    },
    replace: true,
    template: imageTemplate,
  };
});

// ~~~

function makeProductImageLink(input) {
  if (input == undefined) return 'imgs/gui/products/empty.png';

  var productId = parseInt(input);
  var productName = products[productId].name;

  var name = productName.replace(/\s/g, '');
  name = name.toLowerCase();

  var image = 'imgs/gui/products/' + name + '.png';
  return image;
}

directives.directive('productImage', function () {
  return {
    scope: {
      imgName: '=name',
    },
    link: function (scope) {
      scope.$watch('imgName', function () {
        scope.imgSrc = makeProductImageLink(scope.imgName);
      });
    },
    replace: true,
    template: imageTemplate,
  };
});

function makeGoodsImageLink(input) {
  if (input == undefined) return 'imgs/gui/products/empty.png';

  var productId = parseInt(input);
  var productName = products[productId].name;

  var name = productName.replace(/\s/g, '');
  name = name.toLowerCase();

  var image = 'imgs/gui/' + name + '.png';
  return image;
}

directives.directive('goodsImage', function () {
  return {
    scope: {
      imgName: '=name',
    },
    link: function (scope) {
      scope.$watch('imgName', function () {
        scope.imgSrc = makeGoodsImageLink(scope.imgName);
      });
    },
    replace: true,
    template: imageTemplate,
  };
});

function makeRawGuiImage(input) {
  if (input == undefined) return 'imgs/gui/products/empty.png';

  var name = input.replace(/\s/g, '');
  name = name.toLowerCase();

  var image = 'imgs/gui/' + name + '.png';
  return image;
}

directives.directive('rawGuiImage', function () {
  return {
    scope: {
      imgName: '=name',
    },
    link: function (scope) {
      scope.$watch('imgName', function () {
        scope.imgSrc = makeRawGuiImage(scope.imgName);
      });
    },
    replace: true,
    template: imageTemplate,
  };
});

// ~~~

directives.directive('buildingDialog', function () {
  return {
    transclude: true,
    template: buildingDialogTemplate,
    scope: {},
    link: function (scope, element, attrs, foo, transclude) {
      element.addClass('buildingDialog');
      scope.close = function () {
        $(element).hide();
      };

      transclude(scope.$parent, function (content) {
        element.children('div.content').html(content);
      });

      scope.$parent.$watch('building', function () {
        scope.building = scope.$parent.building;
      });
    },
  };
});

export { directives };

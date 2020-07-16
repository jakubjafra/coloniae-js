import Class from '../extend';
import $ from 'jquery';

import { INVALID_ID } from './constants';

export var islands = [];

export var Island = Class.extend(function () {
  this.id = INVALID_ID;

  this.fertility = {}; // urodzajność (domyślnie jest 1)

  this.mainMarketplaces = {}; // countryId -> marketplaceObj

  this.houseGroups = {}; // countryId -> houseGroup[]

  // valid for each hardUpdate:
  this.income = {}; // countryId -> income
  this.maintenance = {}; // countryId -> maintenance

  this.constructor = function () {
    this.id = islands.length;
    islands.push(this);
  };

  this.softUpdate = function (delta) {
    $.each(this.houseGroups, function (i, v) {
      for (var i = v.length - 1; i >= 0; i--) {
        v[i].softUpdate(delta);
      }
    });
  };

  this.hardUpdate = function (delta) {
    $.each(
      this.income,
      $.proxy(function (i, v) {
        this.income[i] = 0;
      }, this),
    );

    $.each(
      this.maintenance,
      $.proxy(function (i, v) {
        this.maintenance[i] = 0;
      }, this),
    );

    $.each(this.houseGroups, function (i, v) {
      for (var i = v.length - 1; i >= 0; i--) {
        v[i].hardUpdate(delta);
      }
    });
  };
});

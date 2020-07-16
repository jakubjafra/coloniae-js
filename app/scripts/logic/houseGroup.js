/*

houseGroup.js

*/

import Class from '../extend';
import $ from 'jquery';
import _ from 'underscore';

import { INVALID_ID } from './constants';
import { FOOD_ID } from './gameDefinitions';
import { haveRequriedResources, useRequiredResources } from './structure';

export const PIONERS = 0;
export const SETTLERS = 1;
export const CITIZENS = 2;
export const MERCHANTS = 3;
export const ARISTOCRATS = 4;

export const VERY_WEALTHY = 2;
export const WEALTHY = 1;
export const NORMAL = 0;
export const STARVING = -1;
export const VERY_STARVING = -1;

export var HouseGroup = Class.extend(function () {
  // identyfikator typu
  this.type = 0;
  // nazwa grupy
  this.name = '';
  // domy o danej grupie ludności
  this.houses = {};

  // przydatne referencje
  this.island = null;
  this.country = null;

  // ilość wszystkich ludzi z danej grupy
  this.totalNumberOfPeople = 0;

  // wymagane surowce do wybudowania domu na ten poziom z poziomu minus jeden
  this.requiredResources = {};

  // wymagany dostęp do budynków użyteczności publicznej
  this.requiredPublicBuildingsMask = 0;

  // dane o konsumpcji, per 100 people per 1 sec
  this.consumption = {}; // id towaru -> consumption per 100 per 1 sec
  this.baseConsumptionCount = 0;

  this.peopleNeededToLevelUp = Infinity;

  this.contentRaw = 0;
  this.contentLevel = 0;
  this.contentTimer = 0;

  this.contentByConsumption = {};

  // postęp w pożeraniu towaru (id towaru -> 0..1)
  this.step = {};

  // bazowa ilość monet generowana przez 1 obywatela danej katagorii
  this.baseIncome = 0;
  this.taxDiff = 0; // niby podatek, ale nie działa :P

  this.constructor = function (island, country) {
    this.island = island;
    this.country = country;
  };

  this.addHouse = function (house) {
    house.type = this.type;
    this.houses[house.id] = house;
  };

  this.removeHouse = function (house) {
    house.type = INVALID_ID;
    delete this.houses[house.id];
  };

  this.softUpdate = function (delta) {};

  this.canUpgrade = function (house) {
    return true;
  };

  this.hardUpdate = function (delta) {
    this.totalNumberOfPeople = 0;

    $.each(
      this.houses,
      $.proxy(function (i, v) {
        this.totalNumberOfPeople += v.people;
      }, this),
    );

    if (this.totalNumberOfPeople == 0) {
      this.contentLevel = 0;
      return;
    }

    var income = this.totalNumberOfPeople * (this.baseIncome + this.taxDiff);

    this.country.coins += (income * delta) / 60;

    if (this.island.income[this.country.id] == undefined) this.island.income[this.country.id] = 0;

    this.island.income[this.country.id] += income || 0;

    var storage = this.island.mainMarketplaces[this.country.id].storage;
    $.each(
      this.consumption,
      $.proxy(function (i, v) {
        i = parseInt(i);

        console.assert(this.consumption[i] != undefined);

        if (typeof this.consumption[i] === 'boolean') {
          this.contentByConsumption[i] = storage.of(i) >= 1 ? 1 : 0;
          return;
        }

        if (this.step[i] == undefined) this.step[i] = 0;

        var eaten = (this.totalNumberOfPeople / 100) * this.consumption[i] * delta + this.step[i];
        this.step[i] = eaten;

        if (eaten == undefined) return;

        console.assert(eaten >= 0);

        var eatenProduct = Math.floor(eaten);

        // jeśli coś zjedzono:
        if (eatenProduct >= 1) {
          this.contentByConsumption[i] = 1;

          // zjedz ile możesz
          var canEat = storage.of(i);
          if (eatenProduct >= canEat) {
            this.contentByConsumption[i] = canEat / eatenProduct;
            eatenProduct = canEat;
          }

          storage.remove(storage.special(i), eatenProduct);
          this.country.coins += eatenProduct;

          this.step[i] = eaten - eatenProduct;
        }

        // by zapobiedz choremu stackowaniu głodu
        if (this.step[i] >= 1) this.step[i] = 1;
      }, this),
    );

    var TAX = 1 + this.taxDiff / (this.type + 1); // podatki
    var AVAILABLE_FACTOR = 20; // im mniejszy tym większy udział dostępnych towarów z następnego tieru

    var content = 0;

    $.each(
      this.contentByConsumption,
      $.proxy(function (i, v) {
        if (typeof this.consumption[i] === 'boolean') {
          content += this.contentByConsumption[i] / AVAILABLE_FACTOR;
        } else content += this.contentByConsumption[i] * (this.consumption[i] * 60);
      }, this),
    );

    // zadowolenie jest płaskie i natychmiastowe
    this.contentRaw = content / (this.baseConsumptionCount * TAX);

    var newContentLevel = (function (raw) {
      if (raw > 1) return VERY_WEALTHY;
      else if (raw <= 1 && raw > 0.9) return WEALTHY;
      else if (raw <= 0.9 && raw > 0.5) return NORMAL;
      else if (raw <= 0.5 && raw > 0.2) return STARVING;
      else return VERY_STARVING;
    })(this.contentRaw);

    if (newContentLevel != this.contentLevel) {
      this.contentLevel = newContentLevel;
      this.contentTimer = 0;
    }

    this.contentTimer += delta;

    var CONTENT_INTERVALS = {};

    CONTENT_INTERVALS[VERY_WEALTHY] = 30;
    CONTENT_INTERVALS[WEALTHY] = 60;
    CONTENT_INTERVALS[STARVING] = 60;
    CONTENT_INTERVALS[VERY_STARVING] = 30;

    var canUpgrade = true; // czy można sprzedawać materiały budowlane obywatelom

    // nie upgraduje się jak nie ma żarcia
    canUpgrade = storage.of(FOOD_ID) > 0;

    // dobrobyt
    if (
      this.contentTimer >= CONTENT_INTERVALS[this.contentLevel] &&
      (this.contentLevel == VERY_WEALTHY || this.contentLevel == WEALTHY)
    ) {
      var housesClone = _.clone(this.houses);

      // jeżeli ludzie z danej grupy są zadowoleni to co minutę
      // rodzi się 1 obywatel LUB 1 dom ma level up

      do {
        var keys = Object.keys(housesClone);
        var rand = Math.floor(Math.random() * (keys.length - 1));
        var house = housesClone[parseInt(keys[rand])];

        if (
          house.people == this.peopleNeededToLevelUp &&
          house.centerTile().publicBuildingMask & this.requiredPublicBuildingsMask &&
          this.canUpgrade(house) &&
          canUpgrade
        ) {
          // level up

          var houseGroups = this.island.houseGroups[this.country.id];
          var marketplace = this.island.mainMarketplaces[this.country.id];

          console.assert(houseGroups[this.type + 1] != undefined);

          if (houseGroups[this.type + 1].contentLevel >= NORMAL) {
            var requiredResources = houseGroups[this.type + 1].requiredResources;

            // muszą być wymagane surowce w magazynie
            if (haveRequriedResources(requiredResources, marketplace)) {
              useRequiredResources(requiredResources, marketplace);

              this.removeHouse(house);
              houseGroups[this.type + 1].addHouse(house);

              break;
            }
          }
        }

        if (house.people < this.peopleNeededToLevelUp) {
          // ogranicznik maksymalny
          // 1 person born

          house.people += 1;
          break;
        }

        delete housesClone[parseInt(keys[rand])];
      } while (Object.keys(housesClone).length > 0);

      this.contentTimer = 0;

      return;
    }

    // głód
    if (
      this.contentTimer >= CONTENT_INTERVALS[this.contentLevel] &&
      (this.contentLevel == VERY_STARVING || this.contentLevel == STARVING)
    ) {
      var keys = Object.keys(this.houses);
      var rand = Math.floor(Math.random() * (keys.length - 1));
      var house = this.houses[keys[rand]];

      house.people -= 1;

      if (house.people <= 0) house.remove();

      var houseGroups = this.island.houseGroups[this.country.id];
      if (
        houseGroups[this.type - 1] != undefined &&
        house.people <= houseGroups[this.type - 1].peopleNeededToLevelUp
      ) {
        // level down

        this.removeHouse(house);
        houseGroups[this.type - 1].addHouse(house);
      }

      this.contentTimer = 0;

      return;
    }
  };

  this.calcConsumptionCount = function () {
    this.baseConsumptionCount = 0;
    $.each(
      this.consumption,
      $.proxy(function (i, v) {
        if (typeof v !== 'boolean') this.baseConsumptionCount += v * 60;
      }, this),
    );
  };
});

/*

militaryUnit.js

*/

import Class from '../extend';

import { INVALID_ID } from './constants';
import { tiles } from './tile';

export var militaryUnits = [];

export const NORTH = 10;
export const NORTH_EAST = 11;
export const EAST = 20;
export const SOUTH_EAST = 21;
export const SOUTH = 30;
export const SOUTH_WEST = 31;
export const WEST = 40;
export const NORTH_WEST = 41;

export function directionFromVector(vector) {
  if (vector.y < 0) {
    if (vector.x < 0) return NORTH_EAST;
    else if (vector.x == 0) return NORTH;
    else return NORTH_WEST;
  } else if (vector.y == 0) {
    if (vector.x < 0) return EAST;
    else if (vector.x == 0) return 0;
    else return WEST;
  } else {
    if (vector.x < 0) return SOUTH_EAST;
    else if (vector.x == 0) return SOUTH;
    else return SOUTH_WEST;
  }
}

// Jednostka wojskowa - porusza się wszędzie, może być tylko 1 na danym tilesie.
export var MilitaryUnit = Class.extend(function () {
  // identyfikator
  this.id = INVALID_ID;
  // aktualna pozycja
  this.position = tiles.coords(-1, -1);
  // aktualna rotacja
  this.rotation = NORTH;
  // aktualny wektor rotacji
  this.rotationVector = tiles.coords(0, 0);

  // czy się porusza
  this.isMoving = false;
  // czas od ostatniej zmiany pozycji
  this.lastMoveTime = 0;
  // tiles końcowy
  this.destination = tiles.coords(-1, -1);
  // znaleziona droga, lista kroków do celu
  this.steps = [];

  // "odwrtoność" speed (im większa tym wolniej statek płynie)
  this.timeNeededToReachNewTile = 1;

  // przynależność państwowa
  this.countryId = INVALID_ID;

  this.constructor = function () {
    this.id = militaryUnits.length;
    militaryUnits.push(this);
  };

  this.setPosition = function (coords) {
    // this.position may be invalid (-1, -1)
    tiles.at_mayRetEmpty(this.position).unitId = INVALID_ID;

    this.position = tiles.coords(coords);
    tiles.at(this.position).unitId = this.id;
  };

  this.calcRotationVectorForMovement = function () {
    var vec_x = tiles.coords(this.steps[0]).x - this.position.x;
    var vec_y = tiles.coords(this.steps[0]).y - this.position.y;

    this.rotationVector = tiles.coords(vec_x, vec_y);
    this.rotation = directionFromVector(this.rotationVector);
  };

  // do dziedziczenia
  this.setupRoute = function (destination, source) {
    return [];
  };

  this.moveTo = function (destination) {
    var wasMovement = false;
    var sourcePos = this.position;

    if (this.steps.length > 0) {
      sourcePos = tiles.coords(this.steps[0]);
      this.steps = [this.steps[0]];

      wasMovement = true;
    }

    this.steps.push.apply(this.steps, this.setupRoute(destination, sourcePos));

    if (this.steps.length > 0 && tiles.index(this.steps[0]) == tiles.index(sourcePos))
      this.steps.splice(0, 1);

    if (this.steps.length == 0) return;

    this.calcRotationVectorForMovement();
    this.isMoving = true;

    if (!wasMovement) this.lastMoveTime = 0;
  };

  this.onStart = function () {};
  this.onReach = function () {};

  this.softUpdate = function (delta) {
    if (!this.isMoving && this.steps.length >= 0) return;

    this.lastMoveTime += delta;

    if (this.lastMoveTime >= this.timeNeededToReachNewTile) {
      this.setPosition(this.steps[0]);
      this.steps.splice(0, 1);

      if (this.steps.length > 0) this.calcRotationVectorForMovement();
      else if (this.steps.length == 0) {
        this.isMoving = false;
        this.onReach();
      }

      this.lastMoveTime = 0;
    }
  };

  this.hardUpdate = function (delta) {};
});

/*

country.js

*/

import Class from '../extend';

import { INVALID_ID, INVALID_TYPE } from './constants';

export var countries = [];

export const PLAYER_COUNTRY = 0; // państwo gracza
export const AI_COUNTRY = 1; // państwa konkurujące z graczem
export const NPC_COUNTRY = 2; // podoczne państwa (tubylcy, plemiona, piraci, itd.)

export var Country = Class.extend(function () {
  // identyfikator
  this.id = INVALID_ID;
  // kto tym krajem zarządza
  this.type = INVALID_TYPE;
  // ilość monet w skarbcu
  this.coins = 0;

  this.constructor = function () {
    this.id = countries.length;
    countries.push(this);
  };
});

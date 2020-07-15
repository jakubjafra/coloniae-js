/*

product.js

*/

import Class from 'extend';

import { INVALID_ID } from './constants';

export var products = [];
export var productsByName = {};

export var Product = Class.extend(function () {
  this.id = INVALID_ID;
  this.name = '';

  this.constructor = function (name) {
    this.id = products.length;
    products.push(this);

    productsByName[name] = this;

    this.name = name;
  };
});

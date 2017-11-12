/*

product.js

*/

var products = [];
var productsByName = {};

var Product = Class.extend(function(){
	this.id = INVALID_ID;
	this.name = "";

	this.constructor = function(name){
		this.id = products.length;
		products.push(this);

		productsByName[name] = this;

		this.name = name;
	}
});
/*

country.js

*/

var countries = [];

PLAYER_COUNTRY = 0; // państwo gracza
AI_COUNTRY = 1; // państwa konkurujące z graczem
NPC_COUNTRY = 2; // podoczne państwa (tubylcy, plemiona, piraci, itd.)

var Country = Class.extend(function(){
	// identyfikator
	this.id = INVALID_ID;
	// kto tym krajem zarządza
	this.type = INVALID_TYPE;
	// ilość monet w skarbcu
	this.coins = 0;

	this.constructor = function(){
		this.id = countries.length;
		countries.push(this);
	};
});
/*

ship.js

*/

var ships = [];

NORTH = 10;
NORTH_EAST = 11;
EAST = 20;
SOUTH_EAST = 21;
SOUTH = 30;
SOUTH_WEST = 31;
WEST = 40;
NORTH_WEST = 41;

function directionFromVector(vector){
	if(vector.y < 0){
		if(vector.x < 0)
			return NORTH_EAST;
		else if(vector.x == 0)
			return NORTH;
		else
			return NORTH_WEST;
	} else if(vector.y == 0){
		if(vector.x < 0)
			return EAST;
		else if(vector.x == 0)
			return 0;
		else
			return WEST;
	} else {
		if(vector.x < 0)
			return SOUTH_EAST;
		else if(vector.x == 0)
			return SOUTH;
		else
			return SOUTH_WEST;
	}
}

function onlyWaterTilesFilter(tile){
	return (tile.terrainLevel < SHALLOW);
}

// Statek, porusza się po morzach, musi mieć inny algorytm szukania drogi (Dijakstra za droga), etc.
var Ship = Class.extend(function(){ // TODO: musi dziedziczyć po "NonCivilianUnit"
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

	this.constructor = function(){
		this.id = ships.length;
		ships.push(this);
	};

	this.setPosition = function(coords){
		// this.position may be invalid (-1, -1)
		tiles.at_noAssert(this.position).unitId = INVALID_ID;

		this.position = tiles.coords(coords);
		tiles.at(this.position).unitId = this.id;
	}

	this.calcRotationVectorForMovement = function(){
		var vec_x = tiles.coords(this.steps[0]).x - this.position.x;
		var vec_y = tiles.coords(this.steps[0]).y - this.position.y;
		
		this.rotationVector = tiles.coords(vec_x, vec_y);
		this.rotation = directionFromVector(this.rotationVector);
	}

	this.moveTo = function(destination){
		this.steps = AStar(
				tiles.index(this.position),
				tiles.index(destination),
				neighbours(true, onlyWaterTilesFilter)
			);

		if(this.steps.length > 0 && tiles.index(this.steps[0]) == tiles.index(this.position)){
			this.steps.splice(0, 1);
		}

		if(this.steps.length == 0)
			return;

		this.calcRotationVectorForMovement();

		this.isMoving = true;

		this.lastMoveTime = 0;
	};

	this.onStart = function(){};
	this.onReach = function(){};

	this.softUpdate = function(delta){
		if(!this.isMoving && this.steps.length >= 0)
			return;

		this.lastMoveTime += delta;

		if(this.lastMoveTime >= this.timeNeededToReachNewTile){
			this.setPosition(this.steps[0]);
			this.steps.splice(0, 1);

			if(this.steps.length > 0)
				this.calcRotationVectorForMovement();
			else if(this.steps.length == 0){
				this.isMoving = false;
				this.onReach();
			}

			this.lastMoveTime = 0;
		}
	};
	this.hardUpdate = function(delta){};
});
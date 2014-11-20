/*

gameplayState.js

*/

var gameplayState = {
	// aktualna pozycja kamery
	cameraPosition: {
			x: 500,
			y: 0
		},

	// czy poruszamy kamerą gry
	moveMap: false,

	// czy wybrano jakiś budynek do wybudowania
	buildMode: false,

	// wybrany budynek do wybudowania gdy się kliknie w miejsce które pozwala go wybudować
	testBuilding: undefined,

	// testBuilding powielone na obszar wyznaczony przez przeciągnięcie myszką
	buildingsToPlacement: [],

	// czy używamy przeciągania (jeżeli nie używamy przeciągania to używa się po prostu clik-to-build)
	useWidePlacement: false,

	// obszar wyznaczony myszką po kliknięciu w trybie buildMode
	placementRectangle: {
		begin: undefined,
		end: undefined
	},

	// tryb gdzie kliknięcie w budynek oznacza jego usunięcie
	removeMode: false,
	
	// tile nad którym aktualnie znajduje się kursor
	hoveredTile: undefined,

	// cokolwiek klikniętego przez usera (może to być budynek, statek, etc.)
	choosedSth: undefined,

	// id budynku ponad którym jest myszka w build mode
	buildMenuHover: undefined,

	// dla gui.js (usunąć to stąd!)
	guiClickHandler: function(){}
};

define([], function(){
	return gameplayState;
})
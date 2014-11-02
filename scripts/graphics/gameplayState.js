/*

gameplayState.js

*/

define([], function(){
	var gameplayState = {
		// aktualna pozycja kamery
		cameraPosition: {
				x: 500,
				y: 0
			},

		// czy wybrano jakiś budynek do wybudowania
		buildMode: false,

		// wybrany budynek do wybudowania gdy się kliknie w miejsce które pozwala go wybudować
		testBuilding: undefined,

		// informuje czy testBuilding może być postawione hoveredTile
		testCanBe: false,

		// tryb gdzie kliknięcie w budynek oznacza jego usunięcie
		removeMode: false,
		
		// tile nad którym aktualnie znajduje się kursor
		hoveredTile: undefined,

		// cokolwiek klikniętego przez usera (może to być budynek, statek, etc.)
		choosedSth: undefined,

		// dla gui.js (usunąć to stąd!)
		clickHandler: function(){}
	};

	return gameplayState;
})
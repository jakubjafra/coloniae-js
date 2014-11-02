/*

graphics.js

*/

define(['./graphics/framework', './logic', './graphics/gameplayState', './graphics/drawMethod', './graphics/tilePicker'], function(framework, Logic, gameplayState, draw, picker){
	function makeClick(clickedTile, hoverTile, mouseX, mouseY){
		if(gameplayState.choosedSth instanceof Ship){
			if(clickedTile.terrainLevel < SHALLOW){
				console.log("moving ship /#" + gameplayState.choosedSth.id + "/ to (" + clickedTile.x + ", " + clickedTile.y + ")");

				gameplayState.choosedSth.moveTo(tiles.coords(clickedTile));
			}

			// jak kliknięto w wyspę to usuwamy zaznaczenie na jednostce
			if(clickedTile.islandId != INVALID_ID)
				gameplayState.choosedSth = undefined;
		}

		/*	tu "else" nie może być bo jeśli mając focusa na statku kliknięto w wyspę
		to najprawdopodobniej by wybrać jakiś budynek więc nie można blokować tej
		akcji żadnym "else" */

		var wasAnyAction = false;

		// budowa budynku
		if(gameplayState.buildMode && gameplayState.testBuilding != undefined){
			var structure = structsClass[gameplayState.testBuilding.__structId];

			// używa się hoverTile bo clickedTile czasami zwraca złe wyniki nad drzewami
			// i przez to obsuwa budynek budowany w stronę gracza
			new structure.class(hoverTile.x,
								hoverTile.y,
								countries[0],
								undefined,
								gameplayState.testBuilding.rotation);

			wasAnyAction = true;
		}

		// usunięcie budynku
		if(gameplayState.removeMode && clickedTile.buildingData != null){
			clickedTile.buildingData.remove();

			wasAnyAction = true;
		}

		// zaznaczenie jednostki
		if(clickedTile.unitId != INVALID_ID)
			gameplayState.choosedSth = militaryUnits[clickedTile.unitId];
		// kliknięcie w budynek
		else if(clickedTile.buildingData != undefined)
			gameplayState.choosedSth = clickedTile.buildingData;
		// albo ostatecznie w nic nie kliknięto.
		else if(!(gameplayState.choosedSth instanceof Ship)) // <- TODO: to jest chujowe, tymczasowe rozwiązanie
			gameplayState.choosedSth = undefined;

		// TODO: Usunąć to gówno.
		// Przemyśleć jak, przydałby się na pewno jakiś "global controller" do tego typu
		// zmiennych jak gameplayState.choosedSth (może zmiana paradygmatu GUI?)
		if(!wasAnyAction)
			gameplayState.clickHandler(mouseX, mouseY);
	}

	return new framework(new function(){
		this.resources = [ "atlas" ];

		this.fullscreen = true;

		var moveMap = false;

		this.onMouseEnter = function(){};

		this.onMouseLeave = function(){
			gameplayState.hoveredTile = undefined;

			moveMap = false;
		};

		var oldX = undefined;
		var oldY = undefined;

		this.onMouseMove = function(x, y){
			// pobieranie hover nad danym tilesem
			gameplayState.hoveredTile = picker.byGeometry(x, y);

			// poruszanie kamerą
			if(moveMap){
				oldX = oldX || x;
				oldY = oldY || y;

				gameplayState.cameraPosition.x += (x - oldX);
				gameplayState.cameraPosition.y += (y - oldY);

				oldX = x;
				oldY = y;
			}

			// jeśli jesteśmy w build mode trzeba sprawdzić czy wybrany budynek może zostać wybudowany
			// w aktualnie shoverowanym tilesie
			if(gameplayState.buildMode && gameplayState.hoveredTile != undefined && gameplayState.testBuilding != undefined){
				gameplayState.testCanBe = canBeBuild(gameplayState.hoveredTile.x, gameplayState.hoveredTile.y, gameplayState.testBuilding);
			}
		};

		this.onMouseDown = function(x, y){
			moveMap = true;
		};

		this.onMouseUp = function(x, y){
			moveMap = false;
		};

		this.onMouseClick = function(x, y){
			clickedTile = picker.byColor(x, y);
			hoverTile = picker.byGeometry(x, y);

			if(clickedTile != undefined){
				console.log("clicked tile (" + clickedTile.x + ", " + clickedTile.y + ")");
				
				makeClick(clickedTile, hoverTile, x, y);
			} else
				console.log("out of board click");
		};

		this.onRender = function(delta, ctx, resources){
			draw(delta, ctx, gameplayState.cameraPosition, function(){ return resources["atlas"]; }, false);
		};
		
		this.onUpdate = function(delta){
			Logic.update(delta);
		};

		this.onLoadResources = function(resources){
			picker.initColorpicking(resources);
		};
	});
});
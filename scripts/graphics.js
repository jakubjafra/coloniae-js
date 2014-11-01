/*

graphics.js

*/

define(['jquery', 'three-stats', './graphics/framework', 'text!../imgs/atlas.json', './logic'], function($, Stats, framework, atlasJSON, Logic){
	return  new framework(new function(){
		this.cameraPosition = { x: 500, y: 0 };

		this.gameStarted = true;
		
		this.buildMode = false;
		this.removeMode = false;
		this.testBuilding = undefined;

		this.resources = [ "atlas" ];
		var atlas = JSON.parse(atlasJSON);

		this.fullscreen = true;

		this.getTileOnScreen = function(x, y){
			if(tiles.size == undefined) // WTF
				return;

			var arr = [];

			for(var i = 0; i < tiles.size.x; i++){
				for(var j = 0; j < tiles.size.y; j++){
					var posX = this.cameraPosition.x + i * -32 + j * 32;
					var posY = this.cameraPosition.y + j * 16 + i * 16 - 16;

					if(tiles[i][j].terrainLevel >= 2)
						posY -= 20;

					if(	y >= (posY - 16) && y <= (posY + 16) &&
						x >= (posX - 32) && x <= (posX + 32) ){
						// magic :)
						function calcMagicDistance(ax, ay, bx, by){
							return Math.sqrt((ax - bx) * (ax - bx) / 2 + (ay - by) * (ay - by) * 2);
						}

						arr.push([calcMagicDistance(posX, posY, x, y), tiles.coords(i, j)]);
					}
				}
			}

			if(arr.length == 0)
				return undefined;

			arr.sort(function(a, b){
				return a[0] - b[0];
			});

			return tiles.at(arr[0][1]);
		};

		var context = undefined;
		var colorPicking_canvas = document.createElement('canvas');

		// dowolna liczba większa od 0 - potrzebne by odróżniać out-of-board od tilesa (0,0)
		var COLOR_PICKING_OFFSET = 1;

		function arrFromIntColor(intColor){
			var arr = [];

			arr[0] = (intColor >> 16) & 0xFF;
			arr[1] = (intColor >> 8) & 0xFF;
			arr[2] = intColor & 0xFF;

			return arr;
		}

		function colorIntFromArr(arr){
			var intColor;

			intColor = arr[0];
			intColor = (intColor << 8) + arr[1];
			intColor = (intColor << 8) + arr[2];

			return intColor;
		}

		function initColorpicking(resources){
			colorPicking_canvas.width = resources["atlas"].width;
			colorPicking_canvas.height = resources["atlas"].height;

			context = colorPicking_canvas.getContext('2d');
			context.drawImage(resources["atlas"], 0, 0);
		}

		this.colorPicker = function(x, y){
			var context = $("#canvas_onclick")[0].getContext("2d");

			var clonedCameraPos = _.clone(this.cameraPosition);

			this.cameraPosition = {
				x: clonedCameraPos.x - x + context.canvas.width / 2,
				y: clonedCameraPos.y - y + context.canvas.height / 2
			};
			
			// undefined informuje metodę draw, że należy obsłużyć color picking
			this.draw(0, context, undefined);
			
			this.cameraPosition = clonedCameraPos;

			var clickedTile = undefined; // = this.getTileOnScreen(x, y); <- old method

			var clickedColor = colorIntFromArr(context.getImageData(0, 0, 1, 1).data) - COLOR_PICKING_OFFSET;
			if(clickedColor >= 0)
				clickedTile = tiles.at(clickedColor);

			return clickedTile;
		}

		this.hoveredTile = undefined;

		// cokolwiek klikniętego przez usera (może to być budynek, statek, etc.)
		this.choosedSth = undefined;

		var moveMap = false;
		var wasMoved = false;
		var lastMouseDown = 0;

		this.onMouseEnter = function(){};
		this.onMouseLeave = function(){
			this.hoveredTile = undefined;
			moveMap = false;
		};

		var oldX = undefined;
		var oldY = undefined;

		this.onMouseMove = function(x, y){
			oldX = oldX || x;
			oldY = oldY || y;

			this.hoveredTile = this.getTileOnScreen(x, y);

			if(moveMap){
				this.cameraPosition.x += (x - oldX);
				this.cameraPosition.y += (y - oldY);

				wasMoved = true;
			}

			if(this.buildMode && this.hoveredTile != undefined && this.testBuilding != undefined){
				this.testCanBe = canBeBuild(this.hoveredTile.x, this.hoveredTile.y, this.testBuilding);
			}

			oldX = x;
			oldY = y;
		};

		this.onMouseDown = function(x, y){
			moveMap = true;
			wasMoved = false;
			lastMouseDown = (new Date()).getTime();
		};

		this.clickHandler = function(){};

		this.makeClick = function(clickedTile, mouseX, mouseY){
			if(this.choosedSth instanceof Ship){
				if(clickedTile.terrainLevel < SHALLOW){
					console.log("moving ship /#" + this.choosedSth.id + "/ to (" + clickedTile.x + ", " + clickedTile.y + ")");

					this.choosedSth.moveTo(tiles.coords(clickedTile));
				}

				// jak kliknięto w wyspę to usuwamy zaznaczenie na jednostce
				if(clickedTile.islandId != INVALID_ID)
					this.choosedSth = undefined;
			}

			/*	tu "else" nie może być bo jeśli mając focusa na statku kliknięto w wyspę
			to najprawdopodobniej by wybrać jakiś budynek więc nie można blokować tej
			akcji żadnym "else" */

			var wasAnyAction = false;

			// budowa budynku
			if(this.buildMode && this.testBuilding != undefined){
				var structure = structsClass[this.testBuilding.__structId];

				new structure.class(clickedTile.x,
									clickedTile.y,
									countries[0],
									undefined,
									this.testBuilding.rotation);

				wasAnyAction = true;
			}

			// usunięcie budynku
			if(this.removeMode && clickedTile.buildingData != null){
				clickedTile.buildingData.remove();

				wasAnyAction = true;
			}

			// zaznaczenie jednostki
			if(clickedTile.unitId != INVALID_ID)
				this.choosedSth = militaryUnits[clickedTile.unitId];
			// kliknięcie w budynek
			else if(clickedTile.buildingData != undefined)
				this.choosedSth = clickedTile.buildingData;
			// albo ostatecznie w nic nie kliknięto.
			else if(!(this.choosedSth instanceof Ship)) // <- TODO: to jest chujowe, tymczasowe rozwiązanie
				this.choosedSth = undefined;

			// TODO: Usunąć to gówno.
			// Przemyśleć jak, przydałby się na pewno jakiś "global controller" do tego typu
			// zmiennych jak this.choosedSth (może zmiana paradygmatu GUI?)
			if(!wasAnyAction)
				this.clickHandler(mouseX, mouseY);
		}

		this.onMouseUp = function(x, y){
			moveMap = false;

			if(!wasMoved || ((new Date()).getTime() - lastMouseDown) < 200){
				clickedTile = this.colorPicker(x, y);

				if(clickedTile != undefined){
					console.log("clicked tile (" + clickedTile.x + ", " + clickedTile.y + ")");
					
					this.makeClick(clickedTile, x, y);
				} else
					console.log("out of board click");
			}
		};

		this.draw = function(delta, ctx, resources){ // TODO: przepisać to
			ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

			var porters = {}; // [porterPosition] -> porterType

			// update porters positions to display
			for(var i = 0; i < civilianUnits.length; i++){
				var porter = civilianUnits[i];

				if(!(porter instanceof Porter))
					continue;

				if(porter.position.x != -1 && porter.position.y != -1 && porter.isBusy)
					porters[tiles.index(porter.position)] = (porter.origin instanceof Marketplace ? 1 : 2);
			}

			var screenSize = tiles.coords(ctx.canvas.width, ctx.canvas.height);
			var screenMarginSize = 100;

			var toDrawArray = [];

			var toDrawBuildings = {};
			var toDrawMoutains = {};

			var margin = 0;

			var posX, posY;
			function calculateTilePosition(x, y){
				posX = this.cameraPosition.x + x * -32 + y * 32;
				posY = this.cameraPosition.y + y * 16 + x * 16;
			}

			// TODO: rysować tylko widoczne tilesy...
			for(var x = -margin; x < tiles.size.x + margin; x++){
				for(var y = -margin; y < tiles.size.y + margin; y++){
					calculateTilePosition.call(this, x, y);

					var outOfScreen = (posX < -screenMarginSize || posY < -screenMarginSize || posX > (screenSize.x + screenMarginSize) || posY > (screenSize.y + screenMarginSize));

					function drawRawAtlasTile(atlasName, mode){
						toDrawArray.push({
							atlasName: atlasName,
							x: x,
							y: y,
							screenX: posX,
							screenY: posY,
							isVisible: !outOfScreen,
							specialMode: _.clone(mode)
						});
					}

					function drawAtlasTile(atlasName, tile, mode){
						drawRawAtlasTile(atlasName, mode);

						if(tile != undefined){
							if(!outOfScreen && tile.buildingData != null)
								toDrawBuildings[tile.buildingData.structureId] = true;

							if(!outOfScreen && tile.terrainLevel >= HILLSIDE && tile.terrainType != undefined)
								toDrawMoutains[tiles.index(tile.terrainType)] = true;
						}
					}

					// ~~~

					if(!tiles.exsist(x, y)){
						if(!outOfScreen)
							drawAtlasTile("sea1", undefined);

						continue;
					}

					var tile = tiles[x][y];
					var tileImage = "";

					if(outOfScreen){
						if(!(tile.terrainLevel >= HILLSIDE ||
							(tile.buildingData != undefined && tile.buildingData.width > 1 && tile.buildingData.height > 1)))
							continue;
					}

					// (1) teren:

					function buildSpecialTileName(name, hash){
						function getTile(x, y){
							if(tiles[x] == undefined || tiles[x][y] == undefined)
								return (new Tile());

							return tiles[x][y];
						}

						return name +	"_" + hash(getTile(x + 1, y)) +
										"_" + hash(getTile(x, y + 1)) +
										"_" + hash(getTile(x - 1, y)) +
										"_" + hash(getTile(x, y - 1));
					}

					switch(tile.terrainLevel){
						case SEA:
								tileImage = "sea1";
							break;

						case SHALLOW:
								tileImage = buildSpecialTileName("shallow1", function(tile){
									switch(tile.terrainLevel){
										case 0: return 'h';
										case 1: return 'c';
										default: return 's';
									}
								});
							break;

						case COAST:
								tileImage = buildSpecialTileName("coast1", function(tile){
									switch(tile.terrainLevel){
										case 0: return 's';
										case 1: return 'c';
										default: return 'i';
									}
								});
							break;

						case PLAINS:
								tileImage = "grassland1";
							break;

						case HILLSIDE:
								tileImage = buildSpecialTileName("hillside1", function(tile){
									switch(tile.terrainLevel){
										case 3: return 'h';
										case 4: return 'm';
										default: return 'i';
									}
								});
							break;

						case MOUTAIN:
								var localX = x - tile.terrainType.x;
								var localY = y - tile.terrainType.y;

								tileImage = "moutain1_" + localX + "_" + localY;
							break;
					}

					// tilesy wyspy są na wyższym poziomie niż reszta :)
					if(tile.terrainLevel >= PLAINS)
						posY -= 20;

					// (2) budynek:

					function getBuildingImage(building, offset){
						var name = _.clone(building.structName).replace(/\s/g, '');
						name = name.toLowerCase();

						if(building instanceof FieldPlant)
							name = name + (building.isWithered ? "withered" : "");

						if(building instanceof House)
							name = name + (building.type + 1).toString(); // house<level>_...
						else
							name = name + Math.floor(building.rotation / 10); // <buildingname><side>

						switch(building.structName){
							case "Road":
								return buildSpecialTileName(name, function(tile){
									return (tile.buildingData instanceof Road ? 'r' : 'n');
								});

							default:
								return name + "_" + offset.x + "_" + offset.y;
						}
					}

					var canBeOverwritten = true;

					if(tile.buildingData != null){
						tileImage = getBuildingImage(tile.buildingData, tile.buildingData.isUnder(tile));
						canBeOverwritten = tile.buildingData.canBeOverwritten;
					}

					// (3) ew. budynek testowego (budowanie budynku):

					if( this.buildMode && this.testBuilding != undefined &&
						this.hoveredTile != undefined && canBeOverwritten && tile.islandId != INVALID_ID ){
						var offsetX = Math.floor((this.testBuilding.width - 1) / 2);
						var offsetY = Math.floor((this.testBuilding.height - 1) / 2);

						var localX = x - this.hoveredTile.x + offsetX;
						var localY = y - this.hoveredTile.y + offsetY;

						if( localX >= 0 && localX < this.testBuilding.width &&
							localY >= 0 && localY < this.testBuilding.height ){
							// jeżeli można wybudować w danym miejscu to wyświetla się budynek,
							// jeśli nie to placeholder (by jakoś to wyglądało)
							if(this.testCanBe)
								tileImage = getBuildingImage(this.testBuilding, tiles.coords(localX, localY));
							else{
								if(tile.terrainLevel == this.testBuilding.requiredTerrainMap[localX][localY])
									tileImage = "placeholder_moutain";
							}
						}
					}

					// ~~~

					if(tileImage != undefined){
						drawAtlasTile(tileImage, tile);

						// special drawing for special modes:

						if((this.buildMode || this.removeMode) && tile.countryId != 0){
							drawAtlasTile(tileImage, tile, {
								"globalCompositeOperation": "multiply"
							});
						}

						if(this.hoveredTile != undefined &&
						   tiles.at(this.hoveredTile).buildingData != undefined &&
						   tiles.at(this.hoveredTile).buildingData == tile.buildingData){
							drawAtlasTile(tileImage, tile, {
								"globalCompositeOperation": "lighter",
								"globalAlpha": (this.removeMode ? 0.5 : 0.1)
							});
						}
					}

					// draw porter, if any
					if(porters[tile.index] != undefined)
						drawRawAtlasTile("placeholder_porter" + porters[tile.index]);
				}
			}

			for(var j = 0; j < militaryUnits.length; j++){
				var ship = militaryUnits[j];

				if(ship == undefined)
					continue;

				calculateTilePosition.call(this, ship.position.x, ship.position.y);

				var shipXMovement = ship.rotationVector.x * ((ship.lastMoveTime) / 1);
				var shipYMovement = ship.rotationVector.y * ((ship.lastMoveTime) / 1);

				posX += (shipXMovement * -32 + shipYMovement * 32);
				posY += (shipYMovement * 16 + shipXMovement * 16);

				var x = ship.position.x;
				var y = ship.position.y;

				drawRawAtlasTile("ship_smalltrade_" + ship.rotation);
			}

			var colorNumber = 0;
			var colorPicking_context = colorPicking_canvas.getContext('2d');

			// faktyczne wyświetlanie
			for(var i = 0; i < toDrawArray.length; i++){
				function getSourceImage(coords){
					if(resources == undefined){
						colorPicking_context.globalCompositeOperation = 'source-in';

						colorPicking_context.fillStyle = "rgb(" + arrFromIntColor(colorNumber).join(",") + ")";
						colorPicking_context.fillRect(0, 0, colorPicking_canvas.width, colorPicking_canvas.height);

						return colorPicking_canvas;
					} else
						return resources;
				}

				function realDrawAtlasTile(atlasName, x, y, mode){
					var coords = atlas[atlasName];

					if(coords == undefined)
						return;

					// rysuje się zawsze od początku tilesa
					x = x - Math.floor(coords.w / 2);
					y = y - coords.h;

					function drawImage(){
						ctx.drawImage(
							getSourceImage(coords),
							coords.x, coords.y, coords.w, coords.h,
							x, y, coords.w, coords.h
						);
					}

					if(mode == undefined || resources == undefined)
						drawImage();
					else {
						ctx.save();

						for(var key in mode){
							ctx[key] = mode[key];
						}

						drawImage();

						ctx.restore();
					}
				}

				var item = toDrawArray[i];

				colorNumber = tiles.index(item.x, item.y) + COLOR_PICKING_OFFSET;

				if(tiles.exsist(item.x, item.y)){
					var tile = tiles[item.x][item.y];

					if(tile != undefined){
						if(tile.buildingData != null &&
							!(tile.buildingData.structureId in toDrawBuildings))
							continue;

						if(tile.terrainLevel >= HILLSIDE && tile.terrainType != undefined &&
							!(tiles.index(tile.terrainType) in toDrawMoutains))
							continue;
					}
				}

				realDrawAtlasTile(item.atlasName, item.screenX, item.screenY, item.specialMode);
			}
		};

		this.onRender = function(delta, ctx, resources){
			this.draw(delta, ctx, resources["atlas"]);
		};
		
		this.onUpdate = function(delta){
			if(this.gameStarted)
				Logic.update(delta);
		};

		this.onLoadResources = function(resources){
			initColorpicking(resources);
		};
	});
});
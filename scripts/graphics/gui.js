/*

gui.js

Dodać tutuaj listę kontrolerów do update i updateować jak wszystko inne.

TODO: Usunąć "clickHandler" - gui.js ma być jedynie odzwierciedleniem stanu graphics.js
a nie samemu wpływać na ten stan...

*/

define(['angular', '../graphics', '../logic', '../graphics/gameplayState', 'extend', 'underscore'], function(angular, graphics, logic, gameplayState){
	// niestety angular sam nie updateuje zmian z "other sources"
	// więc trzeba samemu callować zmianę $scopa co jakiś czas
	function registerInfiniteUpdate(scope, func){
		// natychmiastowy update
		func();

		// następne co jakiś interwał czasowy
		setInterval(function(){ scope.$apply(func); }, 100);
	}

	// ~~~

	var app = angular.module("app", []);

	app.controller("CoinsViewer", function($scope){
		registerInfiniteUpdate($scope, function(){
			$scope.coins = countries[0].coins;
		});
	});

	app.controller("OwnedIslandResourcesViewer", function($scope){
		registerInfiniteUpdate($scope, function(){
			$scope.hoverOnIsland = (gameplayState.hoveredTile != undefined) && (gameplayState.hoveredTile.countryId != INVALID_ID);
			if($scope.hoverOnIsland){
				var island = islands[gameplayState.hoveredTile.islandId];

				$scope.tool = island.mainMarketplaces[0].storage.of(TOOLS_ID);
				$scope.wood = island.mainMarketplaces[0].storage.of(WOOD_ID);
				$scope.brick = island.mainMarketplaces[0].storage.of(BRICKS_ID);
			}
		});
	});

	app.controller("IslandPopulationViewer", function($scope){
		registerInfiniteUpdate($scope, function(){
			$scope.hoverOnIsland = (gameplayState.hoveredTile != undefined) && (gameplayState.hoveredTile.countryId != INVALID_ID);
			if($scope.hoverOnIsland){
				var houseGroups = islands[gameplayState.hoveredTile.islandId].houseGroups[0];

				$scope.population = 0;
				if(houseGroups != undefined){
					for(var i = 0; i < houseGroups.length; i++){
						$scope.population += houseGroups[i].totalNumberOfPeople;
					}
				}
			}
		});
	});

	// ~~~

	app.controller("TimeCtrl", function($scope){
		$scope.timeController = logic;
	});

	// ~~~

	var buildingDlgs = {
		"#HouseDlg": "#HouseDlg",
		"#MarketplaceDlg": "#MarketplaceDlg",
		"#ProductionBuildingDlg": "#ProductionBuildingDlg"
	};

	function showBuildingDlg(x, y){
		if(gameplayState.choosedSth == undefined || !(gameplayState.choosedSth instanceof Building))
			return;

		var structName = gameplayState.choosedSth.structName;

		if(gameplayState.choosedSth instanceof Port)
			structName = "Marketplace";

		if(gameplayState.choosedSth instanceof ProductionBuilding)
			structName = "ProductionBuilding";

		var id = ("#" + structName + "Dlg");

		if(buildingDlgs[id] == undefined)
			return;

		$(id).css({"top": y + "px", "left": x + "px"});
		$(id).show();

		$(id).scope().$apply(function($scope){
			$scope.building = gameplayState.choosedSth;
			registerInfiniteUpdate($scope, $scope.onBuildingBind);
		});
	}

	function makeCloseThisHandler(id){
		return function(){ $(id).hide(); };
	}

	function closeAllBuildingDlgs(){
		$(buildingDlgs.join(",")).hide();
	}

	gameplayState.clickHandler = function(x, y){
		showBuildingDlg(x, y);
	};

	app.controller("HouseCtrl", function($scope){
		$scope.close = makeCloseThisHandler("#HouseDlg");
		$scope.building = undefined;

		$scope.onBuildingBind = function(){
			var island = islands[$scope.building.centerTile().islandId];
			var country = countries[$scope.building.centerTile().countryId];

			$scope.houseGroup = island.houseGroups[country.id][$scope.building.type];
		};
	});

	app.controller("MarketplaceCtrl", function($scope){
		$scope.close = makeCloseThisHandler("#MarketplaceDlg");
		$scope.building = undefined;

		$scope.income = 0;
		$scope.maintenance = 0;

		$scope.storage = {};
		$scope.productsLookup = products;

		$scope.onBuildingBind = function(){
			var island = islands[$scope.building.centerTile().islandId];
			var country = countries[$scope.building.centerTile().countryId];

			$scope.income = island.income[country.id] || 0;
			$scope.maintenance = island.maintenance[country.id] || 0;

			$scope.storage = island.mainMarketplaces[country.id].storage.slots;
		};
	});

	app.controller("ProductionBuildingCtrl", function($scope){
		$scope.close = makeCloseThisHandler("#ProductionBuildingDlg");
		$scope.building = undefined;

		$scope.storage = {};
		$scope.productsLookup = products;

		$scope.onBuildingBind = function(){
			$scope.storage = $scope.building.storage.slots;

			$scope.effectivity = 0;

			if($scope.building instanceof Farm)
				$scope.effectivity = $scope.building.effectivity;
			else if($scope.building instanceof Workshop)
				$scope.effectivity = ($scope.building.canProduce() ? 1 : 0);

			$scope.maintenance = $scope.building.operatingCost.on;
		};
	});

	// ~~~

	app.filter('putBuildingImage', function(){
		return function(input){
			if(input == undefined || input.length == 0)
				input = "unknown";

			var name = input.replace(/\s/g, '');
			name = name.toLowerCase();

			if(name == "port")
				name += "1";

			var image = 'imgs/gui/buildings/' + name + '.png';
			return image;
		};
	});

	app.controller("BuildCtrl", function($scope){
		$scope.callback = gameplayState;
		
		$scope.choosedBuilding = -1;
		$scope.allBuildings = structsClass.slice(1, structsClass.length);

		$scope.beginHoverBuilding = function(){
			var index = INVALID_ID;
			if(this.building != undefined)
				index = this.building.index || this.building.__structId;

			index = parseInt(index);

			var structure = structsClass[index];
			gameplayState.buildMenuHover = new structure.class(0, 0, null, undefined);
			gameplayState.buildMenuHover.onBuild();
		};

		$scope.endHoverBuilding = function(){
			gameplayState.buildMenuHover = undefined;
		};

		$scope.startRemoveMode = function(){
			$scope.callback.buildMode = false;
			$scope.callback.removeMode = !$scope.callback.removeMode;

			$scope.choosedBuilding = -1;
			
			$scope.callback.testBuilding = undefined;
		};

		$scope.buildModeStateChange = function(){
			$scope.callback.buildMode = false;
			$scope.callback.removeMode = false;

			$scope.choosedBuilding = -1;

			$scope.callback.testBuilding = undefined;
		};

		$scope.chooseBuildingStateChange = function(){};

		$scope.chooseBuilding = function(){
			$scope.callback.buildMode = true;
			$scope.callback.removeMode = false;

			if(this.building != undefined)
				$scope.choosedBuilding = this.building.index || this.building.__structId;

			var choosed = parseInt($scope.choosedBuilding);

			$scope.side = NORTH;
			if($scope.callback.testBuilding != undefined && choosed === $scope.callback.testBuilding.__structId)
				$scope.side = $scope.callback.testBuilding.rotation;
			
			if(choosed >= 0){
				var structure = structsClass[choosed];
				
				$scope.callback.testBuilding = new structure.class(0, 0, null, undefined, $scope.side);

				$scope.callback.testBuilding.onBuild();

				$scope.callback.testBuilding.__structId = choosed;
			}
		};

		var dlgList = ["#buildmenu"];
		var handlers = ["#buildhandler", "#removehandler"];

		function toggleDlgFor(name, handler){
			var isVisible = $(handler).hasClass("handler_on") || $(name).is(':visible');

			$(dlgList.join(",")).hide();
			$(handlers.join(",")).removeClass("handler_on");

			if(!isVisible){
				$(name).show();
				$(handler).addClass("handler_on");
			}
		}

		$scope.showBuildDlg = function(){
			if($scope.callback.testBuilding != undefined)
				$scope.buildModeStateChange();
			else
				toggleDlgFor("#buildmenu", "#buildhandler");
		};

		$scope.showRemoveDlg = function(){
			toggleDlgFor(undefined, "#removehandler");
		};
	});

	app.filter('rotationLetterByCode', function(){
		return function(input){
			switch(parseInt(input)){
				case NORTH: return 'N';
				case SOUTH: return 'S';
				case EAST: return 'E';
				case WEST: return 'W';
				default: return '?';
			}
		};
	});

	app.filter('putProductImage', function(){
		return function(input){
			if(input == undefined || typeof input !== "number")
				return 'imgs/gui/products/empty.png';

			var productId = parseInt(input);
			var productName = products[productId].name;

			var name = productName.replace(/\s/g, '');
			name = name.toLowerCase();

			var image = 'imgs/gui/products/' + name + '.png';
			return image;
		};
	});

	app.controller("BuildingExtInfo", function($scope){
		registerInfiniteUpdate($scope, function(){
			var bindedTo = undefined;
			if(gameplayState.testBuilding != undefined)
				bindedTo = gameplayState.testBuilding;
			else if(gameplayState.buildMenuHover != undefined)
				bindedTo = gameplayState.buildMenuHover;

			$scope.buildingName = "";

			$scope.tool = 0;
			$scope.wood = 0;
			$scope.brick = 0;
			$scope.coins = 0;

			$scope.rotation = 0;

			$scope.isFarm = false;
			$scope.isWorkshop = false;

			$scope.changeSide = function(){
				if(bindedTo != undefined){
					var currentIndex;
					for(currentIndex = 0; currentIndex < bindedTo.possibleRotation.length; currentIndex++)
						if(bindedTo.rotation == bindedTo.possibleRotation[currentIndex])
							break;

					var newRotation = bindedTo.possibleRotation[
						(currentIndex + 1) % bindedTo.possibleRotation.length
					];

					if(newRotation == bindedTo.rotation){
						console.log("this building cannot be rotated yet");
						return;
					}

					bindedTo.rotation = newRotation;

					$scope.chooseBuilding();
				}
			};

			if(bindedTo != undefined){
				$scope.buildingName = bindedTo.structName;

				$scope.rotation = bindedTo.rotation;

				$scope.isFarm = bindedTo instanceof Farm;
				$scope.isWorkshop = bindedTo instanceof Workshop;

				if(bindedTo instanceof ProductionBuilding){
					$scope.output = bindedTo.storage.catagories[OUTPUT];

					$scope.input_1 = bindedTo.storage.catagories[INPUT_1];
					$scope.input_2 = bindedTo.storage.catagories[INPUT_2];

					$scope.inputCrop = bindedTo.requiredCrop;
				}

				$scope.tool = bindedTo.requiredResources[TOOLS_ID];
				$scope.wood = bindedTo.requiredResources[WOOD_ID];
				$scope.brick = bindedTo.requiredResources[BRICKS_ID];
				$scope.coins = bindedTo.requiredResources[INVALID_ID];
			}
		});
	});

	return new function(){
		this.start = function(){
			console.log("starting AngularJS");
			angular.bootstrap(document.body, ["app"]);

			// ~~~

			// ...
		};
	};
});
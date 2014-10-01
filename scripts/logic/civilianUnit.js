/*

civilianUnit.js

*/

var civilianUnits = [];

// Jednostka cywilna - porusza się z budynku do budynku po drogach.
var CivilianUnit = Class.extend(function(){
	// identyfikator
	this.id = INVALID_ID;
	// budynek z którego się porusza
	this.sourceBuilding = null;
	// budynek do którego się porusza
	this.destinationBuilding = null;
	// aktualna pozycja (tile)
	this.position = tiles.coords(-1, -1);
	// lista kroków do celu
	this.steps = [];
	// czy wykonuje poruszanie
	this.isBusy = false;
	// czas od ostatniej zmiany tilesa przy poruszaniu
	this.lastMoveTime = 0;

	this.constructor = function(){
		this.id = civilianUnits.length;
		civilianUnits.push(this);
	}

	function findRoute(sourceBuilding, targetBuilding){
		/*
			Dijkstra

			implementacja algorytmu szukania drogi

			Graph - lista wszystkich węzłów
			source - węzeł startowy
			target - węzeł końcowy
			neighborFunc(x) - funkcja która ma zwrocić wszystkie regiony obok danego
			lengthFunc(x, y) - funkcja która ma zwrocić odległość między dwoma regionami
			
			ret -> trasę jeśli istnieje, jeśli nie zwraca false
		*/
		function Dijkstra(Graph, source, target, neighborFunc, lengthFunc){
			var dist = {}; dist[source] = 0;
			var previous = {};
			var Q = [];

			$.each(Graph, function(i,v){
				if(v != source){
					dist[v] = Infinity;
					previous[v] = undefined;
				}

				Q.push(v);
			});

			function source_node_with_min_dist(){
				var searchArr = [];
				for(var i = 0; i < Q.length; i++){
					searchArr.push([Q[i], dist[Q[i]]]);
				}
				searchArr.sort(function(a, b){
					return a[1] - b[1];
				});
				return searchArr[0][0];
			}

			while(Q.length > 0){
				var u = source_node_with_min_dist();

				if(u == target){
					var S = [];
					var u_cpy = u;

					// find real head
					while(previous[u] != undefined && lengthFunc(u, previous[u]) == 1)
						u = previous[u];

					if(previous[u] == undefined){
						// skrajny przypadek, budynki stykają się ścianami
						var u = u_cpy;

						while(previous[u] != undefined){
							var v = previous[u];
							if(tiles[tiles.coords(u).x][tiles.coords(u).y].buildingData != tiles[tiles.coords(v).x][tiles.coords(v).y].buildingData){
								S.push(tiles.coords(u));
								S.push(tiles.coords(v));
								S.reverse();
								return S;
							}
							u = v;
						}

						// skrajny przypadek, szukamy drogi do tego samego pola
						return false;
					} else{
						// push real head
						S.push(tiles.coords(u));

						// find body, stop at tail
						for(; previous[u] != undefined; u = previous[u]){
							if(lengthFunc(u, previous[u]) == 10)
								S.push(tiles.coords(previous[u]));
							else 
								break;
						}

						S.reverse();
						return S;
					}
				}

				Q.splice(Q.indexOf(u), 1);

				$.each(neighborFunc(u), function(i, v){
					var alt = dist[u] + lengthFunc(u, v);
					if(alt < dist[v]){
						dist[v] = alt;
						previous[v] = u;
					}
				});
			}

			return false;
		}

		function indexAllBuildingTiles(tilesUnderBuilding){
			var arr = [];
			$.each(tilesUnderBuilding, function(i,v){
				arr.push(tiles.index(v));
			});
			return arr;
		}

		var srcB = indexAllBuildingTiles(sourceBuilding.tilesUnder);
		var dstB = indexAllBuildingTiles(targetBuilding.tilesUnder);

		var Q = _.clone(roads);
		Q = Q.concat(srcB);
		Q = Q.concat(dstB);

		function tileNeighbours(ofThisTile){
			var tile = tiles.coords(ofThisTile);

			var arr = [];

			if((tile.x - 1) >= 0) 			arr.push(tiles.index(tile.x - 1, tile.y));
			if((tile.x + 1) < tiles.size.x) arr.push(tiles.index(tile.x + 1, tile.y));
			if((tile.y - 1) >= 0) 			arr.push(tiles.index(tile.x, tile.y - 1));
			if((tile.y + 1) < tiles.size.y) arr.push(tiles.index(tile.x, tile.y + 1));

			return arr;
		}

		function movementCost(tileA, tileB){
			if(	!(tiles.at(tileA).buildingData instanceof Road) &&
				!(tiles.at(tileB).buildingData instanceof Road) )
				return 1;
			else
				return 10;
		}

		return Dijkstra(Q, srcB[0], dstB[0], tileNeighbours, movementCost);
	}

	this.setupRoute = function(source, dest){
		this.sourceBuilding = source;
		this.destinationBuilding = dest;

		this.steps = findRoute(this.sourceBuilding, this.destinationBuilding);

		if(this.steps != false) {
			this.position = this.steps[0];
			this.lastMoveTime = 1;

			this.isBusy = true;
			this.onStart();

			return true;
		}

		return false;
	};

	this.onStart = function(){};
	this.onReach = function(){};

	this.softUpdate = function(delta){
		if(!this.isBusy)
			return;

		this.lastMoveTime += delta;

		if(this.lastMoveTime >= 0.5){
			if(this.steps.length == 0 && this.isBusy == true){
				this.isBusy = false;
				this.onReach();
			} else{
				this.position = this.steps[0];
				this.steps.splice(0, 1);
			}

			this.lastMoveTime = 0;
		}
	};

	this.hardUpdate = function(delta){};
});
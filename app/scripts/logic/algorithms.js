/*

algorithms.js

*/

function neighbours(cross, filter){
	return function(ofThisTile){
		var tile = tiles.coords(ofThisTile);

		function insert(x, y){
			if(!tiles.exsist(x, y))
				return;

			if(filter && !filter(tiles.at(x, y)))
				return;

			arr.push(tiles.index(x, y));
		}

		var arr = [];

		insert(tile.x - 1, tile.y);
		insert(tile.x + 1, tile.y);
		insert(tile.x, tile.y - 1);
		insert(tile.x, tile.y + 1);

		if(cross){
			insert(tile.x - 1, tile.y - 1);
			insert(tile.x + 1, tile.y - 1);
			insert(tile.x - 1, tile.y + 1);
			insert(tile.x + 1, tile.y + 1);
		}

		return arr;
	};
}

function distanceManhattan(a, b){
	var a_coords = tiles.coords(a);
	var b_coords = tiles.coords(b);

	return Math.abs(a_coords.x - b_coords.x) + Math.abs(a_coords.y - b_coords.y);
}

function distanceEuclideanPow(a, b){
	var a_coords = tiles.coords(a);
	var b_coords = tiles.coords(b);

	return (a_coords.x - b_coords.x) * (a_coords.x - b_coords.x) + (a_coords.y - b_coords.y) * (a_coords.y - b_coords.y);
}

function distanceEuclidean(a, b){
	return Math.sqrt(distanceEuclideanPow(a, b));
}

/*
	AStar

	implementacja algorytmu szukania drogi, w miarę ogólny algorytm

	source - węzeł startowy
	target - węzeł końcowy
	neighbourFunc(x) - funkcja która ma zwrocić wszystkie regiony obok danego
	lengthFunc(x, y) - funkcja która ma zwrocić odległość między dwoma regionami
	
	ret -> trasę jeśli istnieje, jeśli nie zwraca false
*/
function AStar(source, target, neighbourFunc, lengthFunc){
	closedset = {};
	openset = {};
	came_from = {};

	g_score = {};
	f_score = {};

	lengthFunc = distanceEuclidean || lengthFunc;
	heuristic_cost_estimate = distanceEuclideanPow;

	openset[source] = true;
	g_score[source] = 0;
	f_score[source] = g_score[source] + heuristic_cost_estimate(source, target);

	function openset_node_having_lowest_f_score_value(){
		var searchArr = [];

		$.each(openset, function(i, v){
			if(v == undefined)
				return true;

			i = parseInt(i);
			searchArr.push([i, f_score[i]]);
		});

		searchArr.sort(function(a, b){
			return a[1] - b[1];
		});

		return searchArr[0][0];
	}

	function reconstruct_path(came_from, current_node){
		if(came_from[current_node] != undefined){
			var arr = [];

			arr.push(current_node);
			arr = arr.concat(reconstruct_path(came_from, came_from[current_node]));
			
			return arr;
		}
		else
			return [current_node];
	}

	while(openset.length != 0){
		current = openset_node_having_lowest_f_score_value();

		if(current == target){
			var reverseRoute = reconstruct_path(came_from, target);
			reverseRoute.reverse();
			return reverseRoute;
		}

		openset[current] = undefined;
		closedset[current] = true;

		var neighbours = neighbourFunc(current);
		for(var i = 0; i < neighbours.length; i++){
			var neighbour = neighbours[i];

			if(closedset[neighbour] != undefined)
				continue;

			var tentative_g_score = g_score[current] + lengthFunc(current, neighbour);

			if(openset[neighbour] == undefined || tentative_g_score < g_score[neighbour]){
				came_from[neighbour] = current;
				g_score[neighbour] = tentative_g_score;
				f_score[neighbour] = g_score[neighbour] + heuristic_cost_estimate(neighbour, target);
				
				if(openset[neighbour] == undefined)
					openset[neighbour] = true;
			}
		}
	}

	return false;
}
/*

presenter.js

Zrobić z tego moduł (używający jquery i innych bibliotek na własną rekę).

*/

define([], function(){

	function Presenter(){
		this.canvas = $("#canvas3d");

		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas[0], antialias: true });
		this.renderer.setSize($(this.canvas).width(), $(this.canvas).height());
		this.renderer.setClearColor(0x000000, 1);

		this.camera = new THREE.PerspectiveCamera(75, $(this.canvas).width() / $(this.canvas).height(), 0.1, 1000);
		this.camera.position = new THREE.Vector3(5, 10, 8);
		this.camera.up = new THREE.Vector3(0,1,0);
		this.camera._lookAtVec = new THREE.Vector3(5,0,4);
		this.camera.lookAt(this.camera._lookAtVec); // lol

		this.ambientLight = new THREE.AmbientLight(0xFFFFFF);
		this.scene.add(this.ambientLight);

		this.clock = new THREE.Clock();

		var does = false;

		this.buildmode = false;
		this.testBuilding = undefined;

		this.changedtiles = [];

		function undoMaterial(){
			for(var i = 0; i < this.changedtiles.length; i++){
				this.changedtiles[i].material.ambient.offsetHSL(0,0, -0.1);
			}
		}

		function doMaterial(){
			this.changedtiles = [];
			for(var x = 0; x < tiles.size.x; x++){
				for(var y = 0; y < tiles.size.y; y++){
					var tile = tiles[x][y];

					if(tile.countryId != 0){
						tile.__tile.material.ambient.offsetHSL(0, 0, 0.1);
						this.changedtiles.push(tile.__tile);
					}
				}
			}
		}

		$('#buildmode').change($.proxy(function(){
			this.buildmode = !this.buildmode;

			if(this.buildmode == false){
				if(this.testBuilding != undefined)
					this.scene.remove(this.testBuilding.__object);
				this.testBuilding = undefined;
				curpos = undefined;

				undoMaterial();
			} else{
				$("#buildtype").val(-1);
				doMaterial();
			}
		}, this));

		$(this.canvas).mousedown($.proxy(function(){
			does = true;
			oldPosition = undefined;
		}, this));

		$(this.canvas).mouseup($.proxy(function(){
			does = false;
		}, this));

		var oldPosition = undefined;
		this.hoverTile = undefined;

		$(this.canvas).mousemove($.proxy(function(e){
			var X = e.pageX - $(this.canvas).offset().left;
			var Y = e.pageY - $(this.canvas).offset().top;

			var dat = this.getObjectRenderedAt(X, Y);
			if(dat != null){
				this.hoverTile = tiles.at(dat.position);

				$("#hover").html("");
				if(this.hoverTile != undefined){
					$("#hover").append("lvl="+this.hoverTile.terrainLevel+"<br/>");
					if(this.hoverTile.buildingData != undefined){
						$("#hover").append("name="+this.hoverTile.buildingData.structName+"<br/>");
					}
				}
			} else{
				this.hoverTile = undefined;
			}

			

			if(does){
				if(oldPosition == undefined){
					oldPosition = { x: e.pageX, y: e.pageY };
					return;
				}

				makeclick = false;

				var diffX = (oldPosition.x - e.pageX) / 50;
				var diffY = (oldPosition.y - e.pageY) / 50;

				this.camera.position.x += diffX;
				this.camera._lookAtVec.x += diffX;

				this.camera.position.z += diffY;
				this.camera._lookAtVec.z += diffY;

				this.camera.lookAt(this.camera._lookAtVec);

				oldPosition = { x: e.pageX, y: e.pageY };
			}

			if(this.buildmode){
				var X = e.pageX - $(this.canvas).offset().left;
				var Y = e.pageY - $(this.canvas).offset().top;

				var dat = this.getObjectRenderedAt(X, Y);

				if(dat != undefined){
					if(this.testBuilding != undefined){
						this.scene.remove(this.testBuilding.__object);

						curpos = tiles.coords(dat.position);

						var offsetX = Math.floor((this.testBuilding.width - 1) / 2);
						var offsetY = Math.floor((this.testBuilding.height - 1) / 2);

						mkbuilding.call(this, this.testBuilding, curpos.x - offsetX, curpos.y - offsetY);
					}
				}
			}
		}, this));

		$("#buildtype").change($.proxy(function(){
			if(this.buildmode){
				if(this.testBuilding != undefined)
					this.scene.remove(this.testBuilding.__object);

				this.testBuilding = new structsClass[$("#buildtype").val()].class(0, 0, null);
			}
		}, this));

		var curpos = undefined;

		$(this.canvas).mouseleave(function(){
			does = false;
			oldPosition = undefined;
			makeclick = false;
		});

		$(this.canvas).mousewheel($.proxy(function(e){
			this.camera.position.y += -e.deltaY;
			this.camera.lookAt(this.camera._lookAtVec);
		}, this));

		// disable page scrolling
		$('html, body').css({
			'overflow': 'hidden',
			'height': '100%'
		});

		// select dla build mode
		$.each(structsClass, function(i, v){
			$("#buildtype").append('<option value="' + i +'">' + v.name + '</option>');
		});

		var makeclick = true;
		$(this.canvas).click($.proxy(function(e){
			if(makeclick){
				if(this.buildmode){
					new structsClass[$("#buildtype").val()].class(curpos.x, curpos.y, countries[0]);

					undoMaterial();
					doMaterial();
				} else{
					var X = e.pageX - $(this.canvas).offset().left;
					var Y = e.pageY - $(this.canvas).offset().top;

					console.log(this.getObjectRenderedAt(X, Y));
				}
			}
			makeclick = true;
		}, this));

		this.allRenderableObjs = [];
		this.getObjectRenderedAt = function(x, y){
			if(x == undefined || y == undefined)
				return null;

			var _x = ( x / $(this.canvas).width() ) * 2 - 1;
			var _y = ( y / $(this.canvas).height() ) * -2 + 1;

			var vector = new THREE.Vector3(_x, _y, 0.5);
			(new THREE.Projector()).unprojectVector(vector, this.camera);

			var cameraPosition = new THREE.Vector3(0, 0, 0);
			cameraPosition.setFromMatrixPosition(this.camera.matrixWorld);

			var intersections = (new THREE.Raycaster(cameraPosition, vector.sub(cameraPosition).normalize())).intersectObjects(this.allRenderableObjs, true);

			if(intersections.length > 0)
				return intersections[0].object.userData;
			else
				return null;
		}

		stats = initFpsCounter();

		var this_ = this;
		this.onFrame = function(){
			(function(){
				stats.begin();
				var delta = this.clock.getDelta();

				update(delta); // !!!

				this.updateBuildings();
				this.updatePorters();

				for(var i = 0; i < this.allRenderableObjs.length; i++){
					// jeżeli usunięto obiekt z logiki usuń też obiekt ze sceny
					var obj = this.allRenderableObjs[i];
					if(obj != undefined && obj.userData != null){
						if(obj.userData.type == 1 && buildings[obj.userData.id] == undefined){
							this.scene.remove(obj);
							this.allRenderableObjs.splice(i, 1);
						}
					}
				}

				this.renderer.render(this.scene, this.camera);

				requestAnimationFrame(this.onFrame);
				stats.end();
			}).call(this_);
		};

		this.updatePorters = function(){
			for(var i = 0; i < civilianUnits.length; i++){
				var porter = civilianUnits[i];
				if(!(porter instanceof Porter))
					continue;

				if(porter.__pushedToScene == undefined){
					// must add here

					var x = porter.position.x;
					var y = porter.position.y;

					var level = 1.002;

					var geometry = new THREE.CircleGeometry(0.5, 16);


					var matrix = new THREE.Matrix4();
					matrix.makeTranslation(-0.5, -0.5, 0);
					geometry.applyMatrix(matrix);

					var color;
					if(porter.ownedBy instanceof Marketplace)
						color = "#FF0000";
					else
						color = "#0000FF"

					var material = new THREE.MeshLambertMaterial({ color: color, ambient: color, side: THREE.FrontSide });

					var plane = new THREE.Mesh(geometry, material);

					plane.position.set(x, level, y);
					plane.lookAt(new THREE.Vector3(x, (level + 1) ,y));

					this.scene.add(plane);
					// this.allRenderableObjs.add(plane);

					porter.__pushedToScene = plane;
				}

				// update position

				porter.__pushedToScene.position.x = porter.position.x;
				porter.__pushedToScene.position.z = porter.position.y;

				if(porter.position.x < 0 || porter.position.y < 0){
					porter.__pushedToScene.visible = false;
				} else{
					porter.__pushedToScene.visible = true;
				}
			}
		};

		function mkbuilding(building, x, y){
				
				var level = 1.001;

				var geometry = new THREE.PlaneGeometry(building.height, building.width, 1, 1);

				var matrix = new THREE.Matrix4();
				matrix.makeTranslation(-building.height / 2, -building.width / 2, 0);
				geometry.applyMatrix(matrix);

				var color = "#FF0000";
				var dat = building;

				if(dat instanceof FieldPlant)
					color = "#00FF00";
				else if(dat instanceof Road)
					color = "#964B00";
				else if(dat instanceof StorageBuilding){
					if(dat instanceof Marketplace)
						color = "#AA0000";
					else
						color = "#AA00AA";
				}
				else if(dat instanceof House)
					color = "#0000AA";

				var material = new THREE.MeshLambertMaterial({ color: color, ambient: color, side: THREE.FrontSide });

				var plane = new THREE.Mesh(geometry, material);

				plane.position.set(x, level, y);
				plane.lookAt(new THREE.Vector3(x, (level + 1) ,y));

				this.scene.add(plane);

				building.__object = plane;

				return plane;
			}

		var buildingsByStructureId = {};

		this.updateBuildings = function(){
			for(var i = 0; i < structures.length; i++){
				if(structures[i] != undefined && structures[i].__pushedToScene == undefined){
					var x = structures[i].tilesUnder[0].x;
					var y = structures[i].tilesUnder[0].y;

					var plane = mkbuilding.call(this, structures[i], x, y);

					plane.userData = { type: (structures[i] instanceof Building ? 1 : 2), structId: structures[i].structureId, id: structures[i].id, position: tiles.index(x, y) };
					this.allRenderableObjs.push(plane);

					buildingsByStructureId[i] = plane;

					structures[i].__pushedToScene = true;
				} else if(structures[i] == undefined){
					if(buildingsByStructureId[i] != undefined){
						this.scene.remove(buildingsByStructureId[i]);
						delete buildingsByStructureId[i];
					}
				}
			}
		};

		// ~~~
		// ~~~
		// ~~~

		// budowanie planszy gry

		for(var x = 0; x < tiles.size.x; x++){
			for(var y = 0; y < tiles.size.y; y++){
				var tile = tiles[x][y];

				var level = (tile.terrainLevel / 2);

				var color;
				// http://paletton.com/#uid=52o1b0klluWftFjfMEErTs9s7rH
				switch(tile.terrainLevel){
					case 0: color = "#3D71A0"; break;
					case 1: color = "#F7CF52"; break;
					case 2: color = "#AEE54C"; break;
					case 3: color = "#AAAAAA"; break;
					default: color = "#000000"; break;
				}


				var geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

				var matrix = new THREE.Matrix4();
				matrix.makeTranslation(-0.5, -0.5, 0);
				geometry.applyMatrix(matrix);

				var material = new THREE.MeshLambertMaterial({ color: color, ambient: color, side: THREE.FrontSide });

				var plane = new THREE.Mesh(geometry, material);

				plane.position.set(x, level, y);
				plane.lookAt(new THREE.Vector3(x, (level + 1) ,y));

				this.scene.add(plane);
				tile.__tile = plane;

				plane.userData = { type: 0, id: INVALID_ID, position: tiles.index(x, y) };
				this.allRenderableObjs.push(plane);
			}
		}

		this.scene.add(new THREE.AxisHelper(2));
	};

	var hardUpdateInterval = 1.0; // co sekundę
	var hardUpdateCount = 0.0;
	function update(delta){
		var przyspieszenie = 4;

		hardUpdateCount += delta;
		while(hardUpdateCount >= hardUpdateInterval){
			for(var i = 0; i < structures.length; i++){
				if(structures[i] != undefined)
					structures[i].hardUpdate(hardUpdateInterval * przyspieszenie);
			}

			for(var i = 0; i < civilianUnits.length; i++){
				if(islands[i] != undefined)
					civilianUnits[i].hardUpdate(hardUpdateInterval * przyspieszenie);
			}

			for(var i = 0; i < islands.length; i++){
				if(islands[i] != undefined)
					islands[i].hardUpdate(hardUpdateInterval * przyspieszenie);
			}

			hardUpdateCount -= hardUpdateInterval;
		}

		for(var i = 0; i < structures.length; i++){
			if(structures[i] != undefined)
				structures[i].softUpdate(delta);
		}

		for(var i = 0; i < civilianUnits.length; i++){
			if(civilianUnits[i] != undefined)
				civilianUnits[i].softUpdate(delta);
		}

		for(var i = 0; i < islands.length; i++){
			if(islands[i] != undefined)
				islands[i].softUpdate(delta);
		}
	}

	function initFpsCounter(){
		var stats = new Stats();
		stats.setMode(0); // 0: fps, 1: ms

		// Align top-left
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.right = '0px';
		stats.domElement.style.bottom = '0px';

		$("body").append(stats.domElement);

		return stats;
	}

	return function(){
		this.start = function(){
			(new Presenter()).onFrame();
		};
	};
});
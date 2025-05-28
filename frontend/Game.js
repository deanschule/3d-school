import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';

import { Capsule } from 'three/addons/math/Capsule.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { MeshLine, MeshLineRaycast } from 'three.meshline';

import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { setupSearchField } from "./RoomHandler";
import { getPath } from "./services/PathService";

//import Box from './Box.js';
//import Player from './Player.js';


export default function Game() {
	const clock = new THREE.Clock();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x88ccee);
	scene.fog = new THREE.Fog(0x88ccee, 0, 50);

	const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.rotation.order = 'YXZ';

	const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
	fillLight1.position.set(2, 1, 1);
	scene.add(fillLight1);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
	directionalLight.position.set(- 5, 25, - 1);
	directionalLight.castShadow = true;
	directionalLight.shadow.camera.near = 0.01;
	directionalLight.shadow.camera.far = 500;
	directionalLight.shadow.camera.right = 18;
	directionalLight.shadow.camera.left = - 18;
	directionalLight.shadow.camera.top = 18;
	directionalLight.shadow.camera.bottom = - 18;
	directionalLight.shadow.mapSize.width = 5000;
	directionalLight.shadow.mapSize.height = 5000;
	directionalLight.shadow.radius = 20;
	directionalLight.shadow.bias = - 0.0006;
	scene.add(directionalLight);

	const container = document.getElementById('container');

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.ShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	container.appendChild(renderer.domElement);

	/*
		const stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		container.appendChild(stats.domElement);
	*/
	const PlayerStartX = 2.7;

	const PlayerStartZ = 7.7;


	const GRAVITY = 30;

	const STEPS_PER_FRAME = 5;

	const worldOctree = new Octree();

	const playerCollider = new Capsule(new THREE.Vector3(PlayerStartX, 0.35, PlayerStartZ), new THREE.Vector3(PlayerStartX, 1, PlayerStartZ), 0.35);

	const playerVelocity = new THREE.Vector3();
	const playerDirection = new THREE.Vector3();

	let playerOnFloor = false;
	let mouseTime = 0;

	const keyStates = {};

	const vector1 = new THREE.Vector3();
	const vector2 = new THREE.Vector3();
	const vector3 = new THREE.Vector3();

	document.addEventListener('keydown', (event) => {

		keyStates[event.code] = true;

	});

	document.addEventListener('keyup', (event) => {

		keyStates[event.code] = false;

	});

	container.addEventListener('mousedown', () => {

		document.body.requestPointerLock();

		mouseTime = performance.now();

	});

	document.body.addEventListener('mousemove', (event) => {

		if (document.pointerLockElement === document.body) {

			camera.rotation.y -= event.movementX / 500;
			camera.rotation.x -= event.movementY / 500;

		}

	});

	window.addEventListener('resize', onWindowResize);

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}

	function playerCollisions() {

		const result = worldOctree.capsuleIntersect(playerCollider);

		playerOnFloor = false;

		if (result) {

			playerOnFloor = result.normal.y > 0;

			if (!playerOnFloor) {

				playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));

			}

			if (result.depth >= 1e-10) {

				playerCollider.translate(result.normal.multiplyScalar(result.depth));

			}

		}

	}

	var playerPosition

	function updatePlayer(deltaTime) {

		let damping = Math.exp(- 4 * deltaTime) - 1;

		if (!playerOnFloor) {

			playerVelocity.y -= GRAVITY * deltaTime;

			// small air resistance
			damping *= 0.1;

		}

		playerVelocity.addScaledVector(playerVelocity, damping);

		const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
		playerCollider.translate(deltaPosition);

		playerCollisions();

		camera.position.copy(playerCollider.end);
		playerPosition = camera.position;

		//console.log(camera.position);
	}

	function getForwardVector() {

		camera.getWorldDirection(playerDirection);
		playerDirection.y = 0;
		playerDirection.normalize();

		return playerDirection;

	}

	function getSideVector() {

		camera.getWorldDirection(playerDirection);
		playerDirection.y = 0;
		playerDirection.normalize();
		playerDirection.cross(camera.up);

		return playerDirection;

	}

	function controls(deltaTime) {

		// gives a bit of air control
		const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

		if (keyStates['KeyW']) {

			playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));

		}

		if (keyStates['KeyS']) {

			playerVelocity.add(getForwardVector().multiplyScalar(- speedDelta));

		}

		if (keyStates['KeyA']) {

			playerVelocity.add(getSideVector().multiplyScalar(- speedDelta));

		}

		if (keyStates['KeyD']) {

			playerVelocity.add(getSideVector().multiplyScalar(speedDelta));

		}

		if (playerOnFloor) {

			if (keyStates['Space']) {

				playerVelocity.y = 15;

			}

		}

	}

	//
	//const doorePositions = {objectName: "", x: 0, y :0, z: 0}

	let arrayCount = 0;

	const rows = 10;
	const cols = 3;

	const doorePositions = Array(rows).fill().map(() => Array(cols).fill(0));

	const doorePositionsName = Array(rows).fill("");

	//GLTF Loader
	const loader = new GLTFLoader().setPath('./models/Schule Export/Schule Export/');

	//load school with GLTF Loader
	loader.load('school_modify_addedd1.gltf', (gltf) => {
		gltf.scene.scale.set(4, 4, 4);
		gltf.scene.name = 'school';
		scene.add(gltf.scene);

		//worldOctree.fromGraphNode(gltf.scene);

		gltf.scene.traverse(child => {

			if (child.isMesh) {

				child.castShadow = true;
				child.receiveShadow = true;

				if (child.material.map) {

					child.material.map.anisotropy = 8;
				}

				if (child.name.includes('door_entrance')) {
					//Add collidor
					worldOctree.fromGraphNode(child);

					const helper = new OctreeHelper(worldOctree);
					helper.name = 'schoolOctree' + child.name;
					//for debug set to true:
					helper.visible = false;
					scene.add(helper);
				}

				if (child.name.includes('Plane')) {
					//Add collidor
					worldOctree.fromGraphNode(child);

					const helper = new OctreeHelper(worldOctree);
					helper.name = 'schoolOctree' + child.name;
					helper.visible = false;
				}
			}

			if (child.name.includes('door_entrance')) {
				//Add collidor
				/*worldOctree.fromGraphNode(child);

				const helper = new OctreeHelper(worldOctree);
				helper.name = 'schoolOctree' + child.name;
				//for debug set to true:
				helper.visible = false;
				scene.add(helper);
				*/
				//console.log(child);
				doorePositionsName[arrayCount] = child.name;


				doorePositions[arrayCount][0] = child.position.x;
				doorePositions[arrayCount][1] = child.position.y;
				doorePositions[arrayCount][2] = child.position.z;
				arrayCount++;
				//doorePositions.push(child.name, child.position.x, child.position.y, child.position.z);

				//console.log(child.name + " position = ");
				//console.log(child.position)
			}

			/*
			if (child.name === "glass_door_1" || child.name === "glass_door_2") {

				//doorePositions.push(child.name, child.position.x, child.position.y, child.position.z);

				doorePositionsName[arrayCount] = child.name;
				doorePositions[arrayCount][0] = child.position.x;
				doorePositions[arrayCount][1] = child.position.y;
				doorePositions[arrayCount][2] = child.position.z;
				arrayCount++;

				console.log(child.name + " position = ");
				console.log(child.position);
			}*/

		});

		const helper = new OctreeHelper(worldOctree);
		helper.name = 'schoolOctree'
		helper.visible = false;
		scene.add(helper);

		//console.log(doorePositions);
		//console.log(doorePositionsName);

		/*
		const gui = new GUI( { width: 200 } );
		gui.add( { debug: false }, 'debug' )
			.onChange( function ( value ) {
 
				helper.visible = value;
 
			} );*/

	});

	function teleportPlayerIfOob() {

		if (camera.position.y <= - 25) {

			playerCollider.start.set(PlayerStartX, 0.35, PlayerStartZ);
			playerCollider.end.set(PlayerStartX, 1, PlayerStartZ);
			playerCollider.radius = 0.35;
			camera.position.copy(playerCollider.end);
			camera.rotation.set(0, 0, 0);

		}

	}

	//console.log(scene.children);

	function openRightDoor(door) {
		if (door.rotation.z > -1.5) {
			door.rotation.z -= 0.009;
		}
		else {
			//door.rotation.z = 0;
		}
	}

	function openLeftDoor(door) {
		if (door.rotation.z < 1.5) {
			door.rotation.z += 0.009;
		}
		else {
			//door.rotation.z = 0;
		}
	}

	function openDoors(doorName) {

		scene.children.forEach(child => {

			if (child.name == "school") {
				child.children.forEach(grandChildren => {

					switch (doorName) {
						case "door_entrance":

							grandChildren.children.forEach(grandGrandChildren => {
								if (grandGrandChildren.name == "door_left_entrance") { openLeftDoor(grandGrandChildren); }
								if (grandGrandChildren.name == "door_right_entrance") { openRightDoor(grandGrandChildren); }
							})
							break;
						case "door_entrance01":
							grandChildren.children.forEach(grandGrandChildren => {
								if (grandGrandChildren.name == "door_left_entrance001") { openLeftDoor(grandGrandChildren); }
								if (grandGrandChildren.name == "door_right_entrance001") { openRightDoor(grandGrandChildren); }
							})
							break;
						case "door_entrance02":
							grandChildren.children.forEach(grandGrandChildren => {
								if (grandGrandChildren.name == "door_left_entrance002") { openLeftDoor(grandGrandChildren); }
								if (grandGrandChildren.name == "door_right_entrance002") { openRightDoor(grandGrandChildren); }
							})
							break;
						case "door_entrance03":
							grandChildren.children.forEach(grandGrandChildren => {
								if (grandGrandChildren.name == "door_left_entrance003") { openLeftDoor(grandGrandChildren); }
								if (grandGrandChildren.name == "door_right_entrance003") { openRightDoor(grandGrandChildren); }
							})
							break;
					}
				});
			}
		});
	}

	const pathPoints = async (startPoint, targetPoint) => {
		await getPath(startPoint, targetPoint)
			.catch(error => {
				console.error("Error fetching path from backend :", error);
			})
			.then(response => {
				console.log("Path from backend: ", response);
				return response.split(",");
			})
	}

	window.showPath = function (pathString) {

		/*
		const pathPoints = async (startPoint, targetPoint) => {
			await getPath(startPoint, targetPoint)
				.catch(error => {
					console.error("Error fetching path from backend :", error);
				})
				.then(response => {
					console.log("Path from backend: ", response);
					return response.split(",");
				})
		}*/

		const pathPointsName = pathString.split(",");

		const pathPoints = Array(pathPointsName.length);

		console.log("pathPointsName");
		console.log(pathPointsName);

		//Get coordinates
		scene.children.forEach(child => {
			//roomaxis003
			if (child.name === "school") {

				for (let i = 0; i < pathPointsName.length; i++) {

					child.children.forEach(grandChildren => {

						if (grandChildren.name == pathPointsName[i]) {
							pathPoints[i] = grandChildren.position;
						}
					});
				}
			}
		});

		console.log("pathPoints");
		console.log(pathPoints);

		//show way to points
		const geometry = new MeshLineGeometry();

		const geometryPoints = [];

		for (let i = 0; i < pathPoints.length; i++) {

			geometryPoints.push(new THREE.Vector3(pathPoints[i].x, pathPoints[i].y, pathPoints[i].z));
		}

		geometry.setPoints(geometryPoints);

		const mesh = new THREE.Mesh(geometry, lineMaterial);

		//Remove root
		try {
			const object = scene.getObjectByName("root");

			object.geometry.dispose();
			object.material.dispose();
			scene.remove(object);
		}
		catch (err) { }

		mesh.name = "root";

		scene.add(mesh);
	}

	/*
	Test
	const geometry = new MeshLineGeometry();

	const geometryPoints = [
		new THREE.Vector3(- 10, 0.7, 0),
		new THREE.Vector3(0, 0.2, 0),
		new THREE.Vector3(10, 0.2, 5)
	];

	geometryPoints.push(new THREE.Vector3(5, 10, 10));

	geometry.setPoints(geometryPoints);

	const lineMaterial = new MeshLineMaterial({
		color: new THREE.Color(0x4BA4FB),
		lineWidth: 1,
		resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
		dashArray: 0.2
	});
	

	lineMaterial.transparent = true;
	lineMaterial.depthTest = true;

	const mesh = new THREE.Mesh(geometry, lineMaterial);

	scene.add(mesh);*/

	//Material for path
	const lineMaterial = new MeshLineMaterial({
		color: new THREE.Color(0x4BA4FB),
		lineWidth: 1,
		resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
		dashArray: 0.2
	});

	lineMaterial.transparent = true;
	lineMaterial.depthTest = true;

	function animate() {

		//Animate path
		lineMaterial.dashOffset -= 0.003;

		const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

		// we look for collisions in substeps to mitigate the risk of
		// an object traversing another too quickly for detection.

		for (let i = 0; i < STEPS_PER_FRAME; i++) {

			controls(deltaTime);

			updatePlayer(deltaTime);

			teleportPlayerIfOob();

		}

		for (let i = 0; i < doorePositions.length; i++) {

			if (doorePositionsName[i] == "door_entrance02" || doorePositionsName[i] == "door_entrance") {
				if (doorePositions[i][0] + 2.5 > playerPosition.x && doorePositions[i][0] - 0.5 < playerPosition.x && doorePositions[i][2] + 1.5 < playerPosition.z && doorePositions[i][2] + 6 > playerPosition.z) {
					openDoors(doorePositionsName[i]);
				}
			}

			if (doorePositionsName[i] == "door_entrance03" || doorePositionsName[i] == "door_entrance01") {
				if (doorePositions[i][0] + 4 > playerPosition.x && doorePositions[i][0] + 2 < playerPosition.x && doorePositions[i][2] + 1.5 < playerPosition.z && doorePositions[i][2] + 6 > playerPosition.z) {
					openDoors(doorePositionsName[i]);
				}
			}
		}

		renderer.render(scene, camera);

		//stats.update();

	}

	setupSearchField();

}
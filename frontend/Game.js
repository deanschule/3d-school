import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';

import { Capsule } from 'three/addons/math/Capsule.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

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
	directionalLight.shadow.camera.right = 30;
	directionalLight.shadow.camera.left = - 30;
	directionalLight.shadow.camera.top = 30;
	directionalLight.shadow.camera.bottom = - 30;
	directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;
	directionalLight.shadow.radius = 4;
	directionalLight.shadow.bias = - 0.00006;
	scene.add(directionalLight);

	const container = document.getElementById('container');

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.VSMShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	container.appendChild(renderer.domElement);


	const stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild(stats.domElement);


	const GRAVITY = 30;

	const STEPS_PER_FRAME = 5;

	const worldOctree = new Octree();

	const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);

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
	const loader = new GLTFLoader().setPath('./models/school/School/');

	//load school with GLTF Loader
	loader.load('school.gltf', (gltf) => {
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

				if (child.name.includes('border')) {
					//Add collidor
					worldOctree.fromGraphNode(child);

					const helper = new OctreeHelper(worldOctree);
					helper.name = 'schoolOctree' + child.name;
					helper.visible = true;
					scene.add(helper);

					doorePositionsName[arrayCount] = child.name;


					doorePositions[arrayCount][0] = child.position.x;
					doorePositions[arrayCount][1] = child.position.y;
					doorePositions[arrayCount][2] = child.position.z;
					arrayCount++;
					//doorePositions.push(child.name, child.position.x, child.position.y, child.position.z);

					console.log(child.name + " position = ");
					console.log(child.position)
				}

				if (child.name.includes('Plane')) {
					//Add collidor
					worldOctree.fromGraphNode(child);

					const helper = new OctreeHelper(worldOctree);
					helper.name = 'schoolOctree' + child.name;
					helper.visible = false;
				}
			}

			if (child.name === "glass_door_1" || child.name === "glass_door_2") {

				//doorePositions.push(child.name, child.position.x, child.position.y, child.position.z);

				doorePositionsName[arrayCount] = child.name;
				doorePositions[arrayCount][0] = child.position.x;
				doorePositions[arrayCount][1] = child.position.y;
				doorePositions[arrayCount][2] = child.position.z;
				arrayCount++;

				console.log(child.name + " position = ");
				console.log(child.position);
			}

		});

		const helper = new OctreeHelper(worldOctree);
		helper.name = 'schoolOctree'
		helper.visible = false;
		scene.add(helper);

		console.log(doorePositions);
		console.log(doorePositionsName);

		/*
		const gui = new GUI( { width: 200 } );
		gui.add( { debug: false }, 'debug' )
			.onChange( function ( value ) {
 
				helper.visible = value;
 
			} );*/

	});

	function teleportPlayerIfOob() {

		if (camera.position.y <= - 25) {

			playerCollider.start.set(0, 0.35, 0);
			playerCollider.end.set(0, 1, 0);
			playerCollider.radius = 0.35;
			camera.position.copy(playerCollider.end);
			camera.rotation.set(0, 0, 0);

		}

	}

	console.log(scene.children);

	function leftDoor(grandChildren) {
		if (grandChildren.rotation.z > -1.5) {
			grandChildren.rotation.z -= 0.005;
		}
		else {
			grandChildren.rotation.z = 0;
		}
	}

	function rightDoor(grandChildren) {
		if (grandChildren.rotation.z < 1.5) {
			grandChildren.rotation.z += 0.005;
		}
		else {
			grandChildren.rotation.z = 0;
		}
	}

	function glasDoor(grandChildren) {
		if (grandChildren.rotation.z > 0) {
			grandChildren.rotation.z -= 0.005;
		}
		else {
			grandChildren.rotation.z = 1.5;
		}
	}

	function getDoor(doorName) {

		const myArray = doorName.split("_");
		doorName = myArray[myArray.length - 1];
		//console.log(doorName);

		scene.children.forEach(child => {

			if (child.name === "school") {
				child.children.forEach(grandChildren => {

					switch (doorName) {
						case "1":
							if (grandChildren.name == "glass_door_1") { glasDoor(grandChildren); }
							break;
						case "2":
							if (grandChildren.name == "glass_door_2") { glasDoor(grandChildren); }
							break;
						case "entryright":
							if (grandChildren.name == "door_left001") { rightDoor(grandChildren); }
							if (grandChildren.name == "door_right001") { leftDoor(grandChildren); }
							break;
						case "entryleft":
							if (grandChildren.name == "door_left") { rightDoor(grandChildren); }
							if (grandChildren.name == "door_right") { leftDoor(grandChildren); }
							break;
						case "entryright001":
							if (grandChildren.name == "door_left002") { rightDoor(grandChildren); }
							if (grandChildren.name == "door_right002") { leftDoor(grandChildren); }
							break;
						case "entryleft001":
							if (grandChildren.name == "door_left003") { rightDoor(grandChildren); }
							if (grandChildren.name == "door_right003") { leftDoor(grandChildren); }
							break;
						case "entryright002":
							if (grandChildren.name == "door_left005") { rightDoor(grandChildren); }
							if (grandChildren.name == "door_right005") { leftDoor(grandChildren); }
							break;
						case "entryleft002":
							if (grandChildren.name == "door_left004") { rightDoor(grandChildren); }
							if (grandChildren.name == "door_right004") { leftDoor(grandChildren); }
							break;
					}
				});
			}
		});
	}


	function animate() {

		const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

		// we look for collisions in substeps to mitigate the risk of
		// an object traversing another too quickly for detection.

		for (let i = 0; i < STEPS_PER_FRAME; i++) {

			controls(deltaTime);

			updatePlayer(deltaTime);

			teleportPlayerIfOob();

		}
		let testDor = 1;

		for (let i = 0; i < doorePositions.length; i++) {

			if (doorePositionsName[i].includes("left")) {
				if (doorePositions[i][0] + 0.4 > playerPosition.x && doorePositions[i][0] - 1.8 < playerPosition.x && doorePositions[i][2] - 0.4 < playerPosition.z && doorePositions[i][2] + 5 > playerPosition.z) {
					getDoor(doorePositionsName[i]);
				}
			}


			if (doorePositionsName[i].includes("right")) {
				if (doorePositions[i][0] - 0.4 < playerPosition.x && doorePositions[i][0] + 1.8 > playerPosition.x && doorePositions[i][2] - 0.4 < playerPosition.z && doorePositions[i][2] + 5 > playerPosition.z) {
					getDoor(doorePositionsName[i]);
				}
			}

			if (doorePositionsName[i] == "glass_door_1") {

				if (doorePositions[i][0] - 0.4 < playerPosition.x && doorePositions[i][0] + 4 > playerPosition.x && doorePositions[i][2] + 2.1 > playerPosition.z && doorePositions[i][2] - 0.3 < playerPosition.z) {
					getDoor(doorePositionsName[i]);
				}
			}
			

			if (doorePositionsName[i] == "glass_door_2") {

				if (doorePositions[i][0] - 0.4 < playerPosition.x && doorePositions[i][0] + 4 > playerPosition.x && doorePositions[i][2] - 2 > playerPosition.z && doorePositions[i][2] + 2 < playerPosition.z) {
					getDoor(doorePositionsName[i]);
				}
			}


		}

		//getDoor(doorePositionsName[testDor]);
		/*
				console.log(doorePositionsName[testDor]);
				console.log(doorePositions[testDor][0]);
				console.log(doorePositions[testDor][2]);
				console.log("Player " + playerPosition.x);
				console.log("Player " + playerPosition.z);*/
				

		//getDoor("glass_door_2");

		renderer.render(scene, camera);

		//stats.update();

	}



}
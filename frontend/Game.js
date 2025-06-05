import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';

import { Capsule } from 'three/addons/math/Capsule.js';

import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { setupSearchField } from "./RoomHandler";


export default function Game() {
	const clock = new THREE.Clock();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x88ccee);
	//scene.fog = new THREE.Fog(0x88ccee, 0, 50);

	const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.rotation.order = 'YXZ';

	const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
	fillLight1.position.set(1, 2, 1);
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


	let arrayCount = 0;

	const rows = 10;
	const cols = 3;

	const doorePositions = Array(rows).fill().map(() => Array(cols).fill(0));

	const doorePositionsName = Array(rows).fill("");

	//LoadScreen
	const loadingManager = new THREE.LoadingManager();

	const progressBar = document.getElementById('progress-bar');

	loadingManager.onProgress = function (url, loaded, total) {
		progressBar.value = (loaded / total) * 100;
	}

	const progressBarContainer = document.querySelector('.progress-bar-container');

	loadingManager.onLoad = function () {
		progressBarContainer.style.display = 'none';
	}

	//GLTF Loader
	const loader = new GLTFLoader(loadingManager).setPath('./models/schule_export/schule_export/');


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

				playerVelocity.y = 10;

			}

		}

	}


	//load school with GLTF Loader
	loader.load('school_modify_addedd1.gltf', (gltf) => {
		gltf.scene.scale.set(4, 4, 4);
		gltf.scene.name = 'school';
		scene.add(gltf.scene);

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
					//scene.add(helper);
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
				//console.log(child);
				doorePositionsName[arrayCount] = child.name;


				doorePositions[arrayCount][0] = child.position.x;
				doorePositions[arrayCount][1] = child.position.y;
				doorePositions[arrayCount][2] = child.position.z;
				arrayCount++;
			}

		});

		const helper = new OctreeHelper(worldOctree);
		helper.name = 'schoolOctree'
		helper.visible = false;
		scene.add(helper);
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

	function openRightDoor(door) {

		if (door.rotation.z > 0.2) {
			door.rotation.z -= 0.04;
		}
		else {
			//door.rotation.z = 0;
		}
	}

	function openLeftDoor(door) {

		if (door.rotation.z < 3) {
			door.rotation.z += 0.04;
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

	window.showPath = function (pathString) {

		const pathPointsName = pathString.split(",");

		const pathPoints = Array(pathPointsName.length);

		//console.log("pathPointsName");
		//console.log(pathPointsName);

		//Get coordinates
		scene.children.forEach(child => {
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


		//console.log("pathPoints");
		//console.log(pathPoints);

		//show way to points
		const geometry = new MeshLineGeometry();

		const geometryPoints = [];

		for (let i = 0; i < pathPoints.length; i++) {

			geometryPoints.push(new THREE.Vector3((pathPoints[i].x * 4), pathPoints[i].y * 4.1, pathPoints[i].z * 4));
		}

		geometry.setPoints(geometryPoints);

		const mesh = new THREE.Mesh(geometry, lineMaterial);

		//Remove old root
		try {
			const object = scene.getObjectByName("route");

			object.geometry.dispose();
			object.material.dispose();
			scene.remove(object);
		}
		catch (err) { }

		mesh.name = "route";

		scene.add(mesh);
	}

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

		//we look for collisions in substeps to mitigate the risk of an object traversing another too quickly for detection.

		for (let i = 0; i < STEPS_PER_FRAME; i++) {

			controls(deltaTime);

			updatePlayer(deltaTime);

			teleportPlayerIfOob();

			//console.log(playerPosition);

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
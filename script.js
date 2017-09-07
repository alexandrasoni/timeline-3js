window.addEventListener('load', init, false);

var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

function init() {
	// set up the scene, the camera and the renderer
	createScene();

	// add the lights
	createLights();

	// add the objects
	createCard(0, 150, 1);
	createCard(-30, 120, 2);

	createLine();

	createCardGroup()

	// add raycaster for mouse interaction
	createRay();

	// start a loop that will update the objects' positions 
	// and render the scene on each frame
	loop();

	console.log('init')
}

var scene, camera, raycaster, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;

var sceneObjects = [];


function createScene() {
	// Get the width and the height of the screen,
	// use them to set up the aspect ratio of the camera 
	// and the size of the renderer.
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	// Create the scene
	scene = new THREE.Scene();

	// Add a fog effect to the scene; same color as the
	// background color used in the style sheet
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
	
	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	
	// Set the position of the camera
	camera.position.x = 0;
	camera.position.z = 200;
	camera.position.y = 100;
	
	// Create the renderer
	renderer = new THREE.WebGLRenderer({ 
		// Allow transparency to show the gradient background
		// we defined in the CSS
		alpha: true, 

		// Activate the anti-aliasing; this is less performant,
		// but, as our project is low-poly based, it should be fine :)
		antialias: true 
	});

	// Define the size of the renderer; in this case,
	// it will fill the entire screen
	renderer.setSize(WIDTH, HEIGHT);
	
	// Enable shadow rendering
	renderer.shadowMap.enabled = true;
	
	// Add the DOM element of the renderer to the 
	// container we created in the HTML
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
	
	// Listen to the screen: if the user resizes it
	// we have to update the camera and the renderer size
	window.addEventListener('resize', handleWindowResize, false);

	console.log('scene created');

}

function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

var hemisphereLight, shadowLight;

function createLights() {
	// A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	
	// A directional light shines from a specific direction. 
	// It acts like the sun, that means that all the rays produced are parallel. 
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light  
	shadowLight.position.set(150, 350, 350);
	
	// Allow shadow casting 
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);

	console.log('lights created');			

}


// Card model
Card = function(){

	// var geom = new THREE.BoxBufferGeometry(50,50,50);

	var geom = new THREE.PlaneGeometry( 80, 80, 32 );

	var cubeTexture = THREE.ImageUtils.loadTexture('textures/2.png');

	var mat = new THREE.MeshLambertMaterial({
		map: cubeTexture,
		side:THREE.DoubleSide 
	});

	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.receiveShadow = true;
}

// Line model
Line = function(){

	var geom = new THREE.Geometry();
	geom.vertices.push(
		new THREE.Vector3( 0, 125, -1 ),
		new THREE.Vector3( 0, -100, -1 )
	);

	var mat = new THREE.LineBasicMaterial({
		color: 0x333333,
		opacity: 0.1
	});

	this.mesh = new THREE.Line(geom, mat);

}

// Create card group
var group = new THREE.Object3D();

function createCardGroup() {
	// Add to scene
	scene.add(group);

	// Push to mouse intersection object group
	sceneObjects.push(group.children[0]);
	sceneObjects.push(group.children[1]);
}

// Create card function
var card;

function createCard(x, y, z){
	card = new Card();

	// Set position parameters
	card.mesh.position.x = x;
	card.mesh.position.y = y;
	card.mesh.position.z = z;

	// Add card to group
	group.add(card.mesh);

	console.log('card created');
}


// Create line function
var line;

function createLine(){
	line = new Line();

	line.mesh.position.y = 75;
	scene.add(line.mesh);

	console.log('line created');
}

// Create raycaster
function createRay(){
	raycaster = new THREE.Raycaster();
	console.log('raycaster created')
}

// Create mouse object
var mouse = new THREE.Vector2(), INTERSECTED;
var intersectedObjects = [];


	var currentPosX1 = sceneObjects[0].position.x
	var currentPosY1 = sceneObjects[0].position.x

	var currentPosX2;
	var currentPosY2;
	console.log(sceneObjects);

// Mouse move event
function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// Set raycaster
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects(sceneObjects);

	console.log('intersects');
	if (intersects.length > 0) {
		for ( var i = 0; i < intersects.length; i++ ) {
			intersects[ i ].object.material.color.set( 0xff0000 );
			// console.log(intersects[i])
			intersectedObjects.push(intersects[i].object);
			var pos = intersects[i].object.position;
			var currentPosX = pos.x;
			var currentPosY = pos.y;

			TweenMax.to(pos, 1, {y: currentPosY + Math.random()*30, x: currentPosX + Math.random()*30});
		}
	}
    else {
    	console.log(currentPosY);
		for ( var i = 0; i < intersectedObjects.length; i++ ) {
			TweenMax.to(intersectedObjects[i].position, 1, {y: 30, x: 30});
		}
    }

  	// console.log(intersectedObjects);

	renderer.render( scene, camera );

	// Check intersect
	// if ( intersects.length > 0 ) {
	// 	if ( INTERSECTED != intersects[ 0 ].object ) {
	// 		console.log('intersects');
	// 		if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
	// 		INTERSECTED = intersects[ 0 ].object;
	// 		INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
	// 		INTERSECTED.material.emissive.setHex( 0xff0000 );

	// 		var pos = INTERSECTED.position;
	// 		var currentPosX = pos.x;
	// 		var currentPosY = pos.y;
	// 		TweenMax.to(pos, 1, {y: currentPosY + Math.random()*30, x: currentPosX + Math.random()*30});
			 
	// 	}
	// } else {
	// 	if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
	// 	INTERSECTED = null;

	// 	TweenMax.to(card.mesh.position, 1, {y: 150, x: 0});
	// }

}

// Loop the render
function loop(){

	// render the scene
	renderer.render(scene, camera);

	window.addEventListener( 'mousemove', onMouseMove, false );

	// call the loop function again
	requestAnimationFrame(loop);

}






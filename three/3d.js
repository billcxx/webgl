function three(){
var controls,camera, scene, renderer;
var mesh;
var zFuncText = "0.1*x^2 - 0.1*y^2";
var zFunc = exprEval.Parser.parse(zFuncText).toJSFunction( ['x','y'] );
var a = 0.01, b = 0.01, c = 0.01, d = 0.01;
var meshFunction;
var segments = 20, 
	xMin = -10, xMax = 10, xRange = xMax - xMin,
	yMin = -10, yMax = 10, yRange = yMax - yMin,
	zMin = -10, zMax = 10, zRange = zMax - zMin;
	
var graphGeometry;
var gridMaterial, wireMaterial, vertexColorMaterial;
var graphMesh;

init();
animate();


function init() {
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
    camera.lookAt(scene.position);	
    
    // var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
    // var material = new THREE.MeshBasicMaterial( );
    // mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );

        console.log('initialize the three.js')

    var canvas = document.getElementById('three');

    	// RENDERER
	if ( Detector.webgl )
        renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    else
        renderer = new THREE.CanvasRenderer(); 

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //
    window.addEventListener( 'resize', onWindowResize, false );

	controls = new THREE.TrackballControls( camera, renderer.domElement );


	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
	// SKYBOX/FOG
	// scene.fog = new THREE.FogExp2( 0x888888, 0.00025 );
	
	////////////
	// CUSTOM //
	////////////
	
    scene.add( new THREE.AxesHelper() );
    


    	// wireframe for xy-plane
	var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000088, wireframe: true, side:THREE.DoubleSide } ); 
	var floorGeometry = new THREE.PlaneGeometry(1000,1000,10,10);
	var floor = new THREE.Mesh(floorGeometry, wireframeMaterial);
	floor.position.z = -0.01;
	// rotate to lie in x-y plane
	// floor.rotation.x = Math.PI / 2;
	scene.add(floor);
	
	var normMaterial = new THREE.MeshNormalMaterial;
	var shadeMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
	

	// "wireframe texture"
	var wireTexture = new THREE.TextureLoader().load( 'https://raw.githubusercontent.com/stemkoski/stemkoski.github.com/master/Three.js/images/square.png' );
	wireTexture.wrapS = wireTexture.wrapT = THREE.RepeatWrapping; 
	wireTexture.repeat.set( 40, 40 );
	wireMaterial = new THREE.MeshBasicMaterial( { map: wireTexture, vertexColors: THREE.VertexColors, side:THREE.DoubleSide } );
	// wireMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors, side:THREE.DoubleSide } );
	var vertexColorMaterial  = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
	// bgcolor
	renderer.setClearColor( 0x888888, 1 );


}




function createGraph()
{
	xRange = xMax - xMin;
	yRange = yMax - yMin;
	zFunc = exprEval.Parser.parse(zFuncText).toJSFunction( ['x','y'] );
	meshFunction = function(x, y, target) 
	{
		x = xRange * x + xMin;
		y = yRange * y + yMin;
        var z = zFunc(x,y); //= Math.cos(x) * Math.sqrt(y);
        if ( isNaN(z) ){
            target.set(0,0,0);
			// return new THREE.Vector3(0,0,0); // TODO: better fix
        }else{
            target.set(x,y,z);
			// return new THREE.Vector3(x, y, z);
        }

    };
	// true => sensible image tile repeat...
	graphGeometry = new THREE.ParametricGeometry( meshFunction, segments, segments, true );
	
	///////////////////////////////////////////////
	// calculate vertex colors based on Z values //
	///////////////////////////////////////////////
	graphGeometry.computeBoundingBox();
	zMin = graphGeometry.boundingBox.min.z;
	zMax = graphGeometry.boundingBox.max.z;
	zRange = zMax - zMin;
	var color, point, face, numberOfSides, vertexIndex;
	// faces are indexed using characters
	var faceIndices = [ 'a', 'b', 'c', 'd' ];
	// first, assign colors to vertices as desired
	for ( var i = 0; i < graphGeometry.vertices.length; i++ ) 
	{
		point = graphGeometry.vertices[ i ];
		color = new THREE.Color( 0x0000ff );
		color.setHSL( 0.7 * (zMax - point.z) / zRange, 1, 0.5 );
		graphGeometry.colors[i] = color; // use this array for convenience
	}
	// copy the colors as necessary to the face's vertexColors array.
	for ( var i = 0; i < graphGeometry.faces.length; i++ ) 
	{
		face = graphGeometry.faces[ i ];
		numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
		for( var j = 0; j < numberOfSides; j++ ) 
		{
			vertexIndex = face[ faceIndices[ j ] ];
			face.vertexColors[ j ] = graphGeometry.colors[ vertexIndex ];
		}
	}
	///////////////////////
	// end vertex colors //
	///////////////////////
	
	// material choices: vertexColorMaterial, wireMaterial , normMaterial , shadeMaterial
	
	if (graphMesh) 
	{
		scene.remove( graphMesh );
		// renderer.deallocateObject( graphMesh );
	}
	wireMaterial.map.repeat.set( segments, segments );
	
	graphMesh = new THREE.Mesh( graphGeometry, wireMaterial );
	graphMesh.doubleSided = true;
	scene.add(graphMesh);
}


function resetCamera()
{
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera.position.set( 2*xMax, 0.5*yMax, 4*zMax);
	camera.up = new THREE.Vector3( 0, 0, 1 );
	camera.lookAt(scene.position);	
	scene.add(camera);
	
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	THREEx.WindowResize(renderer, camera);
}




function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() 
{
    requestAnimationFrame( animate );
	render();		
	update();
}
function update()
{
    createGraph();
	controls.update();
}
function render() 
{
	renderer.render( scene, camera );
}

}

function clearThree(){
    const canvas = document.getElementById('three');
    const gl = canvas.getContext('three');
    gl.clear();
  }
///<reference path="scripts/babylon.max.js" />

/*
 * This is the code for "Babylon.js: Building a Basic Game for the Web”, written for MSDN Magazine.  
 * 
 * Program was written on September 2015 by Raanan Weber, https://blog.raananweber.com
 * 
 * The code is for learning purpose only. 
 * There are much better ways to orginize your code! Try TypeScript, you won't regret it.
 * If you have any questions, please ask me directly or any other person at the Babylon.js forum:
 * http://www.html5gamedevs.com/forum/16-babylonjs/
 * 
 */

//Constants for the lane in meters
var laneWidth = 1.07;
var foulLineToHeadPin = 18.28;
var foulLineToArrows = 4.57;
var foulLineToInnerDots = 1.83;
var firstApproachDotsToFoulLine = 3.66;
var secondApproachtoFirstApprocah = 0.91;
var approachBoardToSecondApproachDots = 4;
var pinAreaLength = 1.02 + 0.5; //including a buffer
var totalLaneLength = approachBoardToSecondApproachDots + firstApproachDotsToFoulLine + secondApproachtoFirstApprocah + foulLineToHeadPin + pinAreaLength;
var laneHeight = 0.2;

//Pins constants
var pinHeight = 0.48;
var pinDiameter = 0.18;
var distanceBetweenRows = 0.26;
var distanceBetweenPins = 0.3;
var firstPinPosition = firstApproachDotsToFoulLine + secondApproachtoFirstApprocah + foulLineToHeadPin;
var pinYPosition = pinHeight / 2 + laneHeight;
//Array of pin positions, redundant calculation for readability.
var pinPositions = [
    //Row 1
    new BABYLON.Vector3(0, pinYPosition, firstPinPosition),
    //Row 2
    new BABYLON.Vector3(-(distanceBetweenPins / 2), pinYPosition, firstPinPosition + distanceBetweenRows),
    new BABYLON.Vector3(distanceBetweenPins / 2, pinYPosition, firstPinPosition + distanceBetweenRows),
    //Row 3
    new BABYLON.Vector3(-distanceBetweenPins, pinYPosition, firstPinPosition + 2 * distanceBetweenRows),
    new BABYLON.Vector3(0, pinYPosition, firstPinPosition + 2 * distanceBetweenRows),
    new BABYLON.Vector3(distanceBetweenPins, pinYPosition, firstPinPosition + 2 * distanceBetweenRows),
    //Row 4
    new BABYLON.Vector3(-((distanceBetweenPins / 2) + distanceBetweenPins), pinYPosition, firstPinPosition + 3 * distanceBetweenRows),
    new BABYLON.Vector3(-(distanceBetweenPins / 2), pinYPosition, firstPinPosition + 3 * distanceBetweenRows),
    new BABYLON.Vector3((distanceBetweenPins / 2), pinYPosition, firstPinPosition + 3 * distanceBetweenRows),
    new BABYLON.Vector3(((distanceBetweenPins / 2) + distanceBetweenPins), pinYPosition, firstPinPosition + 3 * distanceBetweenRows)
];

function init() {
    //Init the engine
    var engine = initEngine();
    //Create a new scene
    var scene = createScene(engine);
    //Create the main player camera
    var camera = createFreeCamera(scene);
    //Attach the control from the canvas' user input
    camera.attachControl(engine.getRenderingCanvas());
    //set the camera to be the main active camera;
    scene.activeCamera = camera;
    //Create the floor
    var floor = createFloor(scene);
    //Add a light.
    var light = createLight(scene);
    //Create the skybox
    createSkyBox(scene);
    //Create the gutters using the gutter-limiters
    createGutters(scene);
    //Add 10 pins
    var pins = createPins(scene);
    //Add the ball
    var ball = createBall(scene);
    //Build the wooden lane.
    var lane = createLane(scene);
    //Add an action manager to change the ball's color.
    generateActionManager(scene);
}

function initEngine() {
    // Get the canvas element from index.html
    var canvas = document.getElementById("renderCanvas");
    // Initialize the BABYLON 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });

    return engine;
}

function createScene(engine) {
    var scene = new BABYLON.Scene(engine);
    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
    });
    scene.debugLayer.show();
    return scene;
}

function createFreeCamera(scene) {
    var camera = new BABYLON.FreeCamera("cam", new BABYLON.Vector3(0, 1.6, 0), scene);

    camera.speed = 0.8;
    camera.inertia = 0.4;

    return camera;
}

function createFloor(scene) {
    //Create a ground mesh
    var floor = BABYLON.Mesh.CreateGround("floor", 100, 100, 1, scene, false);
    //Grass material
    var grassMaterial = new BABYLON.StandardMaterial(name, scene);
    //Texture used under https://creativecommons.org/licenses/by/2.0/ , from https://www.flickr.com/photos/pixelbuffer/3581676159 .
    var grassTexture = new BABYLON.Texture("Assets/grass2.jpg", scene);
    grassTexture.uScale = 8;
    grassTexture.vScale = 8;
    grassMaterial.diffuseTexture = grassTexture;
    floor.material = grassMaterial;
    return floor;
}

function createLight(scene) {
    //Create a directional light
    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0.5, -1, 0.5), scene);
    light.position = new BABYLON.Vector3(20, 40, -20);
    light.intensity = 0.9;

    //create a second one to simulate light on dark sides
    var secondLight = new BABYLON.DirectionalLight("dir02", new BABYLON.Vector3(-0.5, -1, -0.5), scene);
    secondLight.intensity = 0.35;

    return light;
}

function createSkyBox(scene) {
    //SkyBox texture taken from http://www.humus.name/ , under the CC By 3.0 license https://creativecommons.org/licenses/by/3.0/
    //Create a box mesh
    var skybox = BABYLON.Mesh.CreateBox("skybox", 100.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    //The cube texture is used for skz boxes and set as reflection texture 
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("Assets/skybox/skybox", scene);
    //reflection coordinates set to skybox mode
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.position.y = 3.5;
    //rotate it so front will be more interesting.
    skybox.rotate(BABYLON.Axis.Y, - Math.PI / 2);
    return skybox;
}

function createLane(scene) {
    //Create the box that will be the lane.
    var lane = BABYLON.Mesh.CreateBox("lane", 1, scene, false);
    //rescale it to fir the right proportions.
    lane.scaling = new BABYLON.Vector3(laneWidth, laneHeight, totalLaneLength);
    //Put it in the right position
    lane.position.y = laneHeight / 2;  //Due to centering of the mesh
    lane.position.z = totalLaneLength / 2;
    //set the material to "reflecting wood"
    var material = new BABYLON.StandardMaterial("laneMaterial", scene);
    var woodTexture = new BABYLON.Texture("Assets/wood.jpg", scene);
    woodTexture.uScale = totalLaneLength;
    woodTexture.vScale = laneWidth;
    material.diffuseTexture = woodTexture;
    material.emissiveColor = BABYLON.Color3.Gray();

    //lane reflection
    material.reflectionTexture = new BABYLON.MirrorTexture("mirror", 1024, scene, true);
    material.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1.0, 0, laneHeight);
    //add meshes to the render list
    material.reflectionTexture.renderList = [];
    for (var i = 0; i < 10; ++i) {
        material.reflectionTexture.renderList.push(scene.getMeshByName("pin-" + i));
    }
    material.reflectionTexture.renderList.push(scene.getMeshByName("ball"));
    material.reflectionTexture.renderList.push(scene.getMeshByName("skybox"));
    //reflection level
    material.reflectionTexture.level = 0.2;

    lane.material = material;

    //compute the world matrix in order to create the decals in the right positions.
    lane.computeWorldMatrix(true);

    var decalSize =  new BABYLON.Vector3(1, 1, 1);
    //dots decals: first the material
    var dotsMaterial = new BABYLON.StandardMaterial("dots", scene);
    dotsMaterial.diffuseTexture = new BABYLON.Texture("Assets/dots2.png", scene);
    dotsMaterial.diffuseTexture.hasAlpha = true;
    // create 3 decal objects, for 3 lines of dots.
    var dotsDecal1 = BABYLON.Mesh.CreateDecal("dots", lane, new BABYLON.Vector3(0, laneHeight, approachBoardToSecondApproachDots), BABYLON.Vector3.Up(), decalSize);
    var dotsDecal2 = BABYLON.Mesh.CreateDecal("dots", lane, new BABYLON.Vector3(0, laneHeight, approachBoardToSecondApproachDots + secondApproachtoFirstApprocah), BABYLON.Vector3.Up(), decalSize);
    var dotsDecal3 = BABYLON.Mesh.CreateDecal("dots", lane, new BABYLON.Vector3(0, laneHeight, approachBoardToSecondApproachDots + secondApproachtoFirstApprocah + firstApproachDotsToFoulLine + foulLineToInnerDots), BABYLON.Vector3.Up(), decalSize);
    //set for each the rendering group and the material.
    [dotsDecal1, dotsDecal2, dotsDecal3].forEach(function (dotsDecal) {
        dotsDecal.renderingGroupId = 1;
        dotsDecal.material = dotsMaterial;
    });

    //foul line
    //set the decal's position
    var foulLinePosition = new BABYLON.Vector3(0, laneHeight, approachBoardToSecondApproachDots + secondApproachtoFirstApprocah + firstApproachDotsToFoulLine);
    //create the decal
    var foulLine = BABYLON.Mesh.CreateDecal("foulLine", lane, foulLinePosition, BABYLON.Vector3.Up(), decalSize);
    //set the rendering group so it will render after the lane
    foulLine.renderingGroupId = 1;
    //set the material
    var foulMaterial = new BABYLON.StandardMaterial("foulMat", scene);
    foulMaterial.diffuseTexture = new BABYLON.Texture("Assets/dots2-w-line.png", scene);
    foulMaterial.diffuseTexture.hasAlpha = true;
    foulMaterial.zOffset = 3;
    foulLine.material = foulMaterial;

    //arrows
    var trianglesMaterial = new BABYLON.StandardMaterial("triangleMat", scene);
    trianglesMaterial.diffuseTexture = new BABYLON.Texture("Assets/triangles.png", scene);
    trianglesMaterial.diffuseTexture.hasAlpha = true;
    trianglesMaterial.zOffset = 3;
    var triangles = BABYLON.Mesh.CreateDecal("triangles", lane, new BABYLON.Vector3(0, laneHeight, approachBoardToSecondApproachDots + secondApproachtoFirstApprocah + firstApproachDotsToFoulLine + foulLineToArrows), BABYLON.Vector3.Up(), decalSize);
    triangles.renderingGroupId = 1;
    triangles.material = trianglesMaterial;

    return lane;
}

function createGutters(scene) {
    //create the gutter limiter
    var gutter = BABYLON.Mesh.CreateBox("gutter", 1, scene, false);
    //scale it and position it.
    gutter.scaling = new BABYLON.Vector3(0.2, laneHeight, totalLaneLength);
    gutter.position = new BABYLON.Vector3(laneWidth, laneHeight / 2, totalLaneLength / 2);

    //Use Bricks procedural texture as the main texture of the material.
    var gutterMaterial = new BABYLON.StandardMaterial("gutterMat", scene);
    var brickTexture = new BABYLON.BrickProceduralTexture("brickTexture", 128, scene);
    brickTexture.numberOfBricksWidth = 20;
    brickTexture.numberOfBricksHeight = 2;
    brickTexture.uScale = 20;
    gutterMaterial.diffuseTexture = brickTexture;
    gutter.material = gutterMaterial;

    //clone the gutter limiter to create one on the other side.
    var gutter2 = gutter.clone("gutter");
    //set its position to mirror the first one.
    gutter2.position.x = -gutter.position.x;
    return [gutter, gutter2];
}

function createPins(scene) {
    //Create the main pin from which all of the others will be created
    var mainPin = BABYLON.Mesh.CreateCylinder("pin", pinHeight, pinDiameter / 2, pinDiameter, 6, 1, scene);
    //disable it so it wouldn"t show.
    mainPin.setEnabled(false);
    //set its material
    mainPin.material = new BABYLON.StandardMaterial("pinMat", scene);
    mainPin.material.diffuseTexture = new BABYLON.Texture("Assets/pin-texture.png", scene);
    //create 10 pin instances from 10 pin positions predefined above.
    return pinPositions.map(function (position, idx) {
        var pin = new BABYLON.InstancedMesh("pin-" + idx, mainPin);
        pin.position = position;
        return pin;
    });
}

function createBall(scene) {
    //create the sphere
    var sphere = BABYLON.Mesh.CreateSphere("sphere", 12, 0.22, scene);

    sphere.material = new BABYLON.StandardMaterial("sphereMat", scene);
    //create pivot-parent-boxes to rotate the cylinders correctly. 
    //It is of course possible to use Pivot Matrix for the same purpose.
    var box1 = BABYLON.Mesh.CreateBox("parentBox", 1, scene);
    var box2 = box1.clone("parentBox");
    var box3 = box1.clone("parentBox");
    //set rotation to each parent box 
    box2.rotate(BABYLON.Axis.X, 0.3);
    box3.rotate(BABYLON.Axis.Z, 0.3);
    box1.rotate(new BABYLON.Vector3(0.5, 0, 0.5), -0.2);
    [box1, box2, box3].forEach(function (boxMesh) {
        //compute the world matrix so the CSG will get the rotation correctly. 
        boxMesh.computeWorldMatrix(true);
        //make the boxes invisible.  
        boxMesh.isVisible = false;
    });

    var cylinder1 = BABYLON.Mesh.CreateCylinder("cylinder", 0.15, 0.02, 0.02, 8, 1, scene, false);
    cylinder1.position.y += 0.15;
    cylinder1.parent = box1;
    var cylinder2 = cylinder1.clone("cylinder", box2);
    var cylinder3 = cylinder1.clone("cylinder", box3);
    //create the sphere's CSG object 
    var sphereCSG = BABYLON.CSG.FromMesh(sphere);
    //subtract all cylinders from the sphere's CSG object 
    [cylinder1, cylinder2, cylinder3].forEach(function (cylinderMesh) {
        sphereCSG.subtractInPlace(BABYLON.CSG.FromMesh(cylinderMesh));
    });
    //create a new mesh from the sphere CSG 
    var ball = sphereCSG.toMesh("ball", sphere.material, scene, false);
    ball.position.y = laneHeight + 0.11;
    ball.position.z = 5;

    //the marble procedural texture of the ball
    var marbleMaterial = new BABYLON.StandardMaterial("torus", scene);
    var marbleTexture = new BABYLON.MarbleProceduralTexture("marble", 512, scene);
    marbleTexture.numberOfBricksHeight = 5;
    marbleTexture.numberOfBricksWidth = 5;
    marbleMaterial.ambientTexture = marbleTexture;
    marbleMaterial.diffuseColor = BABYLON.Color3.Green();
    ball.material = marbleMaterial;
    [sphere, box1, box2, box3, cylinder3, cylinder1, cylinder2].forEach(function (m) {
        m.dispose();
    });
    //render the ball last
    ball.renderingGroupId = 2;
    return ball;
}

function generateActionManager(scene) {
    scene.actionManager = new BABYLON.ActionManager(scene);

    //generate a new color each time I press "c"
    var ball = scene.getMeshByName("ball");
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction({ trigger: BABYLON.ActionManager.OnKeyUpTrigger, parameter: "c" },
        //the function that will be executed
        function () {
            ball.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        }
    ));
}


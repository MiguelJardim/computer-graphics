/* jshint esversion: 6 */

var chosenCamera, topCamera, sceneCamera, ballCamera, ballCameraOn = false, scene, renderer;
var nextClub = -1;

var canLaunch = true;

var multF = 10; // multiplying factor

var clock = new THREE.Clock();

// table
var table;

var TABLE_LENGTH = 35*multF;
var TABLE_WIDTH = 20*multF;
var TABLE_HEIGHT = 1*multF;
var TABLE_COLOR = 0x219100;

var TABLE_X = 0;
var TABLE_Z = 0;

// left, top , right, dowm
var TABLE_BOUNDS = [TABLE_X - TABLE_LENGTH / 2, TABLE_Z - TABLE_WIDTH / 2 , TABLE_X + TABLE_LENGTH / 2, TABLE_Z + TABLE_WIDTH / 2];

// hole
var HOLE_RADIUS = 1.5*multF;
var HOLE_HEIGHT = 1.1*multF;
var HOLE_COLOR = 0x0B3000;

// wall
var WALL_WIDTH = 1*multF;
var BIG_WALL_LENGTH = (TABLE_LENGTH + 2 * WALL_WIDTH);
var SMALL_WALL_LENGTH = TABLE_WIDTH;
var WALL_HEIGHT = 3.5*multF;
var WALL_COLOR = 0x551305;

// club
var CLUB_RADIUS_SMALL = 0.2*multF;
var CLUB_RADIUS_BIG = 0.5*multF;
var CLUB_LENGTH = 13*multF;
var CLUB_COLOR = 0x652315;

// ball
var BALL_RADIUS = 1 *multF;
var BALL_COLOR = 0xFFFFFF;
var GHOST_BALL_COLOR = 0xCBCBCB;
var BALL_Y = BALL_RADIUS + TABLE_HEIGHT / 2;

var MIN_CLUB_ANGLE = -Math.PI/6;
var MAX_CLUB_ANGLE = Math.PI/6;
var angularVelocity = 1;
var rotationNeg = 0;
var rotationPos = 0;
var rotated = 0;

var NUMBER_OF_BALLS = 16;

var INITIAL_VELOCITY = 15*multF;
var ACCELERATION = 2*multF;

var holes = [];
var balls = [];
var clubs = [];
var clubs_simple = [];

var previousClub = null;
var chosenClub = null;
var previousClub_simple = null;
var chosenClub_simple = null;

var ghostBall = null;

var CAM_DIST = 10 * multF;

class Velocity {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Acceleration {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Position {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Ball {
  constructor(sphere, position, velocity, acceleration)  {
    this.mesh = sphere;
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.stopped = false;
    this.collision = [false, false, false, false]; //left, top, right, down
    this.collidedWith = [];
    this.holeHit = -1;
    this.falling = false;
    this.sphere = new THREE.Object3D();
    this.sphere.add(this.mesh);
  }
}

function createCylinder(x, y, z, segments, color) {
  'use strict';


    var material = new THREE.MeshBasicMaterial({color: color, wireframe: false});
    var geometry = new THREE.CylinderGeometry(x, y, z, segments);
    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

function createBox(x, y, z, color) {
  'use strict';


    var material = new THREE.MeshBasicMaterial({color: color, wireframe: false});
    var geometry = new THREE.BoxGeometry(x, y, z);
    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

function setPosition(object, x, y, z) {
  'use strict';

    object.position.x = x;
    object.position.y = y;
    object.position.z = z;
}

function setRotation(object, x, y, z) {
  'use strict';

  object.rotateX(x);
  object.rotateY(y);
  object.rotateZ(z);
}

function createTable() {
  'use strict';

    table = new THREE.Object3D();

    let base = createBox(TABLE_LENGTH, TABLE_HEIGHT, TABLE_WIDTH, TABLE_COLOR);
    setPosition(base, TABLE_X, 0, TABLE_Z);
    table.add(base);

    let buraco1 = createCylinder(HOLE_RADIUS, HOLE_RADIUS, HOLE_HEIGHT, 32, HOLE_COLOR);
    let x = TABLE_X- TABLE_LENGTH / 2 + HOLE_RADIUS;
    let z = TABLE_Z-TABLE_WIDTH/2+HOLE_RADIUS;
    holes.push(new Position(x, 0, z));
    setPosition(buraco1, x, 0, z);
    table.add(buraco1);

    let buraco2 = createCylinder(HOLE_RADIUS, HOLE_RADIUS, HOLE_HEIGHT, 32, HOLE_COLOR);
    x = TABLE_X;
    z = TABLE_Z-TABLE_WIDTH/2+HOLE_RADIUS;
    holes.push(new Position(x, 0, z));
    setPosition(buraco2, x, 0, z);
    table.add(buraco2);

    let buraco3 = createCylinder(HOLE_RADIUS, HOLE_RADIUS, HOLE_HEIGHT, 32, HOLE_COLOR);
    x = TABLE_X + TABLE_LENGTH / 2 - HOLE_RADIUS;
    z = TABLE_Z-TABLE_WIDTH/2+HOLE_RADIUS;
    holes.push(new Position(x, 0, z));
    setPosition(buraco3, x, 0, z);
    table.add(buraco3);

    let buraco4 = createCylinder(HOLE_RADIUS, HOLE_RADIUS, HOLE_HEIGHT, 32, HOLE_COLOR);
    x = TABLE_X - TABLE_LENGTH / 2 + HOLE_RADIUS;
    z = TABLE_Z+TABLE_WIDTH/2-HOLE_RADIUS;
    holes.push(new Position(x, 0, z));
    setPosition(buraco4, x, 0, z);
    table.add(buraco4);

    let buraco5 = createCylinder(HOLE_RADIUS, HOLE_RADIUS, HOLE_HEIGHT, 32, HOLE_COLOR);
    x = TABLE_X;
    z = TABLE_Z+TABLE_WIDTH/2-HOLE_RADIUS;
    holes.push(new Position(x, 0, z));
    setPosition(buraco5, x, 0, z, 0, 0, 0);
    table.add(buraco5);

    let buraco6 = createCylinder(HOLE_RADIUS, HOLE_RADIUS, HOLE_HEIGHT, 32, HOLE_COLOR);
    x = TABLE_X + TABLE_LENGTH / 2 - HOLE_RADIUS;
    z = TABLE_Z+TABLE_WIDTH/2-HOLE_RADIUS;
    holes.push(new Position(x, 0, z));
    setPosition(buraco6, x, 0, z, 0, 0, 0);
    table.add(buraco6);

    let parede1 = createBox(BIG_WALL_LENGTH, WALL_HEIGHT, WALL_WIDTH, WALL_COLOR);
    setPosition(parede1, TABLE_X, (WALL_HEIGHT/2 - TABLE_HEIGHT/2), (TABLE_Z-TABLE_WIDTH/2-TABLE_HEIGHT/2));
    table.add(parede1);

    let parede2 = createBox(BIG_WALL_LENGTH, WALL_HEIGHT, WALL_WIDTH, WALL_COLOR);
    setPosition(parede2, TABLE_X, (WALL_HEIGHT/2 - TABLE_HEIGHT/2), (TABLE_Z+TABLE_WIDTH/2+TABLE_HEIGHT/2));
    table.add(parede2);

    let parede3 = createBox(WALL_WIDTH, WALL_HEIGHT, SMALL_WALL_LENGTH, WALL_COLOR);
    setPosition(parede3, (TABLE_X - TABLE_LENGTH / 2 -TABLE_HEIGHT/2), (WALL_HEIGHT/2 - TABLE_HEIGHT/2), TABLE_Z);
    table.add(parede3);

    let parede4 = createBox(WALL_WIDTH, WALL_HEIGHT, SMALL_WALL_LENGTH, WALL_COLOR);
    setPosition(parede4, (TABLE_X + TABLE_LENGTH / 2 +TABLE_HEIGHT/2), (WALL_HEIGHT/2 - TABLE_HEIGHT/2), TABLE_Z);
    table.add(parede4);

    scene.add(table);

}

function createClubs() {
  'use strict';

  let taco1 = createCylinder(CLUB_RADIUS_SMALL, CLUB_RADIUS_BIG, CLUB_LENGTH, 32, CLUB_COLOR);
  setRotation(taco1, 0, 0, -Math.PI/2);
  let taco1_obj = new THREE.Object3D();
  taco1_obj.add(taco1);
  setPosition(taco1_obj, TABLE_X - TABLE_LENGTH/2 - 2*WALL_WIDTH - CLUB_LENGTH/2, WALL_HEIGHT, TABLE_Z);
  clubs.push(taco1_obj);
  clubs_simple.push(taco1);
  scene.add(taco1_obj);

  let taco2 = createCylinder(CLUB_RADIUS_SMALL, CLUB_RADIUS_BIG, CLUB_LENGTH, 32, CLUB_COLOR);
  setRotation(taco2, Math.PI/2, 0, 0);
  let taco2_obj = new THREE.Object3D();
  taco2_obj.add(taco2);
  setPosition(taco2_obj, TABLE_X - TABLE_LENGTH/4, WALL_HEIGHT, TABLE_Z - TABLE_WIDTH/2 - 2*WALL_WIDTH - CLUB_LENGTH/2);
  clubs.push(taco2_obj);
  clubs_simple.push(taco2);
  scene.add(taco2_obj);

  let taco3 = createCylinder(CLUB_RADIUS_SMALL, CLUB_RADIUS_BIG, CLUB_LENGTH, 32, CLUB_COLOR);
  setRotation(taco3, Math.PI/2, 0, 0);
  let taco3_obj = new THREE.Object3D();
  taco3_obj.add(taco3);
  setPosition(taco3_obj, TABLE_X + TABLE_LENGTH/4, WALL_HEIGHT, TABLE_Z - TABLE_WIDTH/2 - 2*WALL_WIDTH - CLUB_LENGTH/2);
  clubs.push(taco3_obj);
  clubs_simple.push(taco3);
  scene.add(taco3_obj);

  let taco4 = createCylinder(CLUB_RADIUS_SMALL, CLUB_RADIUS_BIG, CLUB_LENGTH, 32, CLUB_COLOR);
  setRotation(taco4, 0, 0, Math.PI/2);
  let taco4_obj = new THREE.Object3D();
  taco4_obj.add(taco4);
  setPosition(taco4_obj, TABLE_X + TABLE_LENGTH/2 + 2*WALL_WIDTH + CLUB_LENGTH/2, WALL_HEIGHT, TABLE_Z);
  clubs.push(taco4_obj);
  clubs_simple.push(taco4);
  scene.add(taco4_obj);

  let taco5 = createCylinder(CLUB_RADIUS_SMALL, CLUB_RADIUS_BIG, CLUB_LENGTH, 32, CLUB_COLOR);
  setRotation(taco5, -Math.PI/2, 0, 0);
  let taco5_obj = new THREE.Object3D();
  taco5_obj.add(taco5);
  setPosition(taco5_obj, TABLE_X + TABLE_LENGTH/4, WALL_HEIGHT, TABLE_Z + TABLE_WIDTH/2 + 2*WALL_WIDTH + CLUB_LENGTH/2);
  clubs.push(taco5_obj);
  clubs_simple.push(taco5);
  scene.add(taco5_obj);

  let taco6 = createCylinder(CLUB_RADIUS_SMALL, CLUB_RADIUS_BIG, CLUB_LENGTH, 32, CLUB_COLOR);
  setRotation(taco6, -Math.PI/2, 0, 0);
  let taco6_obj = new THREE.Object3D();
  taco6_obj.add(taco6);
  setPosition(taco6_obj, TABLE_X - TABLE_LENGTH/4, WALL_HEIGHT, TABLE_Z + TABLE_WIDTH/2 + 2*WALL_WIDTH + CLUB_LENGTH/2);
  clubs.push(taco6_obj);
  clubs_simple.push(taco6);
  scene.add(taco6_obj);
}

function ballInHole(x, z) {
  'use strict';

  for (let i = 0; i < holes.length; i++) {
    let dist = Math.sqrt(Math.pow(x - holes[i].x, 2) + Math.pow(z - holes[i].z, 2));
    if (dist <= HOLE_RADIUS) return true;
  }

  return false;
}

function checkBallColision(x_1, z_1, x_2, z_2) {
  'use strict';

  let dist = Math.sqrt(Math.pow(x_1 - x_2, 2) + Math.pow(z_1 - z_2, 2));
  return dist <= 2*BALL_RADIUS;
}

function checkOverlappingBalls(x, z) {
  'use strict';

  for (let i = 0; i < balls.length; i++) {
    if (checkBallColision(x, z, balls[i].v_z, balls[i].v_y)) return true;
  }
  return false;
}

function createSphere(radius, color) {
  'use strict';

  let geometry = new THREE.SphereGeometry( radius, 32, 32 );
  let material = new THREE.MeshBasicMaterial( {color: color} );
  let sphere = new THREE.Mesh( geometry, material );

  return sphere;
}

function createBalls() {
  'use strict';

  for (let i = 0; i < NUMBER_OF_BALLS; i++) {
    let sphere = createSphere(BALL_RADIUS, BALL_COLOR);

    // get non confliting positions
    let inHole = true;
    let colision = true;
    let x = 0;
    let z = 0;
    while (inHole || colision) {
        x = Math.random() * (TABLE_LENGTH - 2*BALL_RADIUS) + TABLE_X - TABLE_LENGTH / 2 + BALL_RADIUS;
        z = Math.random() * (TABLE_WIDTH - 2*BALL_RADIUS) + TABLE_Z - TABLE_WIDTH / 2 + BALL_RADIUS;
        inHole = ballInHole(x, z);
        colision = checkOverlappingBalls(x, z);
    }

    // get random inicial direction
    let direction = [-1, 1];
    let seed = Math.random();
    let v_x = seed * INITIAL_VELOCITY;
    let v_z = Math.sqrt(Math.pow(INITIAL_VELOCITY, 2) - Math.pow(v_x, 2));
    v_x *= direction[Math.floor(Math.random() * 2)];
    v_z *= direction[Math.floor(Math.random() * 2)];

    var a_x = seed * ACCELERATION;
    var a_z = Math.sqrt(Math.pow(ACCELERATION, 2) - Math.pow(a_x, 2));
    if (v_x > 0) a_x *= -1;
    if (v_z > 0) a_z *= -1;

    let position = new Position(x, BALL_Y, z);
    let velocity = new Velocity(v_x, 0, v_z);
    let acceleration = new Acceleration(a_x, 0, a_z);

    let ball = new Ball(sphere, position, velocity, acceleration);

    setPosition(ball.sphere, x, BALL_Y, z);
    balls.push(ball);
    scene.add(ball.sphere);
  }
}

function createScene() {
    'use strict';

    scene = new THREE.Scene();
    // scene.add(new THREE.AxisHelper(100));

    createTable();
    createBalls();
    createClubs();

}

function createCameras() {
    'use strict';

    topCamera = new THREE.OrthographicCamera(window.innerWidth / - 3, window.innerWidth / 3, window.innerHeight / 3, window.innerHeight / - 3, 1, 1000);
    chosenCamera = topCamera;

    topCamera.position.x = 0;
    topCamera.position.y = 100;
    topCamera.position.z = 0;
    topCamera.lookAt(new THREE.Vector3(0, 0, 0));

    sceneCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    sceneCamera.position.x = TABLE_X;
    sceneCamera.position.y = 250;
    sceneCamera.position.z = 300;
    sceneCamera.lookAt(new THREE.Vector3(TABLE_X, 0, TABLE_Z));

    ballCamera =  new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

}

function onResize() {
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        topCamera.left = window.innerWidth / - 2;
        topCamera.right = window.innerWidth / 2;
        topCamera.top = window.innerHeight / 2;
        topCamera.bottom = window.innerHeight / -2;
        topCamera.updateProjectionMatrix();

        sceneCamera.aspect = window.innerWidth / window.innerHeight;
        sceneCamera.updateProjectionMatrix();

        ballCamera.aspect = window.innerWidth / window.innerHeight;
        ballCamera.updateProjectionMatrix();
    }

}

function switchClub(i) {
  'use strict';

  nextClub = -1;
  previousClub = chosenClub;
  previousClub_simple = chosenClub_simple;
  if(previousClub != null) {
    previousClub.rotateY(-rotated);
    rotated = 0;
    previousClub_simple.material.color.setHex(WALL_COLOR);
  }
  chosenClub = clubs[i];
  chosenClub_simple = clubs_simple[i];
  chosenClub_simple.material.color.setHex(0x994d00);

  if (ghostBall != null) {
    scene.remove(ghostBall.sphere);
    ghostBall = null;
  }

  drawGhostBall();
}

function onKeyDown(e) {
    'use strict';

    switch (e.keyCode) {
    case 49: // 1
        chosenCamera = topCamera;
        break;
    case 50: // 2
        chosenCamera = sceneCamera;
        break;
    case 51: // 3
        if (ballCameraOn) chosenCamera = ballCamera;
        break;
    case 52: // 4
        nextClub = 0;
        break;
    case 53: // 5
        nextClub = 1;
        break;
    case 54: // 6
        nextClub = 2;
        break;
    case 55: // 7
        nextClub = 3;
        break;
    case 56: // 8
        nextClub = 4;
        break;
    case 57: // 9
        nextClub = 5;
        break;
    case 37: // left arrow
        if(chosenClub != null) {
          rotationPos = 1;
        }
        break;
    case 39: // right arrow
        if(chosenClub != null) {
          rotationNeg = 1;
        }
        break;
    case 32: // space bar
        if (ghostBall != null && canLaunch) {
          ballCameraOn = true;
          ghostBall.stopped = false;
          canLaunch = false;
        }
        break;
    }
}

function onKeyUp(e) {
    'use strict';

    switch (e.keyCode) {
    case 32: // space bar
        canLaunch = true;
        break;
    case 37: // left arrow
      if(chosenClub != null) {
        rotationPos = 0;
      }
      break;
    case 39: // right arrow
      if(chosenClub != null) {
        rotationNeg = 0;
      }
      break;
    }
}

function render() {
    'use strict';
    renderer.render(scene, chosenCamera);
}

function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    clock.start();

    createScene();
    createCameras();
    render();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

function updateAcceleration(i) {
  'use strict';

  if (balls[i].velocity.x < 0) {
    balls[i].acceleration.x = Math.abs(balls[i].acceleration.x);
  }
  else if (balls[i].velocity.x > 0) {
    balls[i].acceleration.x = - Math.abs(balls[i].acceleration.x);
  }

  if (balls[i].velocity.z < 0) {
    balls[i].acceleration.z = Math.abs(balls[i].acceleration.z);
  }
  else if (balls[i].velocity.z > 0) {
    balls[i].acceleration.z = - Math.abs(balls[i].acceleration.z);
  }
}

function updateBalls(deltaTime) {
  'use strict';

  for (let i = 0; i < NUMBER_OF_BALLS; i++) {
    if (!balls[i].stopped && !balls[i].falling) {

      balls[i].velocity.x += balls[i].acceleration.x * deltaTime;
      balls[i].velocity.z += balls[i].acceleration.z * deltaTime;

      let velocity = Math.sqrt(Math.pow(balls[i].velocity.x, 2) + Math.pow(balls[i].velocity.z, 2));

      if (velocity < 0.0001 * INITIAL_VELOCITY) {
        balls[i].velocity.x = 0;
        balls[i].velocity.z = 0;
        balls[i].stopped = true;
      }
      else {
        balls[i].position.x += balls[i].velocity.x * deltaTime;
        balls[i].position.z += balls[i].velocity.z * deltaTime;
      }

      setPosition(balls[i].sphere, balls[i].position.x, balls[i].position.y, balls[i].position.z);

    }
    else if (!balls[i].stopped && balls[i].falling) {
      balls[i].position.y += balls[i].velocity.y * deltaTime;
      setPosition(balls[i].sphere, balls[i].position.x, balls[i].position.y, balls[i].position.z);
    }
  }
}

function checkWallCollision() {
  'use strict';

  // handle wall hits
  for (let i = 0; i < NUMBER_OF_BALLS; i++) {
    let x = balls[i].position.x;
    let z = balls[i].position.z;

    // left
    if (x <= TABLE_BOUNDS[0] + BALL_RADIUS)
      balls[i].collision[0] = true;

    // top
    if (z <= TABLE_BOUNDS[1] + BALL_RADIUS)
      balls[i].collision[1] = true;

    // right
    if (x >= TABLE_BOUNDS[2] - BALL_RADIUS)
      balls[i].collision[2] = true;

    // down
    if (z >= TABLE_BOUNDS[3] - BALL_RADIUS)
      balls[i].collision[3] = true;
  }
}

function handleWallCollision() {
  'use strict';

  // handle wall hits
  for (let i = 0; i < NUMBER_OF_BALLS; i++) {
    let velocity = Math.sqrt(Math.pow(balls[i].velocity.x, 2) + Math.pow(balls[i].velocity.z, 2));
    // left
    if (balls[i].collision[0]) {
      let angle = Math.acos(balls[i].velocity.x / velocity);
      let delta_x = TABLE_BOUNDS[0] - (balls[i].position.x - BALL_RADIUS);
      let delta_z = - delta_x * Math.sin(angle);

      balls[i].position.x = TABLE_BOUNDS[0] + BALL_RADIUS;
      balls[i].position.z += delta_z;

      balls[i].velocity.x *= -1;
      balls[i].acceleration.x *= -1;

      balls[i].collision[0] = false;
    }
    // top
    if (balls[i].collision[1]) {

      let angle = Math.acos(balls[i].velocity.z / velocity);
      let delta_z = TABLE_BOUNDS[1] - (balls[i].position.z - BALL_RADIUS);
      let delta_x = - delta_z * Math.sin(angle);

      balls[i].position.x += delta_x;
      balls[i].position.z = TABLE_BOUNDS[1] + BALL_RADIUS;

      balls[i].velocity.z *= -1;
      balls[i].acceleration.z *= -1;

      balls[i].collision[1] = false;
    }
    // right
    if (balls[i].collision[2]) {

      let angle = Math.acos(balls[i].velocity.x / velocity);
      let delta_x = (balls[i].position.x + BALL_RADIUS) - TABLE_BOUNDS[2];
      let delta_z = delta_x * Math.sin(angle);

      balls[i].position.x = TABLE_BOUNDS[2] - BALL_RADIUS;
      balls[i].position.z += delta_z;

      balls[i].position.x = TABLE_BOUNDS[2] - BALL_RADIUS;

      balls[i].velocity.x *= -1;
      balls[i].acceleration.x *= -1;

      balls[i].collision[2] = false;
    }
    // down
    if (balls[i].collision[3]) {

      let angle = Math.acos(balls[i].velocity.z / velocity);
      let delta_z = (balls[i].position.z + BALL_RADIUS) - TABLE_BOUNDS[3];
      let delta_x = delta_z * Math.sin(angle);

      balls[i].position.x += delta_x;
      balls[i].position.z = TABLE_BOUNDS[3] - BALL_RADIUS;

      balls[i].velocity.z *= -1;
      balls[i].acceleration.z *= -1;

      balls[i].collision[3] = false;
  	}
  }
}

function checkEveryBallCollision() {
  'use strict';

  for (let i = 0; i < NUMBER_OF_BALLS; i++)
    for (let j = 0; j < NUMBER_OF_BALLS; j++)
      if (i != j && !balls[i].falling && !balls[j].falling && checkBallColision(balls[i].position.x, balls[i].position.z, balls[j].position.x, balls[j].position.z))
        balls[i].collidedWith.push(j);
}

function handleEveryBallCollision() {
  'use strict';

  for (let i = 0; i < NUMBER_OF_BALLS; i++) {
    for (let j = 0; j < balls[i].collidedWith.length; j++) {

      let ball_j = balls[balls[i].collidedWith[j]];

      let dist = Math.sqrt(Math.pow(balls[i].position.x - ball_j.position.x, 2) + Math.pow(balls[i].position.z - ball_j.position.z, 2));

      let coeficiente_1 = (balls[i].velocity.x - ball_j.velocity.x) * (balls[i].position.x - ball_j.position.x) + (balls[i].velocity.z - ball_j.velocity.z) * (balls[i].position.z - ball_j.position.z);
      coeficiente_1 /= Math.pow(dist, 2);

      let coeficiente_2 = (ball_j.velocity.x - balls[i].velocity.x) * (ball_j.position.x - balls[i].position.x) + (ball_j.velocity.z - balls[i].velocity.z) * (ball_j.position.z - balls[i].position.z);
      coeficiente_2 /= Math.pow(dist, 2);

      balls[i].velocity.x = balls[i].velocity.x - coeficiente_1 * (balls[i].position.x - ball_j.position.x);
      balls[i].velocity.z = balls[i].velocity.z - coeficiente_1 * (balls[i].position.z - ball_j.position.z);

      ball_j.velocity.x = ball_j.velocity.x - coeficiente_2 * (ball_j.position.x - balls[i].position.x);
      ball_j.velocity.z = ball_j.velocity.z - coeficiente_2 * (ball_j.position.z - balls[i].position.z);

      let velocity = Math.sqrt(Math.pow(balls[i].velocity.x, 2) + Math.pow(balls[i].velocity.z, 2));
      let teta = Math.asin(balls[i].velocity.z / velocity);
      balls[i].acceleration.x = Math.cos(teta) * ACCELERATION;
      balls[i].acceleration.z = Math.sin(teta) * ACCELERATION;

      velocity = Math.sqrt(Math.pow(ball_j.velocity.x, 2) + Math.pow(ball_j.velocity.z, 2));
      teta = Math.asin(ball_j.velocity.z / velocity);
      ball_j.acceleration.x = Math.cos(teta) * ACCELERATION;
      ball_j.acceleration.z = Math.sin(teta) * ACCELERATION;

      velocity = Math.sqrt(Math.pow(balls[i].velocity.x, 2) + Math.pow(balls[i].velocity.z, 2));
      balls[i].stopped = (velocity == 0);
      velocity = Math.sqrt(Math.pow(ball_j.velocity.x, 2) + Math.pow(ball_j.velocity.z, 2));
      ball_j.stopped = (velocity == 0);

      let angle;
      dist = 2*BALL_RADIUS - dist;
      let delta_x;
      let delta_z;
      if (balls[i].position.x - ball_j.position.x == 0) {
        delta_x = 0;
        delta_z = dist;
      }
      else {
        angle = Math.atan(Math.abs((balls[i].position.z - ball_j.position.z) / (balls[i].position.x - ball_j.position.x)));
        delta_x = Math.cos(angle) * dist;
        delta_z = Math.sin(angle) * dist;
      }

      if (balls[i].position.x < ball_j.position.x) {
        balls[i].position.x = balls[i].position.x - delta_x / 2;
        ball_j.position.x = ball_j.position.x + delta_x / 2;
      }
      else {
        balls[i].position.x = balls[i].position.x + delta_x / 2;
        ball_j.position.x = ball_j.position.x - delta_x / 2;
      }

      if (balls[i].position.z < ball_j.position.z) {
        balls[i].position.z = balls[i].position.z - delta_z / 2;
        ball_j.position.z = ball_j.position.z + delta_z / 2;
      }
      else {
        balls[i].position.z = balls[i].position.z + delta_z / 2;
        ball_j.position.z = ball_j.position.z - delta_z / 2;
      }
      updateAcceleration(balls[i].collidedWith[j]);

      balls[i].collidedWith.splice(j, 1);
      for (let k = 0; k < ball_j.collidedWith.length; k++) {
        if(ball_j.collidedWith[k] == i) {
          ball_j.collidedWith.splice(k, 1);
        }
      }
    }
    updateAcceleration(i);
  }
}

function checkHoleHit() {
  'use strict';

  for (let i = 0; i < NUMBER_OF_BALLS; i++) {
    for (let j = 0; j < holes.length; j++) {

      let dist = Math.sqrt(Math.pow(balls[i].position.x - holes[j].x, 2) + Math.pow(balls[i].position.z - holes[j].z, 2));
      if (dist < HOLE_RADIUS) {
        balls[i].holeHit = j;
        balls[i].falling = true;
      }
    }
  }
}

function handleHoleHit() {
  'use strict';

  for (let i = 0; i < NUMBER_OF_BALLS; i++) {
    if (balls[i].falling) {
      balls[i].velocity.x = 0;
      balls[i].velocity.y = -INITIAL_VELOCITY;
      balls[i].velocity.z = 0;

      balls[i].acceleration.x = 0;
      balls[i].acceleration.y = 0;
      balls[i].acceleration.z = 0;

      // setPosition(balls[i].sphere, holes[balls[i].holeHit].x, balls[i].position.y, holes[balls[i].holeHit].z)

    }
  }
}


function rotateClub(deltaTime) {
  'use strict';

  if (rotationNeg == 1) {
    if (rotated > MIN_CLUB_ANGLE) {
      chosenClub.rotateY(-deltaTime * angularVelocity);
      rotated -= deltaTime * angularVelocity;
    }
    else {
      chosenClub.rotateY(MIN_CLUB_ANGLE - rotated);
      rotated = MIN_CLUB_ANGLE;
    }
    drawGhostBall();
  }
  if (rotationPos == 1) {
    if (rotated < MAX_CLUB_ANGLE) {
      chosenClub.rotateY(deltaTime * angularVelocity);
      rotated += deltaTime * angularVelocity;
    }
    else {
      chosenClub.rotateY(MAX_CLUB_ANGLE - rotated);
      rotated = MAX_CLUB_ANGLE;
    }
    drawGhostBall();
  }
}


function drawGhostBall() {
  'use strict';

  if (chosenClub == null) return;

  // upper clubs
  if (chosenClub == clubs[0]) {
    let dist_x = TABLE_X - TABLE_LENGTH / 2 + 2 * BALL_RADIUS - chosenClub.position.x;
    let delta_z = Math.tan(rotated) * dist_x;
    if (ghostBall != null) {
      ghostBall.position.z = - (TABLE_Z + delta_z);
      setPosition(ghostBall.sphere, ghostBall.position.x, BALL_Y, ghostBall.position.z);
      return;
    }

    let sphere = createSphere(BALL_RADIUS, GHOST_BALL_COLOR);
    let position = new Position(TABLE_X - TABLE_LENGTH / 2 + 2 * BALL_RADIUS, BALL_Y, - (TABLE_Z + delta_z));

    ghostBall = new Ball(sphere, position, null, null);
    setPosition(ghostBall.sphere, ghostBall.position.x, BALL_Y, ghostBall.position.z);
  }

  else if (chosenClub == clubs[3]) {
    let dist_x = chosenClub.position.x - TABLE_X - TABLE_LENGTH / 2 + 2 * BALL_RADIUS;
    let delta_z = Math.tan(rotated) * dist_x;
    if (ghostBall != null) {
      ghostBall.position.z = TABLE_Z + delta_z;
      setPosition(ghostBall.sphere, ghostBall.position.x, BALL_Y, ghostBall.position.z);
      return;
    }

    let sphere = createSphere(BALL_RADIUS, GHOST_BALL_COLOR);
    let position = new Position(TABLE_X + TABLE_LENGTH / 2 - 2 * BALL_RADIUS, BALL_Y, TABLE_Z + delta_z);

    ghostBall = new Ball(sphere, position, null, null);
    setPosition(ghostBall.sphere, ghostBall.position.x, BALL_Y, ghostBall.position.z);
  }

  else if (chosenClub == clubs[1] || chosenClub == clubs[2]) {
    let dist_z =  TABLE_Z - TABLE_WIDTH / 2 + 2 * BALL_RADIUS - chosenClub.position.z;
    let delta_x = Math.tan(rotated) * dist_z;
    if (ghostBall != null) {
      if (chosenClub == clubs[1])
        ghostBall.position.x = TABLE_X + delta_x - TABLE_LENGTH/4;
      else
        ghostBall.position.x = TABLE_X + delta_x + TABLE_LENGTH/4;
      setPosition(ghostBall.sphere, ghostBall.position.x, BALL_Y, ghostBall.position.z);
      return;
    }
    let sphere = createSphere(BALL_RADIUS, GHOST_BALL_COLOR);
    let position;
    if (chosenClub == clubs[1])
      position = new Position(TABLE_X + delta_x - TABLE_LENGTH/4, BALL_Y, TABLE_Z - TABLE_WIDTH / 2 + 2 * BALL_RADIUS);
    else
      position = new Position(TABLE_X + delta_x + TABLE_LENGTH/4, BALL_Y, TABLE_Z - TABLE_WIDTH / 2 + 2 * BALL_RADIUS);

    ghostBall = new Ball(sphere, position, null, null);
    setPosition(ghostBall.sphere, ghostBall.position.x, BALL_Y, ghostBall.position.z);
  }

  else if (chosenClub == clubs[4] || chosenClub == clubs[5]) {
    let dist_z =  chosenClub.position.z - TABLE_Z - TABLE_WIDTH / 2 + 2 * BALL_RADIUS;
    let delta_x = Math.tan(rotated) * dist_z;
    if (ghostBall != null) {
      if (chosenClub == clubs[4])
        ghostBall.position.x = TABLE_X - delta_x + TABLE_LENGTH/4;
      else
        ghostBall.position.x = TABLE_X - delta_x - TABLE_LENGTH/4;
      setPosition(ghostBall.sphere, ghostBall.position.x, BALL_Y, ghostBall.position.z);
      return;
    }
    let sphere = createSphere(BALL_RADIUS, GHOST_BALL_COLOR);
    let position;
    if (chosenClub == clubs[4])
      position = new Position(TABLE_X - delta_x + TABLE_LENGTH/4, BALL_Y, TABLE_Z + TABLE_WIDTH / 2 - 2 * BALL_RADIUS);
    else
      position = new Position(TABLE_X - delta_x - TABLE_LENGTH/4, BALL_Y, TABLE_Z + TABLE_WIDTH / 2 - 2 * BALL_RADIUS);

    ghostBall = new Ball(sphere, position, null, null);
    setPosition(ghostBall.sphere, ghostBall.position.x, BALL_Y, ghostBall.position.z);
  }

  ghostBall.stopped = true;

  scene.add(ghostBall.sphere);

}

function launchGhostBall() {
  'use strict';

  if (ghostBall == null || ghostBall.stopped || chosenClub == null) return;

  if (chosenClub == clubs[0]) {
    let velocity = new Velocity(INITIAL_VELOCITY * Math.cos(rotated), 0, - INITIAL_VELOCITY * Math.sin(rotated));
    let acceleration = new Acceleration(ACCELERATION * Math.cos(rotated) , 0, ACCELERATION * Math.sin(rotated));
    ghostBall.velocity = velocity;
    ghostBall.acceleration = acceleration;
  }

  else if (chosenClub == clubs[3]) {
    let velocity = new Velocity(-INITIAL_VELOCITY * Math.cos(rotated), 0, INITIAL_VELOCITY * Math.sin(rotated));
    let acceleration = new Acceleration(ACCELERATION * Math.cos(rotated) , 0, ACCELERATION * Math.sin(rotated));
    ghostBall.velocity = velocity;
    ghostBall.acceleration = acceleration;
  }

  else if (chosenClub == clubs[1] || chosenClub == clubs[2]) {
    let velocity = new Velocity(INITIAL_VELOCITY * Math.sin(rotated), 0, INITIAL_VELOCITY * Math.cos(rotated));
    let acceleration = new Acceleration(ACCELERATION * Math.sin(rotated) , 0, ACCELERATION * Math.cos(rotated));
    ghostBall.velocity = velocity;
    ghostBall.acceleration = acceleration;
  }

  else if (chosenClub == clubs[4] || chosenClub == clubs[5]) {
    let velocity = new Velocity(-INITIAL_VELOCITY * Math.sin(rotated), 0, -INITIAL_VELOCITY * Math.cos(rotated));
    let acceleration = new Acceleration(ACCELERATION * Math.sin(rotated) , 0, ACCELERATION * Math.cos(rotated));
    ghostBall.velocity = velocity;
    ghostBall.acceleration = acceleration;
  }


  ghostBall.mesh.material.color.setHex(BALL_COLOR);
  drawGhostBall();


  balls.push(ghostBall);
  NUMBER_OF_BALLS += 1;

  updateAcceleration(NUMBER_OF_BALLS - 1);

  ghostBall = null;
  drawGhostBall();

}

function updateBallCamera() {
  'use strict';

  if (NUMBER_OF_BALLS == 0) return;
  if (balls[NUMBER_OF_BALLS - 1].velocity.x == 0 && balls[NUMBER_OF_BALLS - 1].velocity.y == 0 && balls[NUMBER_OF_BALLS - 1].velocity.z == 0) return;

  if (balls[NUMBER_OF_BALLS - 1].falling) {
    ballCamera.position.y = balls[NUMBER_OF_BALLS - 1].position.y + 50;
    ballCamera.lookAt(new THREE.Vector3(balls[NUMBER_OF_BALLS - 1].position.x, balls[NUMBER_OF_BALLS - 1].position.y, balls[NUMBER_OF_BALLS - 1].position.z));
    return;
  }

  let direction = new THREE.Vector3(balls[NUMBER_OF_BALLS - 1].velocity.x, 0,  balls[NUMBER_OF_BALLS - 1].velocity.z);
  direction.normalize();

  ballCamera.position.y = balls[NUMBER_OF_BALLS - 1].position.y + 50;

  ballCamera.position.x = balls[NUMBER_OF_BALLS - 1].position.x - CAM_DIST * direction.x;
  ballCamera.position.z = balls[NUMBER_OF_BALLS - 1].position.z - CAM_DIST * direction.z;
  ballCamera.lookAt(new THREE.Vector3(balls[NUMBER_OF_BALLS - 1].position.x, balls[NUMBER_OF_BALLS - 1].position.y, balls[NUMBER_OF_BALLS - 1].position.z));

}

function rotateBalls(deltaTime) {
  'use strict';

  for (let i = 0; i < NUMBER_OF_BALLS; i++) {
    let velocity = Math.sqrt(Math.pow(balls[i].velocity.x, 2) + Math.pow(balls[i].velocity.z, 2));
    let angular_velocity = velocity / BALL_RADIUS;

    let direction = new THREE.Vector3(balls[i].velocity.x, 0 , balls[i].velocity.z);
    direction.cross(new THREE.Vector3(0, 1, 0));
    direction.normalize();

    balls[i].sphere.rotateOnWorldAxis(direction, angular_velocity * deltaTime);
  }
}


function update() {
  'use strict';

  let deltaTime = clock.getDelta();

  launchGhostBall();
  updateBalls(deltaTime);

  checkEveryBallCollision();
  checkWallCollision();
  checkHoleHit();

  handleEveryBallCollision();
  handleWallCollision();
  handleHoleHit();

  if (ballCameraOn) updateBallCamera();

  if (nextClub != -1) switchClub(nextClub);
  rotateClub(deltaTime);

  rotateBalls(deltaTime);

}

function animate() {
    'use strict';

    update();

    render();

    requestAnimationFrame(animate);
}

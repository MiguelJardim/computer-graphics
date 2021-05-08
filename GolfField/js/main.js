/* jshint esversion: 6 */

var renderer, scene, paused_scene;
var controls;
var clock = new THREE.Clock();

var camera;
var paused_camera;
var mult_f = 1;

var directional_light = new THREE.Object3D();
var point_light = new THREE.Object3D();

var meshes = [];
var materials = [];
var material_index = 0;

var switch_materials_flag = false;
var wireframe = false;

var paused = false;
var reset_scene = false;

var rotated = 0;

var point_light_on = true;
var directional_light_on = true;

var ball = new THREE.Object3D();
var BALL_RADIUS = 10 * mult_f;
var BALL_COLOR = 0xffffff;
var BALL_VELOCITY = 1.5 * mult_f;

var flag = new THREE.Object3D();
var POLE_HEIGHT = 120 * mult_f;
var POLE_RADIUS = 1 * mult_f;
var POLE_COLOR = 0xffffff;
var FLAG_COLOR = 0xff0000;
var FLAG_LENGTH = 40 * mult_f;
var FLAG_WIDTH = 25 * mult_f;
var FLAG_HEIGHT = 1 * mult_f;
var FLAG_SPEED = 3 * mult_f;

var DIRECTIONAL_LIGHT_INTENSITY = 0.8;
var LIGHT_COLOR = 0xffffff;

var FLOOR_LENGTH = 750 * mult_f;
var FLOOR_HEIGHT = 1 * mult_f;

var MESSAGE_BOX_LENGHT = 750;
var MESSAGE_BOX_WIDTH = 50;
var MESSAGE_BOX_HEIGHT = 250;
var MESSAGE_BOX_COLOR = 0xffffff;


function set_position(object, x, y, z) {
  'use strict';

    object.position.x = x;
    object.position.y = y;
    object.position.z = z;
}

function set_rotation(object, x, y, z) {
  'use strict';

  object.rotateX(x);
  object.rotateY(y);
  object.rotateZ(z);
}

function create_cylinder(lower_radius, upper_radius, height, color) {
    let geometry = new THREE.CylinderGeometry( lower_radius, upper_radius, height, 8 );
    let materialp = new THREE.MeshPhongMaterial({color: color});
    let materialb = new THREE.MeshBasicMaterial({color: color});
    let cylinder = new THREE.Mesh( geometry, materialp );
    meshes.push(cylinder);
    materials.push([materialp, materialb]);

    return cylinder;
}

function create_box(length, width, height, color) {
    'use strict';

    let geometry = new THREE.BoxGeometry(length, height, width, 8, 8);

    let materialp = new THREE.MeshPhongMaterial({color: FLAG_COLOR});
    let materialb = new THREE.MeshBasicMaterial({color: FLAG_COLOR});

    let mesh = new THREE.Mesh(geometry, materialp);
    meshes.push(mesh);
    materials.push([materialp, materialb]);

    return mesh;
}

function create_flag() {
    let pole_mesh = create_cylinder(POLE_RADIUS, POLE_RADIUS, POLE_HEIGHT, POLE_COLOR);
    let flag_mesh = create_box(FLAG_LENGTH, FLAG_HEIGHT, FLAG_WIDTH, FLAG_COLOR);

    set_position(pole_mesh, 0, POLE_HEIGHT / 2, 0);
    set_position(flag_mesh, FLAG_LENGTH / 2, POLE_HEIGHT - FLAG_WIDTH / 2, 0);

    flag.add(pole_mesh);
    flag.add(flag_mesh);
}

function create_floor() {
  'use strict';

    let geometry = new THREE.BoxGeometry(FLOOR_LENGTH, FLOOR_HEIGHT, FLOOR_LENGTH, 32, 32);

    let grass = new THREE.TextureLoader().load('img/grass.png', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set( 0, 0 );
        texture.repeat.set( 2, 2 );
    } );

    let bgrass = new THREE.TextureLoader().load('img/grass-bump.jpg', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    } );

    let materialp = new THREE.MeshPhongMaterial({map: grass, bumpMap: bgrass});
    let materialb = new THREE.MeshBasicMaterial({map: grass});

    let mesh = new THREE.Mesh(geometry, materialp);
    meshes.push(mesh);
    materials.push([materialp, materialb]);

    return mesh;
}

function create_ball() {
    'use strict';

    let golf_ball = new THREE.TextureLoader().load('img/ball.jpg');

    let materialp = new THREE.MeshPhongMaterial({color: BALL_COLOR, normalMap: golf_ball});

    let materialb = new THREE.MeshBasicMaterial({color: BALL_COLOR});

    materialp.shininess = 100;

    let geometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);

    let ball_mesh = new THREE.Mesh(geometry, materialp);
    meshes.push(ball_mesh);
    materials.push([materialp, materialb]);

    ball.add(ball_mesh);
    ball.userData = { jumping: true, step: 0 };
    set_position(ball, 0, BALL_RADIUS + FLOOR_HEIGHT / 2, 0);
}

function create_lights() {

    let light = new THREE.DirectionalLight(LIGHT_COLOR, DIRECTIONAL_LIGHT_INTENSITY);
    directional_light.add(light);
    set_position(directional_light, 0, 500, 200);
    scene.add(directional_light);

    light = new THREE.PointLight(LIGHT_COLOR, 1, 1000, 1);
    point_light.add(light);
    set_position(point_light, - FLOOR_LENGTH/10, FLOOR_HEIGHT / 2  + 2 * BALL_RADIUS, - FLOOR_LENGTH/10);
    scene.add(point_light);

}

function create_camera() {
    'use strict';

    camera = new THREE.PerspectiveCamera (45, window.innerWidth/window.innerHeight, 1, 10000);
    set_position(camera, -600, 600, 600);
    camera.lookAt (new THREE.Vector3(0,0,0));

    controls = new THREE.OrbitControls (camera, renderer.domElement);
}

function create_sky_box() {
    'use strict';

    let texture_cube = new THREE.CubeTextureLoader()
        .setPath('img/cubemap/')
            .load([
                'px.png',
                'nx.png',
                'py.png',
                'ny.png',
                'pz.png',
                'nz.png'
            ]);

    scene.background = texture_cube;
}

function create_scene() {
    'use strict';

    scene = new THREE.Scene();

    let floor = create_floor();

    create_ball();

    create_flag();
    set_position(flag, - FLOOR_LENGTH / 4, 0, - FLOOR_LENGTH / 4);
    scene.add(flag);

    create_lights();
    create_camera();

    scene.add(ball);
    scene.add(floor);

    create_sky_box();
}

function create_paused_scene() {
    'use strict';

    paused_scene = new THREE.Scene();

    let geometry = new THREE.BoxGeometry(MESSAGE_BOX_WIDTH, MESSAGE_BOX_HEIGHT, MESSAGE_BOX_LENGHT, 32, 32);
    let texture = new THREE.TextureLoader().load('img/paused.jpg');
    let material = new THREE.MeshBasicMaterial({color: MESSAGE_BOX_COLOR, map: texture});
    let message_box = new THREE.Mesh(geometry, material);

    set_position(message_box, 0, 0, 0);

    paused_camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
    set_position(paused_camera, 100, 0, 0);
    paused_camera.lookAt (new THREE.Vector3(0,0,0));

    paused_scene.add(message_box);
    paused_scene.add(paused_camera);
}

function switch_materials() {
    'use strict';
    if (!switch_materials_flag) return;
    material_index = material_index == 0 ? 1: 0;
    for (let i = 0; i < meshes.length; i++) {
        let wireframe_on = meshes[i].material.wireframe;
        meshes[i].material = materials[i][material_index];
        meshes[i].material.wireframe = wireframe_on;
    }
    switch_materials_flag = false;
}

function toggle_wireframe() {
    'use strict';
    if (!wireframe) return;

    for (let i = 0; i < meshes.length; i++) {
        meshes[i].material.wireframe = !meshes[i].material.wireframe;
    }
    wireframe = false;
}

function update_lights() {
    'use strict';

    if (directional_light_on) directional_light.visible = true;
    else directional_light.visible = false;

    if (point_light_on) point_light.visible = true;
    else point_light.visible = false;
}

function rotate_flag(delta_time) {
    rotated = (rotated + delta_time * FLAG_SPEED) % (2 * Math.PI);
    set_rotation(flag, 0, delta_time * FLAG_SPEED, 0);
}

function move_ball(delta_time) {
    if (ball.userData.jumping) {
        ball.userData.step += delta_time * BALL_VELOCITY;
        ball.position.x = (FLOOR_LENGTH/10) * (Math.cos(ball.userData.step)) - (FLOOR_LENGTH/10);
        ball.position.y = FLOOR_HEIGHT/ 2 + BALL_RADIUS + Math.abs((FLOOR_LENGTH/10) * (Math.sin(ball.userData.step)));
        ball.position.z = (FLOOR_LENGTH/10) * (Math.cos(ball.userData.step)) - (FLOOR_LENGTH/10);
    }
}

function reset() {
    set_position(ball, 0, BALL_RADIUS + FLOOR_HEIGHT / 2, 0);
    ball.userData.jumping = true;
    ball.userData.step = 0;

    set_rotation(flag, 0, - rotated, 0);
    rotated = 0;

    for (let i = 0; i < meshes.length; i++) {
        meshes[i].material = materials[i][0];
    }

    for (let i = 0; i < meshes.length; i++) {
        meshes[i].material.wireframe = false;
    }

    set_position(camera, -600, 600, 600);

    controls.reset();

    point_light_on = true;
    directional_light_on = true;

    wireframe = false;

    paused = false;

    reset_scene = false;
}

function on_resize() {
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {

        paused_camera.left = window.innerWidth / - 2;
        paused_camera.right = window.innerWidth / 2;
        paused_camera.top = window.innerHeight / 2;
        paused_camera.bottom = window.innerHeight / - 2;
        paused_camera.updateProjectionMatrix();

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

    }

}

function on_key_down(e) {
    'use strict';

    switch (e.keyCode) {
        case 66: // b
            if (!paused) ball.userData.jumping = !ball.userData.jumping;
            break;
        case 68: // d
            if (!paused) directional_light_on = !directional_light_on;
            break;
        case 80: // p
            if (!paused) point_light_on = !point_light_on;
            break;
        case 82: // r
            reset_scene = true;
            break;
        case 83: // s
            paused = !paused;
            break;
        case 73: // I
            if (!paused) switch_materials_flag = true;
            break;
		case 87: // w, W
            if (!paused) wireframe = true;
			break;
    }
}


function render() {
    'use strict';

    renderer.autoClear = false;
    renderer.clear();
    renderer.render(scene, camera);
    if (paused) renderer.render(paused_scene, paused_camera);

}

function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    clock.start();

    create_scene();
    create_paused_scene();
    render();

    window.addEventListener("keydown", on_key_down);
    window.addEventListener("resize", on_resize);
}

function update() {
    'use strict';

    if (reset_scene) reset();

    let delta_time = clock.getDelta();
    if (paused) delta_time = 0;

    switch_materials();
    toggle_wireframe();

    update_lights();

    rotate_flag(delta_time);

    move_ball(delta_time);

}

function animate() {
    'use strict';

    update();

    controls.update();

    render();

    requestAnimationFrame(animate);
}

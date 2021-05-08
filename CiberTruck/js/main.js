/* jshint esversion: 6 */

var renderer, scene;
var clock = new THREE.Clock();

var lateral_camera, top_camera, selected_camera;

var platform = new THREE.Object3D();
var cybertruck = new THREE.Object3D();

var change_directional_light = false;
var directional_light = new THREE.Object3D();
var DIRECTIONAL_LIGHT_INTENSITY = 0.4;

var change_spotlight_1 = false;
var change_spotlight_2 = false;
var change_spotlight_3 = false;
var spotlight_1 = new THREE.Object3D();
var spotlight_2 = new THREE.Object3D();
var spotlight_3 = new THREE.Object3D();

var LIGHT_COLOR = 0xFFFFFF;

var mult_f = 1;

var FLOOR_COLOR = 0x00DCFF;
var FLOOR_LENGHT = 750 * mult_f;
var FLOOR_WIDTH = 750 * mult_f;

var PLATFORM_RADIUS = 200 * mult_f;
var PLATFORM_HEIGHT = 10 * mult_f;
var PLATFORM_COLOR = 0x000000;

var SPOTLIGHT_Y = 150 * mult_f;

var TIRE_TUBE = 10 * mult_f;
var TIRE_RADIUS = 42.5 * mult_f - TIRE_TUBE;
var TIRE_R_SEGMENTS = 17;
var TIRE_T_SEGMENTS = 34;
var TIRE_COLOR = 0x202020;

var RIM_COLOR = 0x808080;
var RIM_RADIUS = TIRE_RADIUS;
var RIM_HEIGHT = TIRE_RADIUS/4;

var SMALL_AXIS_LENGTH = 160;
var BIG_AXIS_LENGTH = 330;

var SPOTLIGHT_RADIUS = 10 * mult_f;
var SPOTLIGHT_COLOR = 0xFFFFFF;

var WINDOW_COLOR = 0x101010;

var CAR_COLOR = 0x808080;
var BACK_LIGHT_COLOR = 0xFF0000;
var FRONT_LIGHT_COLOR = 0xFFFFFF;
var SOLAR_PANEL_COLOR = 0x00000A;

var change_shadow_type = false;
var change_shadow_basic = false;
var previous_shadow = 0;
var meshes = [];
var face_meshes = [];

var rotation_pos = false;
var rotation_neg = false;
var angularVelocity = 1;

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

function create_face(v_1, v_2, v_3, color) {
    let materials = [
      new THREE.MeshPhongMaterial({color: color, wireframe: false}),
	  new THREE.MeshLambertMaterial({color: color, wireframe: false}),
	  new THREE.MeshBasicMaterial({color: color, wireframe: false}),
    ];

    //create a triangular geometry
    let geometry = new THREE.Geometry();
    geometry.vertices.push( new THREE.Vector3(v_1[0], v_1[1], v_1[2]));
    geometry.vertices.push( new THREE.Vector3(v_2[0], v_2[1], v_2[2]));
    geometry.vertices.push( new THREE.Vector3(v_3[0], v_3[1], v_3[2]));

    let materialIndex = 0;
    let face = new THREE.Face3( 0, 1, 2, materialIndex);

    geometry.faces.push(face);
    geometry.computeFaceNormals();

    let mesh = new THREE.Mesh(geometry, materials);

    face_meshes.push(mesh);
    return mesh;
}

function create_sphere(radius, segments, color) {
  'use strict';

    let materials = [
      new THREE.MeshPhongMaterial({color: color, wireframe: false}),
	  new THREE.MeshLambertMaterial({color: color, wireframe: false}),
	  new THREE.MeshBasicMaterial({color: color, wireframe: false}),
    ];

    let geometry = new THREE.SphereBufferGeometry(radius, segments, segments);

    // set up groups
    geometry.clearGroups();
    geometry.addGroup(0, geometry.index.count, 0);

    let mesh = new THREE.Mesh(geometry, materials);

    meshes.push(mesh);
    return mesh;
}

function create_cylinder(x, y, z, r_segments, f_segments, color) {
  'use strict';

    let materials = [
      new THREE.MeshPhongMaterial({color: color, wireframe: false}),
	  new THREE.MeshLambertMaterial({color: color, wireframe: false}),
	  new THREE.MeshBasicMaterial({color: color, wireframe: false}),
    ];

    let geometry = new THREE.CylinderBufferGeometry(x, y, z, r_segments, f_segments);

    // set up groups
    geometry.clearGroups();
    geometry.addGroup(0, geometry.index.count, 0);

    let mesh = new THREE.Mesh(geometry, materials);

    meshes.push(mesh);
    return mesh;
}

function create_box(x, y, z, x_segments, y_segments, color) {
  'use strict';

    let materials = [
      new THREE.MeshPhongMaterial({color: color, wireframe: false}),
	  new THREE.MeshLambertMaterial({color: color, wireframe: false}),
	  new THREE.MeshBasicMaterial({color: color, wireframe: false}),
    ];

    let geometry = new THREE.BoxBufferGeometry(x, y, z, x_segments, y_segments);

    // set up groups
    geometry.clearGroups();
    geometry.addGroup(0, geometry.index.count, 0);

    let mesh = new THREE.Mesh(geometry, materials);

    meshes.push(mesh);
    return mesh;
}

function create_torus(radius, tube, r_segments, t_segments, color) {
  'use strict';

  let materials = [
  new THREE.MeshPhongMaterial({color: color, wireframe: false}),
  new THREE.MeshLambertMaterial({color: color, wireframe: false}),
  new THREE.MeshBasicMaterial({color: color, wireframe: false}),
  ];

  let geometry = new THREE.TorusBufferGeometry(radius, tube, r_segments, t_segments);

  // set up groups
  geometry.clearGroups();
  geometry.addGroup(0, geometry.index.count, 0);

  let mesh = new THREE.Mesh(geometry, materials);

  meshes.push(mesh);
  return mesh;
}

function create_lights() {
	let light = new THREE.DirectionalLight(LIGHT_COLOR, DIRECTIONAL_LIGHT_INTENSITY);
    light.castShadow = true;
    directional_light.add(light);
    scene.add(directional_light);

    // spotlight 1
    light = new THREE.SpotLight(LIGHT_COLOR, 2, 550, Math.PI / 3, 0.75, 0.5);
    light.castShadow = true;

    set_position(light, PLATFORM_RADIUS*1.5, SPOTLIGHT_Y*2, 0);

    light.target.position.set(0, PLATFORM_HEIGHT + 25, 0);
    light.target.updateMatrixWorld();

    spotlight_1.add(light);

    let sphere = create_sphere(SPOTLIGHT_RADIUS, 16, SPOTLIGHT_COLOR);
    set_position(sphere, PLATFORM_RADIUS*1.5, SPOTLIGHT_Y*2, 0);
    let cone = create_cylinder(1, SPOTLIGHT_RADIUS, 1.9*SPOTLIGHT_RADIUS, 16, 16, SPOTLIGHT_COLOR);
    set_rotation(cone, - Math.PI / 2, 0, 0);
    cone.lookAt(-PLATFORM_RADIUS*1.5, SPOTLIGHT_Y*2, 0);
    set_position(cone, PLATFORM_RADIUS*1.5, SPOTLIGHT_Y*2, 0);

    spotlight_1.add(sphere);
    spotlight_1.add(cone);

    scene.add(spotlight_1);

    // spotlight 2
    light = new THREE.SpotLight(LIGHT_COLOR, 2, 550, Math.PI / 3, 0.75, 0.5);
    light.castShadow = true;

    set_position(light, (PLATFORM_RADIUS*1.5) * Math.cos(-2*Math.PI/3), SPOTLIGHT_Y*2,  (PLATFORM_RADIUS*1.5) * Math.sin(-2*Math.PI/3));

    light.target.position.set(0, PLATFORM_HEIGHT + 25, 0);
    light.target.updateMatrixWorld();

    sphere = create_sphere(SPOTLIGHT_RADIUS, 16, SPOTLIGHT_COLOR);
    set_position(sphere, (PLATFORM_RADIUS*1.5) * Math.cos(-2*Math.PI/3), SPOTLIGHT_Y*2, (PLATFORM_RADIUS*1.5) * Math.sin(-2*Math.PI/3));
    cone = create_cylinder(1, SPOTLIGHT_RADIUS, 1.9*SPOTLIGHT_RADIUS, 16, 16, SPOTLIGHT_COLOR);
    set_rotation(cone, - Math.PI / 2, 0, 0);
    cone.lookAt(-(PLATFORM_RADIUS*1.5) * Math.cos(-2*Math.PI/3), SPOTLIGHT_Y*2, -(PLATFORM_RADIUS*1.5) * Math.sin(-2*Math.PI/3));
    set_position(cone, (PLATFORM_RADIUS*1.5) * Math.cos(-2*Math.PI/3), SPOTLIGHT_Y*2, (PLATFORM_RADIUS*1.5) * Math.sin(-2*Math.PI/3));

    spotlight_2.add(light);
    spotlight_2.add(sphere)
    spotlight_2.add(cone)
    scene.add(spotlight_2);

    // spotlight 3
    light = new THREE.SpotLight(LIGHT_COLOR, 2, 550, Math.PI / 3, 0.75, 0.5);
    light.castShadow = true;

    set_position(light, (PLATFORM_RADIUS*1.5) * Math.cos(-2*Math.PI/3), SPOTLIGHT_Y*2, -(PLATFORM_RADIUS*1.5) * Math.sin(-2*Math.PI/3));

    light.target.position.set(0, PLATFORM_HEIGHT + 25, 0);
    light.target.updateMatrixWorld();

    spotlight_3.add(light);

    sphere = create_sphere(SPOTLIGHT_RADIUS, 16, SPOTLIGHT_COLOR);
    set_position(sphere, (PLATFORM_RADIUS*1.5) * Math.cos(-2*Math.PI/3), SPOTLIGHT_Y*2, -(PLATFORM_RADIUS*1.5) * Math.sin(-2*Math.PI/3));
    cone = create_cylinder(1, SPOTLIGHT_RADIUS, 1.9*SPOTLIGHT_RADIUS, 16, 16, SPOTLIGHT_COLOR);
    set_rotation(cone, - Math.PI / 2, 0, 0);
    cone.lookAt(0, -SPOTLIGHT_Y*2, -(PLATFORM_RADIUS*1.5) * Math.sin(-2*Math.PI/3));
    set_position(cone, (PLATFORM_RADIUS*1.5) * Math.cos(-2*Math.PI/3), SPOTLIGHT_Y*2, -(PLATFORM_RADIUS*1.5) * Math.sin(-2*Math.PI/3));


    spotlight_3.add(sphere);
    spotlight_3.add(cone);

    scene.add(spotlight_3);
}

function create_body() {
    //left side
    let v_1 = [-245, 65 + PLATFORM_HEIGHT - 2, 57.5];
    let v_2 = [-210, 40 + PLATFORM_HEIGHT - 2, 87.5];
    let v_3 = [-210, 65 + PLATFORM_HEIGHT - 2, 87.5];
    let face = create_face(v_1, v_2, v_3, CAR_COLOR);
    cybertruck.add(face);

    let v_4 = [-115, 65 + PLATFORM_HEIGHT - 2, 87.5];
    let v_5 = [-115, 40 + PLATFORM_HEIGHT - 2, 87.5];
    let v_7 = [120, 40 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_4, v_5, v_7, CAR_COLOR);
    cybertruck.add(face);

    let v_6 = [120, 65 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_4, v_7, v_6, CAR_COLOR);
    cybertruck.add(face);

    let v_8 = [215, 65 + PLATFORM_HEIGHT - 2, 87.5];
    let v_9 = [215, 40 + PLATFORM_HEIGHT - 2, 87.5];
    let v_10 = [265, 65 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_8, v_9, v_10, CAR_COLOR);
    cybertruck.add(face);

    let v_12 = [-245, 85 + PLATFORM_HEIGHT - 2, 57.5];
    face = create_face(v_12, v_1, v_3, CAR_COLOR);
    cybertruck.add(face);

    let v_13 = [-210, 90 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_12, v_3, v_13, CAR_COLOR);
    cybertruck.add(face);

    let v_17 = [-195, 90 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_13, v_3, v_17, CAR_COLOR);
    cybertruck.add(face);

    let v_18 = [-135, 90 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_18, v_4, v_6, CAR_COLOR);
    cybertruck.add(face);

    let v_19 = [140, 90 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_18, v_6, v_19, CAR_COLOR);
    cybertruck.add(face);

    let v_20 = [200, 90 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_20, v_8, v_10, CAR_COLOR);
    cybertruck.add(face);

    let v_21 = [265, 90 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_20, v_10, v_21, CAR_COLOR);
    cybertruck.add(face);

    let v_14 = [-210, 100 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_14, v_13, v_21, CAR_COLOR);
    cybertruck.add(face);

    let v_16 = [265, 120 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_14, v_21, v_16, CAR_COLOR);
    cybertruck.add(face);

    let v_26 = [-15, 165 + PLATFORM_HEIGHT - 2, 72.5];
    face = create_face(v_14, v_16, v_26, CAR_COLOR);
    cybertruck.add(face);

    let v_22 = [-165, 115 + PLATFORM_HEIGHT - 2 - 4, 72.5 + 13];
    let v_25 = [-15, 165 + PLATFORM_HEIGHT - 2 - 5, 72.5 + 3];
    let v_24 = [85, 145 + PLATFORM_HEIGHT - 2 + 4 - 5, 72 + 8];
    let v_23 = [85 + 3, 145 + PLATFORM_HEIGHT - 2 + 4 - 5 - 21, 72 + 8 + 5];
    face = create_face(v_22, v_24, v_25, WINDOW_COLOR);
    cybertruck.add(face);
    face = create_face(v_22, v_23, v_24, WINDOW_COLOR);
    cybertruck.add(face);


    //right side
    let v_1_2 = [-245, 65 + PLATFORM_HEIGHT - 2, -57.5];
    let v_2_2 = [-210, 40 + PLATFORM_HEIGHT - 2, -87.5];
    let v_3_2 = [-210, 65 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_3_2, v_2_2, v_1_2, CAR_COLOR);
    cybertruck.add(face);

    let v_4_2 = [-115, 65 + PLATFORM_HEIGHT - 2, -87.5];
    let v_5_2 = [-115, 40 + PLATFORM_HEIGHT - 2, -87.5];
    let v_7_2 = [120, 40 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_7_2, v_5_2, v_4_2, CAR_COLOR);
    cybertruck.add(face);

    let v_6_2 = [120, 65 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_6_2, v_7_2, v_4_2, CAR_COLOR);
    cybertruck.add(face);

    let v_8_2 = [215, 65 + PLATFORM_HEIGHT - 2, -87.5];
    let v_9_2 = [215, 40 + PLATFORM_HEIGHT - 2, -87.5];
    let v_10_2 = [265, 65 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_10_2, v_9_2, v_8_2, CAR_COLOR);
    cybertruck.add(face);

    let v_12_2 = [-245, 85 + PLATFORM_HEIGHT - 2, -57.5];
    face = create_face(v_3_2, v_1_2, v_12_2, CAR_COLOR);
    cybertruck.add(face);

    let v_13_2 = [-210, 90 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_13_2, v_3_2, v_12_2, CAR_COLOR);
    cybertruck.add(face);

    let v_17_2 = [-195, 90 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_17_2, v_3_2, v_13_2, CAR_COLOR);
    cybertruck.add(face);

    let v_18_2 = [-135, 90 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_6_2, v_4_2, v_18_2, CAR_COLOR);
    cybertruck.add(face);

    let v_19_2 = [140, 90 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_19_2, v_6_2, v_18_2, CAR_COLOR);
    cybertruck.add(face);

    let v_20_2 = [200, 90 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_10_2, v_8_2, v_20_2, CAR_COLOR);
    cybertruck.add(face);

    let v_21_2 = [265, 90 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_21_2, v_10_2, v_20_2, CAR_COLOR);
    cybertruck.add(face);

    let v_14_2 = [-210, 100 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_21_2, v_13_2, v_14_2, CAR_COLOR);
    cybertruck.add(face);

    let v_16_2 = [265, 120 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_16_2, v_21_2, v_14_2, CAR_COLOR);
    cybertruck.add(face);

    let v_26_2 = [-15, 165 + PLATFORM_HEIGHT - 2, -72.5];
    face = create_face(v_26_2, v_16_2, v_14_2, CAR_COLOR);
    cybertruck.add(face);

    let v_22_2 = [-165, 115 + PLATFORM_HEIGHT - 2 - 4, -72.5 - 13];
    let v_25_2 = [-15, 165 + PLATFORM_HEIGHT - 2 - 5, -72.5 - 3];
    let v_24_2 = [85, 145 + PLATFORM_HEIGHT - 2 + 4 - 5, -72 - 8];
    let v_23_2 = [85 + 3, 145 + PLATFORM_HEIGHT - 2 + 4 - 5 - 21, -72 - 8 - 5];
    face = create_face(v_24_2, v_22_2, v_25_2, WINDOW_COLOR);
    cybertruck.add(face);
    face = create_face(v_24_2, v_23_2, v_22_2, WINDOW_COLOR);
    cybertruck.add(face);


    //front
    face = create_face(v_1_2, v_2_2, v_2, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_1_2, v_2, v_1, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_12_2, v_1_2, v_1, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_12_2, v_1, v_12, CAR_COLOR);
    cybertruck.add(face);


    //back
    face = create_face(v_10, v_9, v_9_2, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_10, v_9_2, v_10_2, CAR_COLOR);
    cybertruck.add(face);
    let v_15 = [265, 110 + PLATFORM_HEIGHT - 2, 87.5];
    face = create_face(v_15, v_10, v_10_2, CAR_COLOR);
    cybertruck.add(face);
    let v_15_2 = [265, 110 + PLATFORM_HEIGHT - 2, -87.5];
    face = create_face(v_15, v_10_2, v_15_2, CAR_COLOR);
    cybertruck.add(face);


    // back light
    face = create_face(v_16, v_15, v_15_2, BACK_LIGHT_COLOR);
    cybertruck.add(face);
    face = create_face(v_16, v_15_2, v_16_2, BACK_LIGHT_COLOR);
    cybertruck.add(face);

    // front light
    let v_11 = [-245, 90 + PLATFORM_HEIGHT - 2, 57.5];
    let v_11_2 = [-245, 90 + PLATFORM_HEIGHT - 2, -57.5];
    face = create_face(v_11, v_12, v_13, FRONT_LIGHT_COLOR);
    cybertruck.add(face);
    face = create_face(v_11, v_13, v_14, FRONT_LIGHT_COLOR);
    cybertruck.add(face);

    face = create_face(v_11_2, v_12_2, v_12, FRONT_LIGHT_COLOR);
    cybertruck.add(face);
    face = create_face(v_11_2, v_12, v_11, FRONT_LIGHT_COLOR);
    cybertruck.add(face);

    face = create_face(v_12_2, v_11_2, v_13_2, FRONT_LIGHT_COLOR);
    cybertruck.add(face);
    face = create_face(v_13_2, v_11_2, v_14_2, FRONT_LIGHT_COLOR);
    cybertruck.add(face);


    //top
    face = create_face(v_11, v_14, v_26, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_26_2, v_14_2, v_11_2, CAR_COLOR);
    cybertruck.add(face);

    face = create_face(v_26_2, v_11_2, v_11, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_26_2, v_11, v_26, CAR_COLOR);
    cybertruck.add(face);

    face = create_face(v_26, v_16, v_16_2, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_26, v_16_2, v_26_2, CAR_COLOR);
    cybertruck.add(face);

    let v_27 = [-20, 165 + PLATFORM_HEIGHT - 2, 67.5];
    let v_28 = [-165, 90 + PLATFORM_HEIGHT - 2 + 25 + 2, 72.5 + 5];
    let v_27_2 = [-20, 165 + PLATFORM_HEIGHT - 2, -67.5];
    let v_28_2 = [-165, 90 + PLATFORM_HEIGHT - 2 + 25 + 2, -72.5 - 5]
    face = create_face(v_28, v_27, v_27_2, WINDOW_COLOR);
    cybertruck.add(face);
    face = create_face(v_28_2, v_28, v_27_2, WINDOW_COLOR);
    cybertruck.add(face);

    let v_29 = [-10, 165 + PLATFORM_HEIGHT - 2, 67.5];
    let v_30 = [85, 145 + PLATFORM_HEIGHT - 2 + 4, 72];
    let v_29_2 = [-10, 165 + PLATFORM_HEIGHT - 2, -67.5];
    let v_30_2 = [85, 145 + PLATFORM_HEIGHT - 2 + 4, -72]
    face = create_face(v_29, v_30, v_29_2, WINDOW_COLOR);
    cybertruck.add(face);
    face = create_face(v_30, v_30_2, v_29_2, WINDOW_COLOR);
    cybertruck.add(face);

    let v_31 = [85 + 10, 145 + PLATFORM_HEIGHT - 2 + 3, 72];
    let v_32 = [265 - 5, 145 + PLATFORM_HEIGHT - 2 - 24, 72 + 8];
    let v_31_2 = [85 + 10, 145 + PLATFORM_HEIGHT - 2 + 3, -72];
    let v_32_2 = [265 - 5, 145 + PLATFORM_HEIGHT - 2 - 24, -72 - 8];
    face = create_face(v_31, v_32, v_31_2, SOLAR_PANEL_COLOR);
    cybertruck.add(face);
    face = create_face(v_32, v_32_2, v_31_2, SOLAR_PANEL_COLOR);
    cybertruck.add(face);

    //top light
    face = create_face(v_26_2, v_27_2, v_27, FRONT_LIGHT_COLOR);
    cybertruck.add(face);
    face = create_face(v_26_2, v_27, v_26, FRONT_LIGHT_COLOR);
    cybertruck.add(face);


    //interior
    face = create_face(v_8_2, v_9_2, v_9, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_8_2, v_9, v_8, CAR_COLOR);
    cybertruck.add(face);

    face = create_face(v_20_2, v_8_2, v_8, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_20_2, v_8, v_20, CAR_COLOR);
    cybertruck.add(face);

    face = create_face(v_19_2, v_20_2, v_20, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_19_2, v_20, v_19, CAR_COLOR);
    cybertruck.add(face);

    face = create_face(v_19, v_6, v_6_2, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_19, v_6_2, v_19_2, CAR_COLOR);
    cybertruck.add(face);

    face = create_face(v_6, v_7, v_7_2, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_6, v_7_2, v_6_2, CAR_COLOR);
    cybertruck.add(face);

    face = create_face(v_4_2, v_5_2, v_5, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_4_2, v_5, v_4, CAR_COLOR);
    cybertruck.add(face);

    face = create_face(v_18_2, v_4_2, v_4, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_18_2, v_4, v_18, CAR_COLOR);
    cybertruck.add(face);

    face = create_face(v_17_2, v_18_2, v_18, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_17_2, v_18, v_17, CAR_COLOR);
    cybertruck.add(face);

    face = create_face(v_17, v_3, v_3_2, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_17, v_3_2, v_17_2, CAR_COLOR);
    cybertruck.add(face);

    face = create_face(v_3, v_2, v_2_2, CAR_COLOR);
    cybertruck.add(face);
    face = create_face(v_3, v_2_2, v_3_2, CAR_COLOR);
    cybertruck.add(face);


}

function create_wheels() {

    let wheels = [];
    for (let i = 0; i < 4; i++) {
        let wheel = new THREE.Object3D();
        let tire = create_torus(TIRE_RADIUS, TIRE_TUBE, TIRE_R_SEGMENTS, TIRE_T_SEGMENTS, TIRE_COLOR);
        let rim = create_cylinder(RIM_RADIUS, RIM_RADIUS, RIM_HEIGHT, 16, 8, RIM_COLOR);
        set_rotation(rim, Math.PI/2, 0 , 0);
        wheel.add(tire);
        tire.scale.set(1, 1, 2);
        wheel.add(rim);
        wheels.push(wheel);
    }
    set_position(wheels[0], BIG_AXIS_LENGTH / 2, PLATFORM_HEIGHT + TIRE_TUBE + TIRE_RADIUS, SMALL_AXIS_LENGTH/2 + RIM_HEIGHT/2);
    set_position(wheels[1], BIG_AXIS_LENGTH / 2, PLATFORM_HEIGHT + TIRE_TUBE + TIRE_RADIUS, -SMALL_AXIS_LENGTH/2 - RIM_HEIGHT/2);
    set_position(wheels[2], - BIG_AXIS_LENGTH / 2, PLATFORM_HEIGHT + TIRE_TUBE + TIRE_RADIUS, SMALL_AXIS_LENGTH/2 + RIM_HEIGHT/2);
    set_position(wheels[3], - BIG_AXIS_LENGTH / 2, PLATFORM_HEIGHT + TIRE_TUBE + TIRE_RADIUS, -SMALL_AXIS_LENGTH/2 - RIM_HEIGHT/2);

    for (let i = 0; i < 4; i++) {
        cybertruck.add(wheels[i]);
    }
}

function create_chassis() {

    let cylinder = create_cylinder(8*mult_f, 8*mult_f, SMALL_AXIS_LENGTH, 16, 8, RIM_COLOR);
    set_rotation(cylinder, Math.PI/2, 0 , 0);
    set_position(cylinder, BIG_AXIS_LENGTH / 2, PLATFORM_HEIGHT + TIRE_TUBE + TIRE_RADIUS, 0);
    cybertruck.add(cylinder);

    cylinder = create_cylinder(8*mult_f, 8*mult_f, SMALL_AXIS_LENGTH, 16, 8, RIM_COLOR);
    set_rotation(cylinder, Math.PI/2, 0 , 0);
    set_position(cylinder, -BIG_AXIS_LENGTH / 2, PLATFORM_HEIGHT + TIRE_TUBE + TIRE_RADIUS, 0);
    cybertruck.add(cylinder);

    cylinder = create_cylinder(8*mult_f, 8*mult_f, BIG_AXIS_LENGTH, 16, 8, RIM_COLOR);
    set_rotation(cylinder, 0, 0 , Math.PI/2);
    set_position(cylinder, 0, PLATFORM_HEIGHT + TIRE_TUBE + TIRE_RADIUS, 0);
    cybertruck.add(cylinder);

}

function create_cameras() {
    'use strict';

    lateral_camera = new THREE.OrthographicCamera(window.innerWidth / - 5, window.innerWidth / 5, window.innerHeight / 5, window.innerHeight / - 5, 0, 1000);
    lateral_camera.position.x = 0;
    lateral_camera.position.y = PLATFORM_HEIGHT + 25;
    lateral_camera.position.z = PLATFORM_RADIUS;
	lateral_camera.lookAt(new THREE.Vector3(0, PLATFORM_HEIGHT + 25, 0));
	platform.add(lateral_camera);

    top_camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    top_camera.position.x = PLATFORM_RADIUS*2;
    top_camera.position.y = 400;
    top_camera.position.z = PLATFORM_RADIUS*2;
    top_camera.lookAt(new THREE.Vector3(0, PLATFORM_HEIGHT + 80, 0));

    selected_camera = top_camera;
}

function create_scene() {
    'use strict';

    scene = new THREE.Scene();

    let floor = create_box(FLOOR_LENGHT, FLOOR_WIDTH, 10, 100, 100, FLOOR_COLOR);
    set_rotation(floor, Math.PI / 2, 0, 0);
    let palenque = create_cylinder(PLATFORM_RADIUS*0.9, PLATFORM_RADIUS, PLATFORM_HEIGHT, 64, 32, PLATFORM_COLOR);
    platform.add(palenque);

    set_position(platform, 0, PLATFORM_HEIGHT / 2, 0);

    create_lights();

    create_wheels();
    create_chassis();
    create_body();

    create_cameras();
    cybertruck.scale.set(0.7, 0.7, 0.7);
    platform.add(cybertruck);

    scene.add(floor);
    scene.add(platform);
}

function on_resize() {
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        lateral_camera.left = window.innerWidth / - 5;
        lateral_camera.right = window.innerWidth / 5;
        lateral_camera.top = window.innerHeight / 5;
        lateral_camera.bottom = window.innerHeight / -5;
        lateral_camera.updateProjectionMatrix();

        top_camera.aspect = window.innerWidth / window.innerHeight;
        top_camera.updateProjectionMatrix();

    }

}

function update_lights() {

    if (change_directional_light) {
        directional_light.visible = !directional_light.visible;
        change_directional_light = false;
    }

    if (change_spotlight_1) {
        spotlight_1.visible = !spotlight_1.visible;
        change_spotlight_1 = false;
    }

    if (change_spotlight_2) {
        spotlight_2.visible = !spotlight_2.visible;
        change_spotlight_2 = false;
    }

    if (change_spotlight_3) {
        spotlight_3.visible = !spotlight_3.visible;
        change_spotlight_3 = false;
    }
}

function update_shadow() {

    if (!change_shadow_type && !change_shadow_basic) return;

    for (let i = 0; i < meshes.length; i++) {
		if (change_shadow_type) {
			if(meshes[i].geometry.groups[0].materialIndex == 2) {
				break;
			}
			else if(meshes[i].geometry.groups[0].materialIndex == 0) {
				meshes[i].geometry.groups[0].materialIndex = 1;
				previous_shadow = 1;
			}
			else {
				meshes[i].geometry.groups[0].materialIndex = 0;
				previous_shadow = 0;
			}
		}

		if (change_shadow_basic) {
			if(meshes[i].geometry.groups[0].materialIndex == 2) {
				meshes[i].geometry.groups[0].materialIndex = previous_shadow;
			}
			else {
				meshes[i].geometry.groups[0].materialIndex = 2;
			}
		}
	}

    for (i = 0; i < face_meshes.length; i++) {
        if (change_shadow_type) {
            if(face_meshes[i].geometry.faces[0].materialIndex == 2) {
                break;
			}
			else if(face_meshes[i].geometry.faces[0].materialIndex == 0) {
                face_meshes[i].geometry.faces[0].materialIndex = 1;
				previous_shadow = 1;
			}
			else {
                face_meshes[i].geometry.faces[0].materialIndex = 0;
				previous_shadow = 0;
			}
            face_meshes[i].geometry.groupsNeedUpdate = true;
		}

		if (change_shadow_basic) {
            if(face_meshes[i].geometry.faces[0].materialIndex == 2) {
                face_meshes[i].geometry.faces[0].materialIndex = previous_shadow;
			}
			else {
                face_meshes[i].geometry.faces[0].materialIndex = 2;
			}
            face_meshes[i].geometry.groupsNeedUpdate = true;
		}
    }

	change_shadow_type = false;
	change_shadow_basic = false;
}

function update_rotation(delta_time) {

	if (rotation_pos) {
        platform.rotateY(delta_time * angularVelocity);
    }
    if (rotation_neg) {
        platform.rotateY(-delta_time * angularVelocity);
	}

}

function on_key_down(e) {
    'use strict';

    switch (e.keyCode) {
        case 49: // 1
            change_spotlight_1 = true;
            break;
        case 50: // 2
            change_spotlight_2 = true;
            break;
        case 51: // 3
            change_spotlight_3 = true;
            break;
        case 52: // 4
            selected_camera = top_camera;
            break;
        case 53: // 5
            selected_camera = lateral_camera;
            break;
        case 69: // e, E
            change_shadow_type = true;
            break;
        case 81: // q, Q
            change_directional_light = true;
            break;
		case 87: // w, W
			change_shadow_basic = true;
			break;
		case 37: // left arrow
			rotation_neg = true;
			break;
		case 39: // right arrow
			rotation_pos = true;
			break;
    }
}

function on_key_up(e) {
    'use strict';

    switch (e.keyCode) {
      case 0:
		break;
	case 37: // left arrow
		rotation_neg = false;
		break;
	case 39: // right arrow
		rotation_pos = false;
		break;
    }
}

function render() {
    'use strict';

    renderer.render(scene, selected_camera);

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
    render();

    window.addEventListener("keydown", on_key_down);
    window.addEventListener("keyup", on_key_up);
    window.addEventListener("resize", on_resize);
}

function update() {
    'use strict';

    let delta_time = clock.getDelta();

    update_lights();

    update_shadow();

    update_rotation(delta_time);

}

function animate() {
    'use strict';

    update();

    render();

    requestAnimationFrame(animate);
}

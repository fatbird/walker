require('./styles/default.scss')
const THREE = require('three');
window.THREE = THREE;
const { cube, walker } = require('./js/entities');
const { hemi } = require('./js/entities/lights');

const oVec = new THREE.Vector3(0, 0, 0);
const xVec = new THREE.Vector3(1, 0, 0);
const yVec = new THREE.Vector3(0, 1, 0);
const zVec = new THREE.Vector3(0, 0, 1);

let entity = walker;
window.walker = walker;

const active = {
  shift: false,
  ctrl: false,
  alt: false,
  meta: false,
  w: false,
  s: false,
  d: false,
  a: false,
};

const scene = new THREE.Scene(); window.scene = scene;

const rTop = new THREE.WebGLRenderer(); window.rTop = rTop;
const rLeft = new THREE.WebGLRenderer();
const rMiddle = new THREE.WebGLRenderer();
const rRight = new THREE.WebGLRenderer();

const dTop = document.getElementById('top'); window.dTop = dTop;
const dLeft = document.getElementById('left');
const dMiddle = document.getElementById('middle');
const dRight = document.getElementById('right');

const cTop = new THREE.PerspectiveCamera(35, dTop.offsetWidth / dTop.offsetHeight, 0.1, 1000); window.cTop = cTop;
const cLeft = new THREE.PerspectiveCamera(35, dLeft.offsetWidth / dLeft.offsetHeight, 0.1, 1000);
const cRight = new THREE.PerspectiveCamera(35, dRight.offsetWidth / dRight.offsetHeight, 0.1, 1000);
const cMiddle = new THREE.PerspectiveCamera(35, dMiddle.offsetWidth / dMiddle.offsetHeight, 0.1, 1000);

cTop.name = 'top camera';
cLeft.name = 'left camera';
cMiddle.name = 'middle camera';
cRight.name = 'right camera';

function init() {
  rTop.setSize(dTop.offsetWidth, dTop.offsetHeight); rTop.setClearColor(0xffffff); rTop.setPixelRatio(2);
  rLeft.setSize(dLeft.offsetWidth, dLeft.offsetHeight); rLeft.setClearColor(0xffffff); rLeft.setPixelRatio(2);
  rMiddle.setSize(dMiddle.offsetWidth, dMiddle.offsetHeight); rMiddle.setClearColor(0xffffff); rMiddle.setPixelRatio(2);
  rRight.setSize(dRight.offsetWidth, dRight.offsetHeight); rRight.setClearColor(0xffffff); rRight.setPixelRatio(2);

  dTop.appendChild(rTop.domElement);
  dLeft.appendChild(rLeft.domElement);
  dMiddle.appendChild(rMiddle.domElement);
  dRight.appendChild(rRight.domElement);

  scene.add(entity);
  cTop.position.set(5, 2.5, 5); cTop.lookAt(entity.position);
  cLeft.position.x = 5; cLeft.position.y = 1; cLeft.lookAt(entity.position);
  cMiddle.position.z = 5; cMiddle.position.y = 1;
  cRight.position.y = 5; cRight.lookAt(entity.position);

  // lights
  scene.add(hemi);

  const grid = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
  scene.add(grid)

  animate();
}

let last = 0;
function animate(time) {
  const slice = (time - (last || 0)) / 1000;
  last = time;
  requestAnimationFrame(animate);
  entity.handleInput(slice, active, rTop, cTop, scene);
  updateCamera(slice, cTop);
  rTop.render(scene, cTop);
  if (dTop.classList.contains('multiple')) {
    rLeft.render(scene, cLeft);
    rMiddle.render(scene, cMiddle);
    rRight.render(scene, cRight);
  }
}

function updateCamera(slice, camera) {
  if (active.KeyQ && !active.KeyE) {
    camera.position.copy(
      camera.localToWorld(xVec.clone().setLength(slice * 8).negate())
    );
  }
  if (active.KeyE && !active.KeyQ) {
    camera.position.copy(
      camera.localToWorld(xVec.clone().setLength(slice * 8))
    );
  }
  const ePos = entity.getWorldPosition();
  const cPos = camera.getWorldPosition();
  const distance = cPos.distanceTo(ePos) - 7.5;
  camera.position.add(ePos.sub(cPos).setLength(distance).setY(0));
  cTop.lookAt(entity.position);
}

window.onload = init;

function onResize() {
  rTop.setSize(dTop.offsetWidth, dTop.offsetHeight);
  rLeft.setSize(dLeft.offsetWidth, dLeft.offsetHeight);
  rMiddle.setSize(dMiddle.offsetWidth, dMiddle.offsetHeight);
  rRight.setSize(dRight.offsetWidth, dRight.offsetHeight);
  cTop.aspect = dTop.offsetWidth / dTop.offsetHeight; cTop.updateProjectionMatrix();
  cLeft.aspect = dLeft.offsetWidth / dLeft.offsetHeight; cLeft.updateProjectionMatrix();
  cMiddle.aspect = dMiddle.offsetWidth / dMiddle.offsetHeight; cMiddle.updateProjectionMatrix();
  cRight.aspect = dRight.offsetWidth / dRight.offsetHeight; cRight.updateProjectionMatrix();
}
window.onresize = onResize;

window.onkeydown = function onKeyDown(e) {
  active[e.code] = true;
  active.shift = e.shiftKey;
  active.ctrl = e.ctrlKey;
  active.meta = e.metaKey;
  active.alt = e.altKey;
}

window.onkeyup = function onKeyUp(e) {
  active[e.code] = false;
  active.shift = e.shiftKey;
  active.ctrl = e.ctrlKey;
  active.meta = e.metaKey;
  active.alt = e.altKey;
}

window.onkeypress = function onKeyPress(e) {
  switch (e.code) {
    case 'KeyG':
      dTop.classList.toggle('multiple');
      dLeft.classList.toggle('multiple');
      dMiddle.classList.toggle('multiple');
      dRight.classList.toggle('multiple');
      onResize();
      break;
    default:
  }
}

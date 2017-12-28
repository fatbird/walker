const THREE = require('three');

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.y = 1;
cube.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
  if (camera.name === 'top camera') {
    cube.rotateY(0.02);
    cube.rotateX(0.01);
  }
}

export default cube;
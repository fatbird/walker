const THREE = require('three');

const oVec = new THREE.Vector3(0, 0, 0);
const xVec = new THREE.Vector3(1, 0, 0);
const yVec = new THREE.Vector3(0, 1, 0);
const zVec = new THREE.Vector3(0, 0, 1);

const clock = new THREE.Clock();

const vec2string = (v) => {
  v.multiplyScalar(10000).floor().divideScalar(10000);
  return `x: ${v.x} y: ${v.y} z: ${v.z}`;
}

const legMaterial = new THREE.MeshBasicMaterial({ color: 0x0066cc });

const s1 = document.getElementById('status1'); window.s1 = s1;

let walker = new THREE.Group();
walker.name = 'walker';
walker.rotation.y = (Math.PI / 4);

const localTarget = new THREE.Mesh(
  new THREE.SphereGeometry(0.02),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
walker.add(localTarget);

const mixer = new THREE.AnimationMixer(walker);
window.mixer = mixer;
const resetMixer = new THREE.AnimationMixer(walker);
window.resetMixer = resetMixer;

const arrow = new THREE.ArrowHelper(zVec, oVec, 0.5, 0xff0000);
walker.add(arrow);

const hipBone = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
hipBone.rotateZ(Math.PI / 2);
const bone = new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8);
bone.translate(0, -0.25, 0);

const hips = new THREE.Mesh(hipBone, legMaterial);
hips.name = 'hips';
hips.position.y = 1;
hips.keyframeName = '.rotation[y]';
walker.add(hips);

const rightHip = new THREE.Group();
rightHip.name = 'right hip';
rightHip.position.x = -0.2;
rightHip.position.y = 1;
walker.add(rightHip);

const rThigh = new THREE.Mesh(bone, legMaterial);
rThigh.name = 'right thigh';
rightHip.add(rThigh);

const leftHip = new THREE.Group();
leftHip.name = 'left hip';
leftHip.position.x = 0.2;
leftHip.position.y = 1;
walker.add(leftHip);

const lThigh = new THREE.Mesh(bone, legMaterial);
lThigh.name = 'left thigh';
leftHip.add(lThigh);

const rShin = new THREE.Mesh(bone, legMaterial);
rShin.position.y = -0.5;
rThigh.add(rShin);
rShin.name = 'right shin';

const lShin = new THREE.Mesh(bone, legMaterial);
lShin.position.y = -0.5;
lThigh.add(lShin);
lShin.name = 'left shin';

// WALKING ANIMATION
const shinKeyframe = new THREE.NumberKeyframeTrack(
  '.rotation[x]', [0, 0.5, 1, 1.5, 2], [0, 0, Math.PI / 3, 0, 0]
);

// right thigh
const rightThighClip = new THREE.AnimationClip('right thigh', 2, [
  new THREE.NumberKeyframeTrack(
    '.rotation[x]',
    [0, 0.5, 1, 1.5, 2],
    [0, Math.PI / -6, 0, Math.PI / 6, 0]
  ),
]);
const rightThighAction = mixer.clipAction(rightThighClip, rThigh);

// right shin positioning clip
const rightShinPreClip = new THREE.AnimationClip('right shin pre', -1, [
  new THREE.NumberKeyframeTrack(
    '.rotation[x]',
    [0, 0.25, 0.75, 1],
    [0, Math.PI / 6, 0, 0],
  ),
]);
const rightShinPreAction = mixer.clipAction(rightShinPreClip, rShin);
rightShinPreAction.loop = THREE.LoopOnce;

// right shin
const rightShinClip = new THREE.AnimationClip('right shin', -1, [shinKeyframe]);
const rightShinAction = mixer.clipAction(rightShinClip, rShin);
rightShinAction.delay = 1;

// left thigh
const leftThighClip = new THREE.AnimationClip('left thigh', -1, [
  new THREE.NumberKeyframeTrack(
    '.rotation[x]',
    [0, 0.5, 1.5, 2],
    [0, Math.PI / 6, Math.PI / -6, 0]
  ),
]);
const leftThighAction = mixer.clipAction(leftThighClip, lThigh);

// left shin
const leftShinClip = new THREE.AnimationClip('left shin', -1, [shinKeyframe]);
const leftShinAction = mixer.clipAction(leftShinClip, lShin);

const hipBoneY = new THREE.AnimationClip('hip y', -1, [
  new THREE.NumberKeyframeTrack('.rotation[y]',
    [0, 0.5, 1, 1.5, 2],
    [ 0, Math.PI / 16, 0, Math.PI / -16, 0]
  ),
]);
mixer.clipAction(hipBoneY, hips);
// const hcz = new THREE.AnimationClip('hip z', -1, [
//   new THREE.NumberKeyframeTrack('.rotation[z]',
//     [0, 0.5, 1, 1.5, 2],
//     [Math.PI / 16, 0, Math.PI / -16, 0, Math.PI / 16]
//   ),
// ]);
// const action6 = mixer.clipAction(hcz, hips);

let walkActive = false;

walker.handleInput = function handleInput(slice, active, renderer, camera, scene) {
  let dir = camera.getWorldDirection();
  let wwp = walker.getWorldPosition();
  let wd = walker.getWorldDirection().add(wwp);
  dir.y = walker.position.y;
  let target = wwp.clone();

  if (active.KeyW) { target.add(dir); }
  if (active.KeyS) { target.sub(dir); }
  if (active.KeyD) {
    let lwp = camera.worldToLocal(wwp.clone());
    lwp = camera.localToWorld(lwp.add(xVec)).sub(wwp);
    target.add(lwp);
  }
  if (active.KeyA) {
    let lwp = camera.worldToLocal(wwp.clone());
    lwp = camera.localToWorld(lwp.sub(xVec)).sub(wwp);
    target.add(lwp);
  }
  if (active.KeyW || active.KeyS || active.KeyA || active.KeyD) {
    localTarget.position.copy(walker.worldToLocal(target.clone()));
    let side = localTarget.position.x < 0 ? -1 : 1;
    const rotationSlice = 2 * Math.PI * slice;
    if (zVec.angleTo(localTarget.position) > rotationSlice) {
      walker.rotateY(rotationSlice * side);
    } else {
      walker.lookAt(target);
    }
    walker.translateZ(slice);

    if (!walkActive) {
      walkActive = true;
      mixer._actions.forEach((action) => {
        action.reset().play();
        if (action.delay) { action.startAt(mixer.time + action.delay); }
      });
    }
    mixer.update(clock.getDelta());
  } else {
    if (walkActive) {
      resetMixer.stopAllAction();
      resetMixer._actions.forEach((action) => {
        resetMixer.uncacheAction(action.getClip(), action.getRoot());
      });
      [rThigh, rShin, lThigh, lShin, hips].forEach(limb => {
        const action = resetMixer.clipAction(
          new THREE.AnimationClip(`${limb.name} reset`, -1, [
            new THREE.NumberKeyframeTrack(
              limb.keyframeName || '.rotation[x]',
              [0, 0.25],
              [limb.rotation.x, 0],
            )]
          ), limb,
        );
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        action.play();
      });
      walkActive = false;
    }
    resetMixer.update(clock.getDelta());
  }
}
walker.onBeforeRender = function onBeforeRender(
  renderer, scene, camera, geometry, material, group
) {

}

walker.lookAt(new THREE.Vector3(1, 0, 0));
export default walker;

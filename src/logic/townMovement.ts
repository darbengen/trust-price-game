import * as THREE from 'three';
/** Ground-plane axes as seen by the current camera, including camera easing and obstacles. */
export function cameraAxes(view:THREE.Vector3,fallbackAngle:number){
 const forward=new THREE.Vector3(view.x,0,view.z);
 if(forward.lengthSq()<1e-8)forward.set(-Math.sin(fallbackAngle),0,-Math.cos(fallbackAngle));
 forward.normalize();
 return {forward,right:new THREE.Vector3(-forward.z,0,forward.x)};
}

import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {cameraAxes} from './townMovement.ts';
describe('camera-relative town movement',()=>{
 it.each([[0,-1],[1,0],[0,1],[-1,0],[.6,-.8]])('uses the visible camera direction %s,%s',(x,z)=>{const {forward,right}=cameraAxes(new THREE.Vector3(x,-.4,z),0);expect(forward.x).toBeCloseTo(x);expect(forward.z).toBeCloseTo(z);expect(right.x).toBeCloseTo(-z);expect(right.z).toBeCloseTo(x);expect(forward.dot(right)).toBeCloseTo(0)});
 it('keeps controls stable when the view points straight down',()=>{const {forward}=cameraAxes(new THREE.Vector3(0,-1,0),Math.PI/2);expect(forward.x).toBeCloseTo(-1);expect(forward.z).toBeCloseTo(0)});
});

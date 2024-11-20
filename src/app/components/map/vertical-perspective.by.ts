// import { geoProjection, GeoProjection } from "d3-geo";

// export class VerticalPerspectiveProjection {
//   private P: number = 2;
//   private tiltAngle: number = 0;
//   private azimuthAngle: number = 0;
//   private sinPhi0: number = 0;
//   private cosPhi0: number = 1;
//   private projection: GeoProjection;

//   constructor() {
//     this.projection = this.updateProjection();
//   }

//   private rawProjection(lambda: number, phi: number): [number, number] | null {
//     const tiltRad = this.tiltAngle * Math.PI / 180;
//     const azimuthRad = this.azimuthAngle * Math.PI / 180;
    
//     const cosLambda = Math.cos(lambda);
//     const cosPhi = Math.cos(phi);
//     const sinPhi = Math.sin(phi);
    
//     const k = (this.P - 1) / (this.P - (sinPhi * this.sinPhi0 + cosPhi * this.cosPhi0 * cosLambda));
//     let x = k * cosPhi * Math.sin(lambda);
//     let y = k * (this.cosPhi0 * sinPhi - this.sinPhi0 * cosPhi * cosLambda);
    
//     if (this.tiltAngle || this.azimuthAngle) {
//       const xRotated = x * Math.cos(azimuthRad) - y * Math.sin(azimuthRad);
//       const yRotated = (x * Math.sin(azimuthRad) + y * Math.cos(azimuthRad)) * Math.cos(tiltRad);
//       x = xRotated;
//       y = yRotated;
//     }
    
//     return [x, y];
//   }

//   private updateProjection(): GeoProjection {
//     return geoProjection(this.rawProjection.bind(this))
//       .scale(250)
//       .clipAngle(Math.acos(1/this.P) * 180 / Math.PI);
//   }

//   public getProjection(): GeoProjection {
//     return this.projection;
//   }

//   public setDistance(distance: number): void {
//     this.P = distance;
//     this.projection.clipAngle(Math.acos(1/this.P) * 180 / Math.PI);
//   }

//   public setTilt(angle: number): void {
//     this.tiltAngle = angle;
//     this.projection = this.updateProjection();
//   }

//   public setAzimuth(angle: number): void {
//     this.azimuthAngle = angle;
//     this.projection = this.updateProjection();
//   }

//   public setCenter(center: [number, number]): void {
//     const [lambda0, phi0] = center.map(d => d * Math.PI / 180);
//     this.sinPhi0 = Math.sin(phi0);
//     this.cosPhi0 = Math.cos(phi0);
//     this.projection = this.updateProjection();
//   }
// }
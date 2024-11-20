import { geoProjection, GeoProjection } from "d3-geo";

interface VerticalProjection extends GeoProjection {
<<<<<<< Updated upstream
    distance(_?: number): VerticalProjection;
    tilt(_?: number): VerticalProjection;
    azimuth(_?: number): VerticalProjection;
}

function verticalPerspectiveRaw(P: number, phi1: number, lambda0: number, tiltAngle: number, azimuthAngle: number) {
    const toRadians = (degree: number) => degree * Math.PI / 180;
    
    // Pre-calculate constants
    const phi1Rad = toRadians(phi1);
    const lambda0Rad = toRadians(lambda0);
    const tiltRad = toRadians(tiltAngle);
    const azimuthRad = toRadians(azimuthAngle);
    
    // Pre-calculate trigonometric values
    const sinPhi1 = Math.sin(phi1Rad);
    const cosPhi1 = Math.cos(phi1Rad);

    return function(lambda: number, phi: number): [number, number] {
        // 1. Convert input coordinates to radians
        const lambdaRad = toRadians(lambda - lambda0); // Normalize lambda relative to center
        const phiRad = toRadians(phi);
        
        // 2. Calculate cosC (great circle distance) using equation (5-3)
        const cosC = sinPhi1 * Math.sin(phiRad) + 
                    cosPhi1 * Math.cos(phiRad) * Math.cos(lambdaRad);
                    
        // 3. Check visibility
        if (cosC < 1/P) {
            return [NaN, NaN];
        }

        // 4. Calculate k' using equation (23-3)
        const k = (P - 1) / (P - cosC);

        // 5. Calculate initial rectangular coordinates using equations (22-4) and (22-5)
        let x = k * Math.cos(phiRad) * Math.sin(lambdaRad);
        let y = k * (cosPhi1 * Math.sin(phiRad) - 
                    sinPhi1 * Math.cos(phiRad) * Math.cos(lambdaRad));
        
        // 6. Calculate vertical height factor
        const z = (P - 1) * (P * cosC - 1) / Math.pow(P - cosC, 2);

        // 7. Apply tilt transformation
        if (tiltAngle !== 0) {
            const yTemp = y * Math.cos(tiltRad) + z * Math.sin(tiltRad);
            y = yTemp;
        }

        // 8. Apply azimuth rotation
        if (azimuthAngle !== 0) {
            const xTemp = x * Math.cos(azimuthRad) - y * Math.sin(azimuthRad);
            y = x * Math.sin(azimuthRad) + y * Math.cos(azimuthRad);
            x = xTemp;
        }

        return [x, y];
    };
}

function verticalPerspective(): VerticalProjection {
    let P = 1.025;        // Distance from center in Earth radii
    let phi1 = 41.5;      // Center latitude
    let lambda0 = -74.0;  // Center longitude
    let tiltAngle = 55;   // Tilt angle
    let azimuthAngle = 210; // Azimuth angle

    // Create the raw projection function
    const projection = geoProjection(
        verticalPerspectiveRaw(P, phi1, lambda0, tiltAngle, azimuthAngle)
    ) as VerticalProjection;

    // Calculate initial clip angle
    const clipAngle = Math.acos(1 / P) * 180 / Math.PI;

    // Define the setter methods
    projection.distance = function(_?: number): VerticalProjection {
        if (!arguments.length) return this;
        P = _;
        const newClipAngle = Math.acos(1 / P) * 180 / Math.PI;
        this.clipAngle(newClipAngle);
        this.raw = verticalPerspectiveRaw(P, phi1, lambda0, tiltAngle, azimuthAngle);
        return this;
    };

    projection.tilt = function(_?: number): VerticalProjection {
        if (!arguments.length) return this;
        tiltAngle = _;
        this.raw = verticalPerspectiveRaw(P, phi1, lambda0, tiltAngle, azimuthAngle);
        return this;
    };

    projection.azimuth = function(_?: number): VerticalProjection {
        if (!arguments.length) return this;
        azimuthAngle = _;
        this.raw = verticalPerspectiveRaw(P, phi1, lambda0, tiltAngle, azimuthAngle);
        return this;
    };

    // Initialize projection
    return projection
        .scale(250)
        .translate([480, 250])
        .center([0, 0])           // Set center before rotation
        .rotate([lambda0, -phi1]) // Apply rotation to align with center point
        .clipAngle(clipAngle);    // Set clip angle based on distance
=======
  distance(_?: number): VerticalProjection;
  tilt(_?: number): VerticalProjection;
  azimuth(_?: number): VerticalProjection;
}

function verticalPerspectiveRaw(P: number, phi1: number, lambda0: number, tiltAngle: number, azimuthAngle: number) {
//function verticalPerspectiveRaw(distance: number, tiltAngle: number, azimuthAngle: number) {
  //let phi1 = 0, lambda0 = 0;  // Center coordinates
  
  return function(lambda: number, phi: number): [number, number] {
    const cosLambda = Math.cos(lambda);
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const sinPhi1 = Math.sin(phi1);
    const cosPhi1 = Math.cos(phi1);
    
    const k = (P - 1) / (P - (sinPhi * sinPhi1 + cosPhi * cosPhi1 * cosLambda));
    let x = k * cosPhi * Math.sin(lambda);
    let y = k * (cosPhi1 * sinPhi - sinPhi1 * cosPhi * cosLambda);
    
    if (tiltAngle || azimuthAngle) {
      const tiltRad = tiltAngle * Math.PI / 180;
      const azimuthRad = azimuthAngle * Math.PI / 180;
      const xRotated = x * Math.cos(azimuthRad) - y * Math.sin(azimuthRad);
      const yRotated = (x * Math.sin(azimuthRad) + y * Math.cos(azimuthRad)) * Math.cos(tiltRad);
      x = xRotated;
      y = yRotated;
    }
    
    return [x, y];
  };
}

function verticalPerspective(): VerticalProjection {
  //let P = 2,
  //    tiltAngle = 0,
  //    azimuthAngle = 0;

  let P = 1.025; // distance from the Earth's center in earth radii
  let phi1 = 41.5; // latitude of Newburgh, NY
  let lambda0 = -74.0; // longitude of Newburgh, NY
  let tiltAngle = 55; // tilt in degrees
  let azimuthAngle = 210; // azimuth in degrees

  //const mutate = geoProjectionMutator(verticalPerspectiveRaw);
  //.const projection = mutate(P, tiltAngle, azimuthAngle) as VerticalProjection;
  const mutate = () => geoProjection(verticalPerspectiveRaw(P, phi1, lambda0, tiltAngle, azimuthAngle)).scale(250).translate([480, 250]);
  const projection = mutate() as VerticalProjection;


  projection.distance = function(_?: number): VerticalProjection {
    if (!arguments.length) return this;
    P = _!;
    return projection;
  };

  projection.tilt = function(_?: number): VerticalProjection {
    if (!arguments.length) return this;
    tiltAngle = _!;
    return projection;
  };

  projection.azimuth = function(_?: number): VerticalProjection {
    if (!arguments.length) return this;
    azimuthAngle = _!;
    return projection;
  };

  return projection
    .scale(250)
    .clipAngle(Math.acos(1/P) * 180 / Math.PI);
>>>>>>> Stashed changes
}

export default verticalPerspective;
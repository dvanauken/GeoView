/**
 * versor.ts
 * A comprehensive utility class for handling 3D rotations using quaternions and versors.
 * Implements smooth interpolation and transformation between different rotation representations.
 */

export class Versor {
  /**
   * Converts degrees to radians
   */
  static toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  /**
   * Converts radians to degrees
   */
  static toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }

  /**
   * Converts latitude and longitude to 3D Cartesian coordinates on a unit sphere
   */
  static cartesian(lambda: number, phi: number): [number, number, number] {
    lambda = this.toRadians(lambda);
    phi = this.toRadians(phi);
    const cosPhi = Math.cos(phi);
    return [
      cosPhi * Math.cos(lambda),
      cosPhi * Math.sin(lambda),
      Math.sin(phi)
    ];
  }

  /**
   * Converts 3D Cartesian coordinates to [longitude, latitude] in degrees
   */
  static spherical(cartesian: [number, number, number]): [number, number] {
    const [x, y, z] = cartesian;
    return [
      this.toDegrees(Math.atan2(y, x)),
      this.toDegrees(Math.asin(Math.max(-1, Math.min(1, z))))
    ];
  }

  /**
   * Calculates the dot product of two vectors
   */
  static dot(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    return Math.max(-1, Math.min(1, a.reduce((sum, _, i) => sum + a[i] * b[i], 0)));
  }

  /**
   * Calculates the cross product of two 3D vectors
   */
  static cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  /**
   * Normalizes a vector to unit length
   */
  static normalize(v: number[]): number[] {
    const length = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
    if (length === 0) {
      throw new Error('Cannot normalize zero-length vector');
    }
    return v.map(x => x / length);
  }

  /**
   * Creates a quaternion that rotates vector v0 to align with vector v1
   */
  static quaternion(v0: [number, number, number], v1: [number, number, number]): [number, number, number, number] {
    if (!v0 || !v1) {
      throw new Error('Both vectors are required');
    }

    // Normalize input vectors
    const normalized0 = this.normalize(v0) as [number, number, number];
    const normalized1 = this.normalize(v1) as [number, number, number];

    const dot = this.dot(normalized0, normalized1);

    // If vectors are parallel, return identity quaternion
    if (dot >= 0.999999) {
      return [1, 0, 0, 0];
    }

    // If vectors are anti-parallel, rotate 180° around any perpendicular axis
    if (dot <= -0.999999) {
      const axis = Math.abs(normalized0[0]) < 0.1 ?
        this.cross(normalized0, [1, 0, 0]) :
        this.cross(normalized0, [0, 1, 0]);
      const normalizedAxis = this.normalize(axis);
      return [0, ...normalizedAxis] as [number, number, number, number];
    }

    const w = this.cross(normalized0, normalized1);
    const theta = Math.acos(dot);
    const wlen = Math.sqrt(w.reduce((sum, x) => sum + x * x, 0));

    if (wlen < 1e-10) {
      return [1, 0, 0, 0];
    }

    const sinHalfTheta = Math.sin(theta / 2);
    return [
      Math.cos(theta / 2),
      (w[0] / wlen) * sinHalfTheta,
      (w[1] / wlen) * sinHalfTheta,
      (w[2] / wlen) * sinHalfTheta
    ];
  }

  /**
   * Multiplies two quaternions
   */
  static multiply(a: [number, number, number, number], b: [number, number, number, number]): [number, number, number, number] {
    return [
      a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
      a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
      a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
      a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]
    ];
  }

  /**
   * Converts a quaternion to a rotation matrix
   */
  static quaternionToMatrix(q: [number, number, number, number]): number[] {
    const [w, x, y, z] = this.normalize(q) as [number, number, number, number];
    const xx = x * x, yy = y * y, zz = z * z;
    const xy = x * y, xz = x * z, yz = y * z;
    const wx = w * x, wy = w * y, wz = w * z;

    return [
      1 - 2 * (yy + zz),      2 * (xy - wz),          2 * (xz + wy),
      2 * (xy + wz),          1 - 2 * (xx + zz),      2 * (yz - wx),
      2 * (xz - wy),          2 * (yz + wx),          1 - 2 * (xx + yy)
    ];
  }

  /**
   * Converts a rotation matrix to Euler angles [phi, theta, psi] in degrees
   */
  static matrixToEuler(matrix: number[]): [number, number, number] {
    const [m11, m12, m13, m21, m22, m23, m31, m32, m33] = matrix;

    let phi: number, theta: number, psi: number;

    if (Math.abs(m31) !== 1) {
      theta = -Math.asin(Math.max(-1, Math.min(1, m31)));
      const cosTheta = Math.cos(theta);
      phi = Math.atan2(m32 / cosTheta, m33 / cosTheta);
      psi = Math.atan2(m21 / cosTheta, m11 / cosTheta);
    } else {
      // Gimbal lock case
      phi = 0;
      if (m31 === -1) {
        theta = Math.PI / 2;
        psi = phi + Math.atan2(m12, m13);
      } else {
        theta = -Math.PI / 2;
        psi = -phi + Math.atan2(-m12, -m13);
      }
    }

    return [
      this.toDegrees(phi),
      this.toDegrees(theta),
      this.toDegrees(psi)
    ];
  }

  /**
   * Creates a quaternion from Euler angles [phi, theta, psi] in degrees
   */
  static eulerToQuaternion(euler: [number, number, number]): [number, number, number, number] {
    const [phi, theta, psi] = euler.map(this.toRadians);

    const c1 = Math.cos(phi / 2);
    const c2 = Math.cos(theta / 2);
    const c3 = Math.cos(psi / 2);
    const s1 = Math.sin(phi / 2);
    const s2 = Math.sin(theta / 2);
    const s3 = Math.sin(psi / 2);

    return [
      c1 * c2 * c3 + s1 * s2 * s3,
      s1 * c2 * c3 - c1 * s2 * s3,
      c1 * s2 * c3 + s1 * c2 * s3,
      c1 * c2 * s3 - s1 * s2 * c3
    ];
  }

  /**
   * Interpolates between two quaternions using spherical linear interpolation (slerp)
   */
  static slerp(q1: [number, number, number, number], q2: [number, number, number, number], t: number): [number, number, number, number] {
    // Normalize quaternions
    const n1 = this.normalize(q1) as [number, number, number, number];
    const n2 = this.normalize(q2) as [number, number, number, number];

    // Calculate cosine of angle between quaternions
    let dot = this.dot(n1, n2);

    // If quaternions are very close, use linear interpolation
    if (Math.abs(dot) > 0.9995) {
      const result = n1.map((x, i) => x + t * (n2[i] - x));
      return this.normalize(result) as [number, number, number, number];
    }

    // Ensure shortest path
    if (dot < 0) {
      n2.forEach((_, i) => n2[i] = -n2[i]);
      dot = -dot;
    }

    // Clamp dot product to valid range
    dot = Math.max(-1, Math.min(1, dot));

    const theta0 = Math.acos(dot);
    const theta = theta0 * t;
    const sinTheta = Math.sin(theta);
    const sinTheta0 = Math.sin(theta0);

    const s1 = Math.cos(theta) - dot * sinTheta / sinTheta0;
    const s2 = sinTheta / sinTheta0;

    return [
      s1 * n1[0] + s2 * n2[0],
      s1 * n1[1] + s2 * n2[1],
      s1 * n1[2] + s2 * n2[2],
      s1 * n1[3] + s2 * n2[3]
    ];
  }

  /**
   * Converts a rotation in [longitude, latitude, rotation] format to a quaternion
   */
  static rotationToQuaternion(rotation: [number, number, number]): [number, number, number, number] {
    const [lambda, phi, gamma] = rotation.map(this.toRadians);

    const cLambda = Math.cos(lambda / 2);
    const sLambda = Math.sin(lambda / 2);
    const cPhi = Math.cos(phi / 2);
    const sPhi = Math.sin(phi / 2);
    const cGamma = Math.cos(gamma / 2);
    const sGamma = Math.sin(gamma / 2);

    return [
      cLambda * cPhi * cGamma - sLambda * sPhi * sGamma,
      sLambda * cPhi * cGamma + cLambda * sPhi * sGamma,
      cLambda * sPhi * cGamma - sLambda * cPhi * sGamma,
      cLambda * cPhi * sGamma + sLambda * sPhi * cGamma
    ];
  }

  /**
   * Converts a quaternion to [longitude, latitude, rotation] in degrees
   */
  static quaternionToRotation(q: [number, number, number, number]): [number, number, number] {
    const normalized = this.normalize(q) as [number, number, number, number];
    const [w, x, y, z] = normalized;

    const sinPhi = 2 * (w * y - z * x);
    let phi = Math.asin(Math.max(-1, Math.min(1, sinPhi)));

    const lambda = Math.atan2(
      2 * (w * x + y * z),
      1 - 2 * (x * x + y * y)
    );

    const gamma = Math.atan2(
      2 * (w * z + x * y),
      1 - 2 * (y * y + z * z)
    );

    return [
      this.toDegrees(lambda),
      this.toDegrees(phi),
      this.toDegrees(gamma)
    ];
  }
}

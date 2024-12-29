// src/app/projections/types/projection.types.ts

export interface GeoCoordinates {
  lat: number;  // Latitude in radians
  lon: number;  // Longitude in radians
}

export interface ProjectedCoordinates {
  x: number;
  y: number;
}

export enum ProjectionFlags {
  EqualArea = 'equalArea',
  Pseudocylindrical = 'pseudocylindrical',
  SinusoidalSpacing = 'sinusoidalSpacing',
  MeridiansCurved = 'meridiansCurved',
  Equidistant = 'equidistant',
  Compromise = 'compromise',
  ParallelLatitudes = 'parallelLatitudes',
  Symmetric = 'symmetric'
}

export interface ProjectionConfig {
  R?: number;           // Sphere radius
  lat0?: number;        // Central latitude
  lon0?: number;        // Central longitude
  flags?: ProjectionFlags[];
}
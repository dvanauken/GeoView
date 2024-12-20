import { Point } from "geojson";
import { ProjectionType } from "./projection-type.enum";

// models/projection-state.interface.ts
export interface ProjectionState {
  point1: Point;
  point2: Point;
  type: ProjectionType;
}


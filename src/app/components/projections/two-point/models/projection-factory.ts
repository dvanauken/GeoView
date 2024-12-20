// models/projection-factory.ts
import { ProjectionType } from './projection-type.enum';
import { Point } from './point.interface';
import { AbstractTwoPointProjection } from './abstract-two-point-projection';
import { EquidistantProjection } from './equidistant-projection';
import { AzimuthalProjection } from './azimuthal-projection';

export class ProjectionFactory {
    static createProjection(
        type: ProjectionType,
        point1: Point,
        point2: Point
    ): AbstractTwoPointProjection {
        switch (type) {
            case ProjectionType.EQUIDISTANT:
                return new EquidistantProjection(point1, point2);
            case ProjectionType.AZIMUTHAL:
                return new AzimuthalProjection(point1, point2);
            default:
                throw new Error(`Unknown projection type: ${type}`);
        }
    }
}
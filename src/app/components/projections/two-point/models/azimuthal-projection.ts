// models/azimuthal-projection.ts
import * as d3 from 'd3';
import { geoTwoPointAzimuthal } from 'd3-geo-projection';
import { AbstractTwoPointProjection } from './abstract-two-point-projection';
import { Point } from './point.interface';

export class AzimuthalProjection extends AbstractTwoPointProjection {
    private projection: any; // d3 projection type

    constructor(initialPoint1: Point, initialPoint2: Point) {
        super(initialPoint1, initialPoint2);
        this.initializeProjection();
    }

    private initializeProjection(): void {
        this.projection = geoTwoPointAzimuthal()
            .points([
                [this.point1.longitude, this.point1.latitude],
                [this.point2.longitude, this.point2.latitude]
            ])
            .scale(150)
            .translate([480, 300]); // These will be overridden by UI layer
    }

    override setPoint1(point: Point): void {
        super.setPoint1(point);
        this.initializeProjection();
    }

    override setPoint2(point: Point): void {
        super.setPoint2(point);
        this.initializeProjection();
    }

    project(coordinates: Point): [number, number] {
        return this.projection([coordinates.longitude, coordinates.latitude]) as [number, number];
    }

    unproject(point: [number, number]): Point {
        const [longitude, latitude] = this.projection.invert(point);
        return { latitude, longitude };
    }

    getProjection(): any {
        return this.projection;
    }
}
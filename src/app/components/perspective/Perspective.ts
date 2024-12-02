import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { geoSatellite } from 'd3-geo-projection';

interface PerspectiveParams {
    longitude: number;
    latitude: number;
    altitude: number;
    rotation: number;
    tilt: number;
    fieldOfView: number;
}

class Perspective {
    private params: PerspectiveParams;
    private earthRadius: number;
    private degrees: number;
    private snyderP: number | null;
    private dY: number | null;
    private dZ: number | null;
    private visibleYextent: number | null;
    private scale: number | null;
    private yShift: number | null;
    private numPixelsY: number | null;
    private width: number | null;
    private projection: any | null;
    private preclip: any | null;
    private grid: any | null;
    private land: any | null;
    private land50: any | null;
    private land110: any | null;
    private geoClipCircle: any;

    constructor() {
        this.params = {
            longitude: -85,
            latitude: 18,
            altitude: 1024,
            rotation: 15,
            tilt: 45,
            fieldOfView: 25
        };

        this.earthRadius = 6371;
        this.degrees = 180 / Math.PI;

        this.snyderP = null;
        this.dY = null;
        this.dZ = null;
        this.visibleYextent = null;
        this.scale = null;
        this.yShift = null;
        this.numPixelsY = null;
        this.width = null;

        this.projection = null;
        this.preclip = null;
        this.grid = null;
        this.land = null;
        this.land50 = null;
        this.land110 = null;

        // Bind methods that are used as callbacks
        this.geoPipeline = this.geoPipeline.bind(this);
        this.geoRotatePhi = this.geoRotatePhi.bind(this);
        this.geoClipCircle = d3.geoClipCircle;
    }

    public init(width: number): Promise<Perspective> {
        this.width = width;
        this.numPixelsY = width * 0.6;
        this.setupGrid();
        this.calculateAll();
        return this.loadMapData();
    }

    public updateParams(newParams: Partial<PerspectiveParams>): void {
        Object.assign(this.params, newParams);
        this.calculateAll();
    }

    public async loadMapData(): Promise<Perspective> {
        try {
            const [land50Response, land110Response] = await Promise.all([
                fetch('https://cdn.jsdelivr.net/npm/world-atlas@1/world/50m.json'),
                fetch('https://cdn.jsdelivr.net/npm/world-atlas@1/world/110m.json')
            ]);
            
            const world50 = await land50Response.json();
            const world110 = await land110Response.json();
            
            this.land50 = topojson.feature(world50, world50.objects.land);
            this.land110 = topojson.feature(world110, world110.objects.land);
            this.land = this.land50;
            
            return this;
        } catch (error) {
            console.error('Failed to load map data:', error);
            throw error;
        }
    }

    private setupGrid(): void {
        this.grid = {
            major: d3.geoGraticule().step([15, 15])(),
            minor: d3.geoGraticule().step([5, 5])(),
            horizon: { type: "Sphere" }
        };
    }

    private calculateAll(): void {
        this.snyderP = this.calculateSnyderP();
        [this.dY, this.dZ] = this.calculateOffsets();
        this.visibleYextent = this.calculateVisibleExtent();
        this.scale = this.calculateScale();
        this.yShift = this.calculateYShift();
        this.updateProjection();
    }

    private calculateSnyderP(): number {
        return 1.0 + this.params.altitude / this.earthRadius;
    }

    private calculateOffsets(): [number, number] {
        const tiltRad = this.params.tilt / this.degrees;
        const dY = this.params.altitude * Math.sin(tiltRad);
        const dZ = this.params.altitude * Math.cos(tiltRad);
        return [dY, dZ];
    }

    private calculateVisibleExtent(): number {
        const fovRad = 0.5 * this.params.fieldOfView / this.degrees;
        return 2 * this.dZ! * Math.tan(fovRad);
    }

    private calculateScale(): number {
        return this.earthRadius * this.numPixelsY! / this.visibleYextent!;
    }

    private calculateYShift(): number {
        return this.dY! * this.numPixelsY! / this.visibleYextent!;
    }

    private updateProjection(): void {
        this.preclip = this.createPreclip();
        this.projection = geoSatellite()
            .scale(this.scale)
            .translate([this.width! / 2, this.yShift! + this.numPixelsY! / 2])
            .rotate([-this.params.longitude, -this.params.latitude, this.params.rotation])
            .tilt(this.params.tilt)
            .distance(this.snyderP)
            .preclip(this.preclip)
            .precision(0.1);
    }

    private createPreclip(): any {
        const tilt = this.params.tilt / this.degrees;
        const alpha = Math.acos(this.snyderP! * Math.cos(tilt) * 0.999);
        const clipDistance = this.geoClipCircle(Math.acos(1 / this.snyderP!) - 1e-6);
        
        if (!alpha) return clipDistance;
        
        return this.geoPipeline(
            clipDistance,
            this.geoRotatePhi(Math.PI + tilt),
            this.geoClipCircle(Math.PI - alpha - 1e-4),
            this.geoRotatePhi(-Math.PI - tilt)
        );
    }

    private geoPipeline(...transforms: any[]): any {
        return (sink: any) => {
            for (let i = transforms.length - 1; i >= 0; --i) {
                sink = transforms[i](sink);
            }
            return sink;
        };
    }

    private geoRotatePhi(deltaPhi: number): any {
        const cosDeltaPhi = Math.cos(deltaPhi);
        const sinDeltaPhi = Math.sin(deltaPhi);
        return (sink: any) => ({
            point(lambda: number, phi: number) {
                const cosPhi = Math.cos(phi);
                const x = Math.cos(lambda) * cosPhi;
                const y = Math.sin(lambda) * cosPhi;
                const z = Math.sin(phi);
                const k = z * cosDeltaPhi + x * sinDeltaPhi;
                sink.point(Math.atan2(y, x * cosDeltaPhi - z * sinDeltaPhi), Math.asin(k));
            },
            lineStart() { sink.lineStart(); },
            lineEnd() { sink.lineEnd(); },
            polygonStart() { sink.polygonStart(); },
            polygonEnd() { sink.polygonEnd(); },
            sphere() { sink.sphere(); }
        });
    }

    public draw(context: CanvasRenderingContext2D): void {
        if (!this.projection || !this.land) return;
        
        const path = d3.geoPath(this.projection, context);
        
        context.clearRect(0, 0, this.width!, this.numPixelsY!);
        
        context.fillStyle = "#88d";
        context.beginPath();
        path(this.land);
        context.fill();
        
        context.beginPath();
        path(this.grid.major);
        context.strokeStyle = "#ddf";
        context.globalAlpha = 0.8;
        context.stroke();
        
        context.beginPath();
        path(this.grid.horizon);
        context.strokeStyle = "#000";
        context.globalAlpha = 1;
        context.stroke();
        
        const el = document.querySelector('input[name="altitude"]');
        const kmValue = this.params.altitude;
        const milesValue = kmValue * 0.621371;
        if (el?.nextElementSibling) {
            el.nextElementSibling.textContent = `${milesValue.toLocaleString()} miles`;
        }
    }

    public setResolution(useHighRes: boolean): void {
        this.land = useHighRes ? this.land50 : this.land110;
    }
}

export default Perspective;
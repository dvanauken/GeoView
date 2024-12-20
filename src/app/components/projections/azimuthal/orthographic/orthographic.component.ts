import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import * as versor from 'versor';

@Component({
  selector: 'app-orthographic',
  templateUrl: './orthographic.component.html',
  styleUrls: ['./orthographic.component.scss']
})
export class OrthographicComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bufferCanvas') bufferCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mercatorCanvas') mercatorCanvasRef!: ElementRef<HTMLCanvasElement>;
  
  // Main view properties
  private readonly width = 800;
  private readonly height = 600;
  private readonly aspect = this.width / this.height;
  private readonly MINIMUM_SIZE = 20;
  private readonly MAX_SCALE = 2000;
  private readonly INITIAL_SCALE = 300;

  // Reference map properties
  private readonly REFERENCE_WIDTH = 300;
  private readonly REFERENCE_HEIGHT = 200;

  // Canvas contexts
  private context!: CanvasRenderingContext2D;
  private bufferContext!: CanvasRenderingContext2D;
  private mercatorContext!: CanvasRenderingContext2D;

  // Projections
  private projection!: d3.GeoProjection;
  private mercatorProjection!: d3.GeoProjection;
  private path!: d3.GeoPath;
  private mercatorPath!: d3.GeoPath;

  // Shared data
  private sphere = { type: "Sphere" };
  private land50: any;
  private land110: any;
  private destroyed = false;
  
  // Rubber band state
  private isRubberBanding = false;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  
  private readonly keydownListener: (event: KeyboardEvent) => void;
  private readonly keyupListener: (event: KeyboardEvent) => void;
  
  constructor(private ngZone: NgZone) {
    this.keydownListener = this.handleKeyDown.bind(this);
    this.keyupListener = this.handleKeyUp.bind(this);
  }

  ngOnInit(): void {
    this.initializeProjections();
    this.loadLandData();
  }

  ngAfterViewInit(): void {
    this.initializeCanvases();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    window.removeEventListener('keydown', this.keydownListener);
    window.removeEventListener('keyup', this.keyupListener);
  }

  private initializeCanvases(): void {
    // Main canvas setup
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext('2d')!;

    // Buffer canvas setup
    const bufferCanvas = this.bufferCanvasRef.nativeElement;
    bufferCanvas.width = this.width;
    bufferCanvas.height = this.height;
    this.bufferContext = bufferCanvas.getContext('2d')!;

    // Reference map setup
    const mercatorCanvas = this.mercatorCanvasRef.nativeElement;
    mercatorCanvas.width = this.REFERENCE_WIDTH;
    mercatorCanvas.height = this.REFERENCE_HEIGHT;
    this.mercatorContext = mercatorCanvas.getContext('2d')!;
  }

  private initializeProjections(): void {
    // Main orthographic projection
    this.projection = d3.geoOrthographic()
      .precision(0.1)
      .scale(this.INITIAL_SCALE)
      .translate([this.width / 2, this.height / 2]);

    this.path = d3.geoPath(this.projection, this.context);

    // Reference mercator projection
    this.mercatorProjection = d3.geoMercator()
      .precision(0.1)
      .fitSize([this.REFERENCE_WIDTH, this.REFERENCE_HEIGHT], this.sphere);

    this.mercatorPath = d3.geoPath(this.mercatorProjection, this.mercatorContext);
  }

  private async loadLandData(): Promise<void> {
    try {
      const [response50, response110] = await Promise.all([
        fetch('../../assets/land-50m.json'),
        fetch('../../assets/land-110m.json')
      ]);

      if (!this.destroyed) {
        const world50 = await response50.json();
        const world110 = await response110.json();

        this.land50 = topojson.feature(world50, world50.objects.land);
        this.land110 = topojson.feature(world110, world110.objects.land);

        this.render(this.land50);
        this.renderReferenceMap();
      }
    } catch (error) {
      console.error('Error loading land data:', error);
    }
  }

  private calculateViewportExtent(): GeoJSON.Feature<GeoJSON.Polygon> {
    const numPoints = 20;
    const points: [number, number][] = [];
    
    // Sample points along viewport edges
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      
      // Sample each edge
      ['top', 'right', 'bottom', 'left'].forEach(edge => {
        const [x, y] = edge === 'top' ? [t * this.width, 0] :
                      edge === 'right' ? [this.width, t * this.height] :
                      edge === 'bottom' ? [(1 - t) * this.width, this.height] :
                      [0, (1 - t) * this.height];
                      
        const point = this.projection.invert!([x, y]);
        if (point) points.push(point);
      });
    }

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [points]
      }
    };
  }

  private renderReferenceMap(): void {
    // Clear the reference map
    this.mercatorContext.clearRect(0, 0, this.REFERENCE_WIDTH, this.REFERENCE_HEIGHT);
    
    // Draw world outline
    this.mercatorContext.beginPath();
    this.mercatorPath(this.sphere);
    this.mercatorContext.fillStyle = "#fff";
    this.mercatorContext.fill();
    
    // Draw land
    this.mercatorContext.beginPath();
    this.mercatorPath(this.land110);
    this.mercatorContext.fillStyle = "#ddd";
    this.mercatorContext.fill();
    
    // Draw viewport extent
    const viewportExtent = this.calculateViewportExtent();
    this.mercatorContext.beginPath();
    this.mercatorPath(viewportExtent);
    this.mercatorContext.strokeStyle = "rgba(255, 0, 0, 0.8)";
    this.mercatorContext.stroke();
  }

  // ... [Existing methods remain unchanged: setupEventListeners, handleKeyDown, handleKeyUp,
  //     setupRubberBandHandlers, setupDragHandlers, drawRubberBand, applyZoom, resetView,
  //     render, cartesian, multiply] ...

  // Update the render method to also update reference map
  private render(land: any): void {
    this.context.clearRect(0, 0, this.width, this.height);
    
    this.context.beginPath();
    this.path(this.sphere);
    this.context.fillStyle = "#fff";
    this.context.fill();
    
    this.context.beginPath();
    this.path(land);
    this.context.fillStyle = "#000";
    this.context.fill();
    
    this.context.beginPath();
    this.path(this.sphere);
    this.context.stroke();

    // Update reference map
    this.renderReferenceMap();
  }
}
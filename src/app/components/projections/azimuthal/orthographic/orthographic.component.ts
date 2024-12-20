import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import versor from 'versor';

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
  private sphere: d3.GeoSphere = { type: "Sphere" };
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
    console.log('ngOnInit');
    this.initializeProjections();
    this.loadLandData();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
    this.initializeCanvases();
    console.log('Canvases initialized');
    this.setupEventListeners();
    console.log('Event listeners set up');
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    window.removeEventListener('keydown', this.keydownListener);
    window.removeEventListener('keyup', this.keyupListener);
  }

  private initializeCanvases(): void {


    console.log('Initializing canvases...');
    const canvas = this.canvasRef.nativeElement;
    console.log('Main canvas:', canvas);

    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext('2d')!;
  
    // Buffer canvas & context
    const bufferCanvas = this.bufferCanvasRef.nativeElement;

    bufferCanvas.style.pointerEvents = 'none';  // Ensure buffer isn't blocking
    console.log('Buffer canvas style:', bufferCanvas.style.pointerEvents);

    bufferCanvas.width = this.width;
    bufferCanvas.height = this.height;
    this.bufferContext = bufferCanvas.getContext('2d')!;
  
    // Reference map & context
    const mercatorCanvas = this.mercatorCanvasRef.nativeElement;
    mercatorCanvas.width = this.REFERENCE_WIDTH;
    mercatorCanvas.height = this.REFERENCE_HEIGHT;
    this.mercatorContext = mercatorCanvas.getContext('2d')!;
  
    // Create paths after contexts are initialized
    this.path = d3.geoPath(this.projection, this.context);
    this.mercatorPath = d3.geoPath(this.mercatorProjection, this.mercatorContext);
  }

  private initializeProjections(): void {
    this.projection = d3.geoOrthographic()
      .precision(0.1)
      .scale(this.INITIAL_SCALE)
      .translate([this.width / 2, this.height / 2]);
  
    this.mercatorProjection = d3.geoMercator()
      .scale(this.REFERENCE_WIDTH / 6)
      .center([0, 0])
      .translate([this.REFERENCE_WIDTH / 2, this.REFERENCE_HEIGHT / 2]);
  }

  private async loadLandData(): Promise<void> {
    console.log('Loading land data...');

    try {
      console.log('Fetching land data...');
      const [response50, response110] = await Promise.all([
        fetch('../../assets/land-50m.json'),
        fetch('../../assets/land-110m.json')
      ]);

      console.log('Response status:', response50.status, response110.status);

      if (!this.destroyed) {
        const world50 = await response50.json();
        const world110 = await response110.json();

        console.log('Loaded data:', world50, world110);

        this.land50 = topojson.feature(world50, world50.objects.land);
        this.land110 = topojson.feature(world110, world110.objects.land);

        console.log('Processed features:', this.land50, this.land110);

        this.render(this.land50);
        //this.renderReferenceMap();
      }
    } catch (error) {
      console.error('Error loading land data:', error);
    }
  }

  private calculateViewportExtent(): GeoJSON.Feature<GeoJSON.Polygon> {
    const numPoints = 60; // Increased from 20
    const points: [number, number][] = [];

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;

      ['top', 'right', 'bottom', 'left'].forEach(edge => {
        const [x, y] = edge === 'top' ? [t * this.width, 0] :
          edge === 'right' ? [this.width, t * this.height] :
            edge === 'bottom' ? [(1 - t) * this.width, this.height] :
              [0, (1 - t) * this.height];

        const point = this.projection.invert!([x, y]);
        if (point) points.push(point);
      });
    }

    // Ensure the polygon is closed
    if (points.length > 0) points.push(points[0]);

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
    console.log('Rendering reference map...');
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

  private setupEventListeners(): void {
    console.log('Setting up event listeners...');

    this.setupDragHandlers();
    this.setupRubberBandHandlers();

    // Global key listeners
    window.addEventListener('keydown', this.keydownListener);
    window.addEventListener('keyup', this.keyupListener);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.altKey) {
      this.bufferCanvasRef.nativeElement.style.pointerEvents = 'auto';
      this.bufferCanvasRef.nativeElement.style.cursor = 'crosshair';
    }

    if (event.key === 'Escape' && this.isRubberBanding) {
      this.isRubberBanding = false;
      this.bufferContext.clearRect(0, 0, this.width, this.height);
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!event.altKey) {
      this.bufferCanvasRef.nativeElement.style.pointerEvents = 'none';
      this.bufferCanvasRef.nativeElement.style.cursor = 'default';
    }
  }

  private setupRubberBandHandlers(): void {
    const bufferCanvas = this.bufferCanvasRef.nativeElement;

    bufferCanvas.addEventListener('mousedown', (event: MouseEvent) => {
      if (event.altKey) {
        this.isRubberBanding = true;
        this.startX = event.offsetX;
        this.startY = event.offsetY;

        const mousemove = (moveEvent: MouseEvent) => {
          this.currentX = moveEvent.offsetX;
          this.currentY = moveEvent.offsetY;
          this.drawRubberBand();
        };

        const mouseup = (upEvent: MouseEvent) => {
          this.isRubberBanding = false;
          bufferCanvas.removeEventListener('mousemove', mousemove);
          bufferCanvas.removeEventListener('mouseup', mouseup);

          this.bufferContext.clearRect(0, 0, this.width, this.height);

          // Apply zoom if selection is large enough
          if (Math.abs(this.currentX - this.startX) >= this.MINIMUM_SIZE &&
            Math.abs(this.currentY - this.startY) >= this.MINIMUM_SIZE) {
            this.applyZoom();
          }
        };

        bufferCanvas.addEventListener('mousemove', mousemove);
        bufferCanvas.addEventListener('mouseup', mouseup);
      }
    });
  }

  private setupDragHandlers(): void {
    let v0: [number, number, number];
    let q0: number[];
    let r0: [number, number, number];
 
    const canvas = this.canvasRef.nativeElement;
    console.log('Setting up drag handlers, canvas:', canvas);

    canvas.addEventListener('click', () => {
      console.log('Canvas clicked');
    });

    canvas.style.pointerEvents = 'auto';

    console.log('Current canvas style:', {
      position: canvas.style.position,
      pointerEvents: canvas.style.pointerEvents,
      zIndex: canvas.style.zIndex
    });

    canvas.addEventListener('mousedown', (event: MouseEvent) => {
        console.log('Mouse down event triggered', event);
        if (!event.altKey) {
            const [x, y] = [event.offsetX, event.offsetY];
            console.log('Mouse position:', x, y);
            
            const inverted = this.projection.invert!([x, y]);
            console.log('Inverted coordinates:', inverted);
            
            v0 = this.cartesian(inverted!);
            console.log('v0:', v0);
            
            r0 = this.projection.rotate();
            console.log('r0:', r0);
            
            q0 = versor(r0);
            console.log('q0:', q0);
 
            const pointermove = (event: MouseEvent) => {
                console.log('Pointer move event');
                const [x, y] = [event.offsetX, event.offsetY];
                const v1 = this.cartesian(this.projection.rotate(r0).invert!([x, y])!);
                const deltaQ = versor.delta(v0, v1);
                const q1 = this.multiply(q0, deltaQ);
                this.projection.rotate(versor.rotation(q1));
                this.render(this.land110 || this.land50);
            };
 
            const pointerup = () => {
                console.log('Pointer up event');
                canvas.removeEventListener('mousemove', pointermove);
                canvas.removeEventListener('mouseup', pointerup);
                this.render(this.land50);
            };
 
            canvas.addEventListener('mousemove', pointermove);
            canvas.addEventListener('mouseup', pointerup);
        }
    });
 }

  private drawRubberBand(): void {
    this.bufferContext.clearRect(0, 0, this.width, this.height);

    const redWidth = Math.abs(this.currentX - this.startX);
    const redHeight = Math.abs(this.currentY - this.startY);
    const redLeft = Math.min(this.startX, this.currentX);
    const redTop = Math.min(this.startY, this.currentY);

    // Draw red rectangle
    this.bufferContext.strokeStyle = 'rgba(255, 0, 0, 1)';
    this.bufferContext.strokeRect(redLeft, redTop, redWidth, redHeight);

    // Show minimum size indicator
    if (redWidth < this.MINIMUM_SIZE || redHeight < this.MINIMUM_SIZE) {
      this.bufferContext.fillStyle = 'rgba(255, 0, 0, 0.3)';
      this.bufferContext.fillRect(redLeft, redTop, redWidth, redHeight);
      return;
    }

    // Calculate gray rectangle dimensions
    let grayWidth: number;
    let grayHeight: number;
    const redAspect = redWidth / redHeight;

    if (redAspect > this.aspect) {
      grayWidth = redWidth;
      grayHeight = redWidth / this.aspect;
    } else {
      grayHeight = redHeight;
      grayWidth = redHeight * this.aspect;
    }

    // Center gray rectangle within red rectangle
    const grayLeft = redLeft + (redWidth - grayWidth) / 2;
    const grayTop = redTop + (redHeight - grayHeight) / 2;

    // Draw gray rectangle
    this.bufferContext.fillStyle = 'rgba(128, 128, 128, 0.3)';
    this.bufferContext.fillRect(grayLeft, grayTop, grayWidth, grayHeight);
  }

  private applyZoom(): void {
    const redWidth = Math.abs(this.currentX - this.startX);
    const redHeight = Math.abs(this.currentY - this.startY);
    const redLeft = Math.min(this.startX, this.currentX);
    const redTop = Math.min(this.startY, this.currentY);

    let grayWidth: number;
    let grayHeight: number;
    const redAspect = redWidth / redHeight;

    if (redAspect > this.aspect) {
      grayWidth = redWidth;
      grayHeight = redWidth / this.aspect;
    } else {
      grayHeight = redHeight;
      grayWidth = redHeight * this.aspect;
    }

    // Calculate gray rectangle position
    const grayLeft = redLeft + (redWidth - grayWidth) / 2;
    const grayTop = redTop + (redHeight - grayHeight) / 2;

    // Calculate new scale based on gray rectangle
    const scale = this.projection.scale();
    const newScale = Math.min(scale * (this.width / grayWidth), this.MAX_SCALE);

    // Calculate the center point of the gray rectangle
    const centerX = grayLeft + grayWidth / 2;
    const centerY = grayTop + grayHeight / 2;

    // Get the geographical coordinates of the center point
    const centerGeo = this.projection.invert!([centerX, centerY]);

    if (centerGeo) {
      // Update projection
      this.projection
        .scale(newScale)
        .center(centerGeo);

      // Render with new projection
      this.render(this.land110 || this.land50);
    }
  }

  private resetView(): void {
    this.projection
      .scale(this.INITIAL_SCALE)
      .rotate([0, 0, 0])
      .translate([this.width / 2, this.height / 2]);

    this.render(this.land110 || this.land50);
  }

  private cartesian(coords: [number, number]): [number, number, number] {
    const [λ, φ] = coords.map(d => d * Math.PI / 180);
    return [
      Math.cos(φ) * Math.cos(λ),
      Math.cos(φ) * Math.sin(λ),
      Math.sin(φ)
    ];
  }

  private multiply(a: number[], b: number[]): [number, number, number, number] {
    return [
      a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
      a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
      a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
      a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]
    ];
  }

  private render(land: any): void {
    console.log('Rendering main view...');
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

    this.renderReferenceMap();
  }
}
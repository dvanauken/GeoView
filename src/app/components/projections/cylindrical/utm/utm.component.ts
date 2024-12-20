import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client'; // Correct import for TopoJSON
import * as d3 from 'd3';


@Component({
  selector: 'app-utm',
  templateUrl: './utm.component.html',
  styleUrls: ['./utm.component.scss'],
})
export class UtmComponent implements OnInit {
  @ViewChild('mapCanvas', { static: true }) mapCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('horizontalRulerCanvas', { static: true }) horizontalRulerCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('verticalRulerCanvas', { static: true }) verticalRulerCanvas!: ElementRef<HTMLCanvasElement>;

  @Output() zoneSelected = new EventEmitter<string>();

  private context!: CanvasRenderingContext2D;
  private horizontalRulerContext!: CanvasRenderingContext2D;
  private verticalRulerContext!: CanvasRenderingContext2D;

  private projection = geoMercator().scale(120).translate([960 / 2, 500 / 2]);
  private path = geoPath(this.projection);
  private canvasWidth = 960;
  private canvasHeight = 500;
  private hoveredZone: string | null = null;
  private landData: any = null;

  constructor(private http: HttpClient) {}

//   ngOnInit(): void {
//     this.setupCanvases();
//     this.loadMapData();
//     this.drawRulers(); // Ensure rulers are drawn
//   }
  

//   private setupCanvases(): void {
//     // Initialize map canvas
//     const mapCanvasElement = this.mapCanvas.nativeElement;
//     mapCanvasElement.width = this.canvasWidth;
//     mapCanvasElement.height = this.canvasHeight;
//     this.context = mapCanvasElement.getContext('2d')!;

//     // Initialize horizontal ruler canvas
//     const horizontalRulerElement = this.horizontalRulerCanvas.nativeElement;
//     horizontalRulerElement.width = this.canvasWidth;
//     horizontalRulerElement.height = 50;
//     this.horizontalRulerContext = horizontalRulerElement.getContext('2d')!;

//     // Initialize vertical ruler canvas
//     const verticalRulerElement = this.verticalRulerCanvas.nativeElement;
//     verticalRulerElement.width = 50;
//     verticalRulerElement.height = this.canvasHeight;
//     this.verticalRulerContext = verticalRulerElement.getContext('2d')!;
//   }

ngOnInit(): void {
    try {
      this.setupCanvases(); // Setup canvas contexts
      this.drawRulers(); // Draw rulers
      this.loadMapData(); // Load and draw the map
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  private setupCanvases(): void {
    const mapCanvasElement = this.mapCanvas.nativeElement;
    console.log('Initializing map canvas...');
    this.context = mapCanvasElement.getContext('2d');
    if (!this.context) {
      console.error('Failed to initialize map canvas context');
    }
  
    const horizontalRulerElement = this.horizontalRulerCanvas.nativeElement;
    console.log('Initializing horizontal ruler canvas...');
    this.horizontalRulerContext = horizontalRulerElement.getContext('2d');
    if (!this.horizontalRulerContext) {
      console.error('Failed to initialize horizontal ruler canvas context');
    }
  
    const verticalRulerElement = this.verticalRulerCanvas.nativeElement;
    console.log('Initializing vertical ruler canvas...');
    this.verticalRulerContext = verticalRulerElement.getContext('2d');
    if (!this.verticalRulerContext) {
      console.error('Failed to initialize vertical ruler canvas context');
    }
  }
    

  private loadMapData(): void {
    this.http.get('assets/land-110m.json').subscribe((data: any) => {
      this.landData = data;
      this.drawMap();
      this.drawUTMZones();
    });
  }


  private drawMap(): void {
    if (!this.landData) return;
  
    // Convert TopoJSON to GeoJSON
    const landGeoJson = feature(this.landData, this.landData.objects.land);
  
    // Draw the land features
    this.context.beginPath();
    this.path.context(this.context)(landGeoJson as any);
    this.context.fillStyle = '#d4e157'; // Light green for land
    this.context.fill();
    this.context.strokeStyle = '#999';
    this.context.stroke();
  }


  private drawUTMZones(): void {
    const zoneWidth = this.canvasWidth / 60; // 60 longitudinal zones
    const zoneHeight = this.canvasHeight / 20; // Approx. 20 latitude bands (C-X)

    for (let i = 0; i < 60; i++) {
      for (let j = 0; j < 20; j++) {
        const x = i * zoneWidth;
        const y = j * zoneHeight;
        const zoneName = `${i + 1}${String.fromCharCode(67 + j)}`; // UTM Zone name e.g., "31N"

        // Draw zone rectangle
        this.context.beginPath();
        this.context.rect(x, y, zoneWidth, zoneHeight);
        this.context.strokeStyle = 'gray';
        this.context.stroke();

        // Label the zone
        this.context.font = '10px Arial';
        this.context.fillStyle = 'black';
        this.context.fillText(zoneName, x + 5, y + 15);
      }
    }
  }

  private drawRulers(): void {
    // Draw horizontal ruler (longitude zones)
    this.horizontalRulerContext.clearRect(0, 0, this.canvasWidth, 50);
    const zoneWidth = this.canvasWidth / 60;
    for (let i = 0; i < 60; i++) {
      const x = i * zoneWidth;
      const label = `${i + 1}`;
      this.horizontalRulerContext.beginPath();
      this.horizontalRulerContext.moveTo(x, 0);
      this.horizontalRulerContext.lineTo(x, 10);
      this.horizontalRulerContext.strokeStyle = 'black';
      this.horizontalRulerContext.stroke();
  
      // Draw zone labels
      this.horizontalRulerContext.font = '10px Arial';
      this.horizontalRulerContext.fillStyle = 'black';
      this.horizontalRulerContext.textAlign = 'center';
      this.horizontalRulerContext.fillText(label, x + zoneWidth / 2, 30);
    }
  
    // Draw vertical ruler (latitude bands)
    this.verticalRulerContext.clearRect(0, 0, 50, this.canvasHeight);
    const zoneHeight = this.canvasHeight / 20;
    for (let j = 0; j < 20; j++) {
      const y = j * zoneHeight;
      const label = String.fromCharCode(67 + j); // Latitude bands C-X
      this.verticalRulerContext.beginPath();
      this.verticalRulerContext.moveTo(40, y);
      this.verticalRulerContext.lineTo(50, y);
      this.verticalRulerContext.strokeStyle = 'black';
      this.verticalRulerContext.stroke();
  
      // Draw zone labels
      this.verticalRulerContext.font = '10px Arial';
      this.verticalRulerContext.fillStyle = 'black';
      this.verticalRulerContext.textAlign = 'right';
      this.verticalRulerContext.fillText(label, 35, y + zoneHeight / 2);
    }
  }
  

  @HostListener('mousemove', ['$event'])
  handleMouseMove(event: MouseEvent): void {
    const { offsetX, offsetY } = event;
    const zoneWidth = this.canvasWidth / 60;
    const zoneHeight = this.canvasHeight / 20;
    const zoneX = Math.floor(offsetX / zoneWidth);
    const zoneY = Math.floor(offsetY / zoneHeight);
    const hoveredZone = `${zoneX + 1}${String.fromCharCode(67 + zoneY)}`;

    if (this.hoveredZone !== hoveredZone) {
      this.hoveredZone = hoveredZone;
      this.highlightZone(zoneX, zoneY);
    }
  }

  private highlightZone(zoneX: number, zoneY: number): void {
    const zoneWidth = this.canvasWidth / 60;
    const zoneHeight = this.canvasHeight / 20;
    const x = zoneX * zoneWidth;
    const y = zoneY * zoneHeight;

    // Redraw map and UTM zones to clear previous highlights
    this.drawMap();
    this.drawUTMZones();

    // Highlight the hovered zone
    this.context.fillStyle = 'rgba(255, 255, 0, 0.3)';
    this.context.fillRect(x, y, zoneWidth, zoneHeight);
  }

  @HostListener('click', ['$event'])
  handleClick(event: MouseEvent): void {
    if (this.hoveredZone) {
      console.log(`Zone ${this.hoveredZone} was selected.`);
      this.zoneSelected.emit(this.hoveredZone);
    }
  }
}

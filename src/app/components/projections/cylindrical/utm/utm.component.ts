import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { zoom, ZoomBehavior } from 'd3-zoom';
import { select } from 'd3-selection';
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
  private projection = geoMercator();
  private path = geoPath(this.projection);
  private canvasWidth = 960;
  private canvasHeight = 500;
  private hoveredZone: string | null = null;
  private landData: any = null;
  private zoom!: ZoomBehavior<Element, unknown>;
  private transform = { k: 1, x: 0, y: 0 };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.setupZoom();
    this.setupCanvases();
    this.loadMapData();
  }

  private setupZoom(): void {
    this.zoom = zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        this.transform = event.transform;
        this.redraw();
      });

    select(this.mapCanvas.nativeElement).call(this.zoom);
  }

  private setupCanvases(): void {
    const mapCanvas = this.mapCanvas.nativeElement;
    const hRuler = this.horizontalRulerCanvas.nativeElement;
    const vRuler = this.verticalRulerCanvas.nativeElement;

    mapCanvas.width = this.canvasWidth;
    mapCanvas.height = this.canvasHeight;
    hRuler.width = this.canvasWidth;
    hRuler.height = 50;
    vRuler.width = 50;
    vRuler.height = this.canvasHeight;

    this.context = mapCanvas.getContext('2d')!;
    this.horizontalRulerContext = hRuler.getContext('2d')!;
    this.verticalRulerContext = vRuler.getContext('2d')!;

    this.projection.scale(this.canvasWidth / 8).translate([this.canvasWidth / 2, this.canvasHeight / 2]);
    this.drawRulers();
  }

  private loadMapData(): void {
    this.http.get('assets/land-110m.json').subscribe(data => {
      this.landData = data;
      this.redraw();
    });
  }

  //  private redraw(): void {
  //    this.context.save();
  //    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  //    this.context.translate(this.transform.x, this.transform.y);
  //    this.context.scale(this.transform.k, this.transform.k);

  //    this.drawMap();
  //    this.drawUTMZones();
  //    this.context.restore();
  //  }

  private drawMap(): void {
    if (!this.landData) return;
    const landGeoJson = feature(this.landData, this.landData.objects.land);
    this.context.beginPath();
    this.path.context(this.context)(landGeoJson as any);
    this.context.fillStyle = '#d4e157';
    this.context.fill();
    this.context.stroke();
  }

  private drawUTMZones(): void {
    const zoneWidth = this.canvasWidth / 60;
    const zoneHeight = this.canvasHeight / 20;

    for (let i = 0; i < 60; i++) {
      for (let j = 0; j < 20; j++) {
        const x = i * zoneWidth;
        const y = j * zoneHeight;
        const zoneName = `${i + 1}${String.fromCharCode(67 + j)}`;

        this.context.beginPath();
        this.context.rect(x, y, zoneWidth, zoneHeight);
        this.context.strokeStyle = 'gray';
        this.context.stroke();

        this.context.font = '10px Arial';
        this.context.fillStyle = 'black';
        this.context.fillText(zoneName, x + 5, y + 15);
      }
    }
  }

  //  private drawRulers(): void {
  //    const zoneWidth = this.canvasWidth / 60;
  //    const zoneHeight = this.canvasHeight / 20;

  //    // Horizontal ruler
  //    this.horizontalRulerContext.clearRect(0, 0, this.canvasWidth, 50);
  //    for (let i = 0; i < 60; i++) {
  //      const x = i * zoneWidth;
  //      this.horizontalRulerContext.beginPath();
  //      this.horizontalRulerContext.moveTo(x, 0);
  //      this.horizontalRulerContext.lineTo(x, 10);
  //      this.horizontalRulerContext.stroke();
  //      this.horizontalRulerContext.fillText(`${i + 1}`, x + zoneWidth / 2, 30);
  //    }

  //    // Vertical ruler
  //    this.verticalRulerContext.clearRect(0, 0, 50, this.canvasHeight);
  //    for (let j = 0; j < 20; j++) {
  //      const y = j * zoneHeight;
  //      this.verticalRulerContext.beginPath();
  //      this.verticalRulerContext.moveTo(40, y);
  //      this.verticalRulerContext.lineTo(50, y);
  //      this.verticalRulerContext.stroke();
  //      this.verticalRulerContext.fillText(String.fromCharCode(67 + j), 35, y + zoneHeight / 2);
  //    }
  //  }

  @HostListener('mousemove', ['$event'])
  handleMouseMove(event: MouseEvent): void {
    const rect = this.mapCanvas.nativeElement.getBoundingClientRect();
    const scaleX = this.canvasWidth / rect.width;
    const scaleY = this.canvasHeight / rect.height;

    const x = ((event.clientX - rect.left) * scaleX - this.transform.x) / this.transform.k;
    const y = ((event.clientY - rect.top) * scaleY - this.transform.y) / this.transform.k;

    const zoneWidth = this.canvasWidth / 60;
    const zoneHeight = this.canvasHeight / 20;
    const zoneX = Math.floor(x / zoneWidth);
    const zoneY = Math.floor(y / zoneHeight);

    if (zoneX >= 0 && zoneX < 60 && zoneY >= 0 && zoneY < 20) {
      const hoveredZone = `${zoneX + 1}${String.fromCharCode(67 + zoneY)}`;
      if (this.hoveredZone !== hoveredZone) {
        this.hoveredZone = hoveredZone;
        this.highlightZone(zoneX, zoneY);
      }
    }
  }

  private highlightZone(zoneX: number, zoneY: number): void {
    this.redraw();
    const zoneWidth = this.canvasWidth / 60;
    const zoneHeight = this.canvasHeight / 20;
    const x = zoneX * zoneWidth;
    const y = zoneY * zoneHeight;

    this.context.save();
    this.context.translate(this.transform.x, this.transform.y);
    this.context.scale(this.transform.k, this.transform.k);
    this.context.fillStyle = 'rgba(255, 255, 0, 0.2)';
    this.context.fillRect(x, y, zoneWidth, zoneHeight);
    this.context.restore();
  }

  @HostListener('click', ['$event'])
  handleClick(event: MouseEvent): void {
    const rect = this.mapCanvas.nativeElement.getBoundingClientRect();
    const scaleX = this.canvasWidth / rect.width;
    const scaleY = this.canvasHeight / rect.height;

    const x = ((event.clientX - rect.left) * scaleX - this.transform.x) / this.transform.k;
    const y = ((event.clientY - rect.top) * scaleY - this.transform.y) / this.transform.k;

    const zoneWidth = this.canvasWidth / 60;
    const zoneHeight = this.canvasHeight / 20;
    const zoneX = Math.floor(x / zoneWidth);
    const zoneY = Math.floor(y / zoneHeight);

    if (zoneX >= 0 && zoneX < 60 && zoneY >= 0 && zoneY < 20) {
      const selectedZone = `${zoneX + 1}${String.fromCharCode(67 + zoneY)}`;
      console.log(`Selected UTM Zone: ${selectedZone}`);
      this.zoneSelected.emit(selectedZone);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.setupCanvases();
    if (this.landData) {
      this.redraw();
    }
  }






  private redraw(): void {
    // Clear and redraw main canvas
    this.context.save();
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context.translate(this.transform.x, this.transform.y);
    this.context.scale(this.transform.k, this.transform.k);

    this.drawMap();
    this.drawUTMZones();
    this.context.restore();

    // Redraw rulers with current transform
    this.drawRulers();
  }

  private drawRulers(): void {
    const zoneWidth = (this.canvasWidth / 60) * this.transform.k;
    const zoneHeight = (this.canvasHeight / 20) * this.transform.k;
    const offsetX = this.transform.x;
    const offsetY = this.transform.y;

    // Horizontal ruler
    this.horizontalRulerContext.clearRect(0, 0, this.canvasWidth, 50);
    for (let i = 0; i < 60; i++) {
      const x = (i * zoneWidth) + offsetX;
      if (x >= 0 && x <= this.canvasWidth) {  // Only draw visible ticks
        this.horizontalRulerContext.beginPath();
        this.horizontalRulerContext.moveTo(x, 0);
        this.horizontalRulerContext.lineTo(x, 10);
        this.horizontalRulerContext.stroke();
        this.horizontalRulerContext.fillText(`${i + 1}`, x + zoneWidth / 2, 30);
      }
    }

    // Vertical ruler
    this.verticalRulerContext.clearRect(0, 0, 50, this.canvasHeight);
    for (let j = 0; j < 20; j++) {
      const y = (j * zoneHeight) + offsetY;
      if (y >= 0 && y <= this.canvasHeight) {  // Only draw visible ticks
        this.verticalRulerContext.beginPath();
        this.verticalRulerContext.moveTo(40, y);
        this.verticalRulerContext.lineTo(50, y);
        this.verticalRulerContext.stroke();
        this.verticalRulerContext.fillText(String.fromCharCode(67 + j), 35, y + zoneHeight / 2);
      }
    }
  }


}
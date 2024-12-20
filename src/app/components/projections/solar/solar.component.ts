
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Topology, GeometryCollection } from 'topojson-specification';
import { GeoPermissibleObjects } from 'd3-geo';  // not from 'd3'
import solar from 'solar-calculator';
import { century, equationOfTime, declination } from 'solar-calculator';

@Component({
  selector: 'app-solar',
  templateUrl: './solar.component.html',
  styleUrls: ['./solar.component.scss']
})
export class SolarComponent implements OnInit, AfterViewInit {
  @ViewChild('mapCanvas') mapCanvas!: ElementRef<HTMLCanvasElement>;

  private context!: CanvasRenderingContext2D;
  private width = 960;
  private height = 480;
  private projection!: d3.GeoProjection;
  private path!: d3.GeoPath;
  //private sphere = { type: "Sphere" };
  private sphere: GeoPermissibleObjects = { type: "Sphere", geometries: [] };
  private world: Topology | null = null;
  public loading = true;

  private zoom = d3.zoom<HTMLCanvasElement, unknown>();
  private transform = d3.zoomIdentity;


  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadWorldData();
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
    this.setupZoom();
  }

  private setupCanvas(): void {
    const canvas = this.mapCanvas.nativeElement;
    this.context = canvas.getContext('2d')!;

    // Handle high DPI displays
    const resolutionScale = window.devicePixelRatio || 1;
    canvas.width = this.width * resolutionScale;
    canvas.height = this.height * resolutionScale;
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    this.context.scale(resolutionScale, resolutionScale);

    // Setup projection and path
    this.projection = d3.geoNaturalEarth1()
      .fitExtent(
        [[0, 0], [this.width, this.height]],
        this.sphere as GeoPermissibleObjects
      );

    this.path = d3.geoPath(this.projection, this.context);
  }

  private setupZoom(): void {
    d3.select(this.mapCanvas.nativeElement)
      .call(this.zoom
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
          this.transform = event.transform;
          this.render();
        }));
  }

  private loadWorldData(): void {
    this.http.get<Topology>('assets/land-50m.json')
      .subscribe({
        next: (world) => {
          this.world = world;
          this.loading = false;  // Hide loading indicator
          this.render();
        },
        error: (error) => {
          console.error('Error loading world map data:', error);
          this.loading = false;  // Hide loading indicator even on error
        }
      });
  }

  private renderGraticule(): void {
    this.context.beginPath();
    this.path(d3.geoGraticule()());
    this.context.strokeStyle = "#ccc";
    this.context.lineWidth = 0.5;
    this.context.stroke();
  }

  private renderLand(): void {
    if (this.world?.objects?.land) {
      const land = topojson.feature(
        this.world,
        this.world.objects.land as GeometryCollection
      );
      this.context.beginPath();
      this.path(land);
      this.context.fillStyle = "#555";
      this.context.fill();
    }
  }

  private renderNightRegion(): void {
    const now = new Date();
    const day = new Date(+now).setUTCHours(0, 0, 0, 0);
    const t = century(now);
    const longitude = (day - +now) / 864e5 * 360 - 180;

    const sun = [
      longitude - equationOfTime(t) / 4,
      declination(t)
    ] as [number, number];

    const antipode = ([lon, lat]: [number, number]): [number, number] =>
      [lon + 180, -lat];

    const night = d3.geoCircle()
      .radius(90)
      .center(antipode(sun))();

    this.context.beginPath();
    this.path(night);
    this.context.fillStyle = "rgba(0, 0, 128, 0.5)";
    this.context.fill();
  }

  private renderSphere(): void {
    this.context.beginPath();
    this.path(this.sphere);
    this.context.strokeStyle = "#000";
    this.context.lineWidth = 1;
    this.context.stroke();
  }

  // private render(): void {
  //   // Use requestAnimationFrame for smoother rendering
  //   requestAnimationFrame(() => {
  //     this.renderGraticule();
  //     requestAnimationFrame(() => {
  //       this.renderLand();
  //       requestAnimationFrame(() => {
  //         this.renderNightRegion();
  //         requestAnimationFrame(() => {
  //           this.renderSphere();
  //         });
  //       });
  //     });
  //   });
  //}


  // // Update render() to use transform:
  // private render(): void {
  //   this.context.save();
  //   this.context.clearRect(0, 0, this.width, this.height);
  //   this.context.translate(this.transform.x, this.transform.y);
  //   this.context.scale(this.transform.k, this.transform.k);

  //   requestAnimationFrame(() => {
  //     this.renderGraticule();
  //     requestAnimationFrame(() => {
  //       this.renderLand();
  //       requestAnimationFrame(() => {
  //         this.renderNightRegion();
  //         requestAnimationFrame(() => {
  //           this.renderSphere();
  //           this.context.restore();
  //         });
  //       });
  //     });
  //   });
  // }

  private render(): void {
    this.context.save();
    this.context.clearRect(0, 0, this.width, this.height);
    
    // Center the zoom
    const tx = (this.width * (1 - this.transform.k)) / 2;
    const ty = (this.height * (1 - this.transform.k)) / 2;
    this.context.translate(tx + this.transform.x, ty + this.transform.y);
    this.context.scale(this.transform.k, this.transform.k);
  
    requestAnimationFrame(() => {
      this.renderGraticule();
      requestAnimationFrame(() => {
        this.renderLand();
        requestAnimationFrame(() => {
          this.renderNightRegion();
          requestAnimationFrame(() => {
            this.renderSphere();
            this.context.restore();
          });
        });
      });
    });
  }

}
// components/abstract-two-point-map.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as d3 from 'd3';
import { AbstractTwoPointProjection } from './models/abstract-two-point-projection';
import { Point } from './models/point.interface';

@Component({ template: '' })
export abstract class AbstractTwoPointMapComponent implements OnInit {
  @ViewChild('mapCanvas', { static: true }) protected canvas!: ElementRef<HTMLCanvasElement>;

  protected width = 960;
  protected height = 600;
  protected context!: CanvasRenderingContext2D;
  protected landFeatures: any;
  protected projection!: AbstractTwoPointProjection;

  protected state$ = new BehaviorSubject<{
    point1: Point;
    point2: Point;
  }>({
    point1: { latitude: 40.7128, longitude: -74.0060 }, // New York
    point2: { latitude: 48.8566, longitude: 2.3522 }    // Paris
  });

  async ngOnInit() {
    await this.setupCanvas();
    await this.loadMapData();
    this.initializeProjection();
    this.setupSubscriptions();
    this.setupDragBehavior();
    this.draw();
  }

  protected async setupCanvas(): Promise<void> {
    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.context = context;

    // Handle high DPI displays
    const scale = window.devicePixelRatio;
    this.canvas.nativeElement.width = this.width * scale;
    this.canvas.nativeElement.height = this.height * scale;
    this.canvas.nativeElement.style.width = this.width + 'px';
    this.canvas.nativeElement.style.height = this.height + 'px';
    this.context.scale(scale, scale);
  }

  protected async loadMapData(): Promise<void> {
    this.landFeatures = await d3.json('/assets/land-110m.json');
  }

  protected abstract initializeProjection(): void;

  protected setupSubscriptions(): void {
    this.state$.subscribe(() => {
      this.updateProjectionPoints();
      this.draw();
    });
  }

  protected setupDragBehavior(): void {
    const canvas = d3.select(this.canvas.nativeElement);
    const dragBehavior = d3.drag()
      .on('drag', (event) => {
        const pos: [number, number] = [event.x, event.y];
        this.handleDrag(pos);
      });

    canvas.call(dragBehavior);
  }

  protected handleDrag(pos: [number, number]): void {
    const coords = this.projection.unproject(pos);
    const currentState = this.state$.value;

    // Determine which point is closer to the drag position
    const point1Pos = this.projection.project(currentState.point1);
    const point2Pos = this.projection.project(currentState.point2);

    const dist1 = Math.hypot(pos[0] - point1Pos[0], pos[1] - point1Pos[1]);
    const dist2 = Math.hypot(pos[0] - point2Pos[0], pos[1] - point2Pos[1]);

    if (dist1 < dist2) {
      this.updatePoint1(coords);
    } else {
      this.updatePoint2(coords);
    }
  }

  protected draw(): void {
    this.context.clearRect(0, 0, this.width, this.height);
    this.drawLand();
    this.drawPoints();
    this.drawGeodesicLine();
  }

  protected drawLand(): void {
    const path = d3.geoPath(this.projection.getProjection(), this.context);
    this.context.beginPath();
    path(this.landFeatures);
    this.context.fillStyle = '#d4d4d4';
    this.context.fill();
  }

  protected drawPoints(): void {
    const state = this.state$.value;
    const point1Pos = this.projection.project(state.point1);
    const point2Pos = this.projection.project(state.point2);

    // Draw drag targets
    this.context.beginPath();
    this.context.arc(point1Pos[0], point1Pos[1], 15, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(128, 0, 128, 0.2)';
    this.context.fill();

    this.context.beginPath();
    this.context.arc(point2Pos[0], point2Pos[1], 15, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(0, 128, 0, 0.2)';
    this.context.fill();

    // Draw actual points
    this.context.beginPath();
    this.context.arc(point1Pos[0], point1Pos[1], 4, 0, 2 * Math.PI);
    this.context.fillStyle = 'purple';
    this.context.fill();

    this.context.beginPath();
    this.context.arc(point2Pos[0], point2Pos[1], 4, 0, 2 * Math.PI);
    this.context.fillStyle = 'green';
    this.context.fill();
  }

  protected drawGeodesicLine(): void {
    const state = this.state$.value;
    const path = d3.geoPath(this.projection.getProjection(), this.context);

    this.context.beginPath();
    path({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [state.point1.longitude, state.point1.latitude],
          [state.point2.longitude, state.point2.latitude]
        ]
      }
    });
    this.context.strokeStyle = '#666';
    this.context.stroke();
  }
  
  protected updateProjectionPoints(): void {
    const state = this.state$.value;
    this.projection.setPoint1(state.point1);
    this.projection.setPoint2(state.point2);
  }

  // Public methods for coordinate updates
  updatePoint1(point: Point): void {
    this.state$.next({
      ...this.state$.value,
      point1: point
    });
  }

  updatePoint2(point: Point): void {
    this.state$.next({
      ...this.state$.value,
      point2: point
    });
  }
}
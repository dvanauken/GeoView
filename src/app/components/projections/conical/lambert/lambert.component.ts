
// lambert-map.model.ts
export interface ParallelState {
  active: boolean;
  value: number;
}

export interface LambertMapState {
  parallel1: ParallelState;
  parallel2: ParallelState;
  centralParallel: number;
}

// lambert-map.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { geoPath, geoLambertConformal, geoGraticule30 } from 'd3-geo-projection';
import { feature } from 'topojson-client';

@Component({
  selector: 'app-lambert-map',
  template: `
    <section class="map-container">
      <canvas #mapCanvas></canvas>
      <div class="controls">
        <fieldset>
          <legend>Standard Parallels</legend>
          <div class="parallel-control">
            <input type="checkbox" id="parallel1Toggle" 
                   [checked]="mapState.parallel1.active"
                   (change)="toggleParallel(1)">
            <input type="number" id="parallel1Value"
                   [value]="mapState.parallel1.value"
                   (input)="updateParallelValue(1, $event)">
          </div>
          <div class="parallel-control">
            <input type="checkbox" id="parallel2Toggle"
                   [checked]="mapState.parallel2.active"
                   (change)="toggleParallel(2)">
            <input type="number" id="parallel2Value"
                   [value]="mapState.parallel2.value"
                   (input)="updateParallelValue(2, $event)">
          </div>
        </fieldset>
        <div class="central-parallel">
          <label for="centralValue">Central Parallel</label>
          <input type="number" id="centralValue"
                 [value]="mapState.centralParallel"
                 (input)="updateCentralParallel($event)">
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
    
    .map-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    canvas {
      width: 100%;
      height: 100%;
    }
    
    .controls {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: white;
      padding: 1rem;
      border-radius: 4px;
    }
    
    .parallel-control {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    input[type="number"] {
      width: 5rem;
    }
  `]
})
export class LambertMapComponent implements OnInit {
  @ViewChild('mapCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private width = 800;
  private height = 600;
  private land: any; // TopoJSON data
  private isDragging = false;
  private dragTarget: 'parallel1' | 'parallel2' | 'central' | null = null;

  mapState: LambertMapState = {
    parallel1: { active: true, value: 30 },
    parallel2: { active: true, value: 60 },
    centralParallel: 0
  };

  constructor() {}

  async ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.setupCanvas();
    await this.loadData();
    this.setupEventListeners();
    this.draw();
  }

  private async loadData() {
    const response = await fetch('/assets/land-110m.json');
    const topology = await response.json();
    this.land = feature(topology, topology.objects.land);
  }

  private setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.nativeElement.width = this.width * dpr;
    this.canvas.nativeElement.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  private setupEventListeners() {
    const canvas = this.canvas.nativeElement;
    
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      
      // Determine what's being dragged based on proximity to lines
      this.dragTarget = this.getDragTarget(y);
      if (this.dragTarget) {
        this.isDragging = true;
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.dragTarget) {
        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        this.updateFromDrag(y);
      }
    });

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.dragTarget = null;
    });
  }

  private getDragTarget(y: number): 'parallel1' | 'parallel2' | 'central' | null {
    // Convert y coordinate to latitude and check proximity to lines
    // This is a simplified version - you'll need to add proper conversion
    return null; // TODO: Implement proper hit detection
  }

  private updateFromDrag(y: number) {
    if (!this.dragTarget) return;

    // Convert y coordinate to latitude
    const latitude = this.yToLatitude(y);

    switch (this.dragTarget) {
      case 'parallel1':
        if (this.mapState.parallel1.active) {
          this.mapState.parallel1.value = latitude;
        }
        break;
      case 'parallel2':
        if (this.mapState.parallel2.active) {
          this.mapState.parallel2.value = latitude;
        }
        break;
      case 'central':
        this.mapState.centralParallel = latitude;
        break;
    }

    this.draw();
  }

  private yToLatitude(y: number): number {
    // Convert y coordinate to latitude
    // This is a simplified version - you'll need to add proper conversion
    return (this.height - y) / this.height * 180 - 90;
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const projection = geoLambertConformal()
      .center([0, this.mapState.centralParallel])
      .parallels(this.getActiveParallels())
      .fitSize([this.width, this.height], this.land);

    const path = geoPath(projection, this.ctx);

    // Draw graticule
    const graticule = geoGraticule30();
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#ccc';
    path(graticule);
    this.ctx.stroke();

    // Draw land
    this.ctx.beginPath();
    this.ctx.fillStyle = '#d4d4d4';
    path(this.land);
    this.ctx.fill();

    // Draw parallels
    this.drawParallels(path);
  }

  private drawParallels(path: any) {
    // Draw central parallel
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'purple';
    path({
      type: 'LineString',
      coordinates: [[-180, this.mapState.centralParallel], [180, this.mapState.centralParallel]]
    });
    this.ctx.stroke();

    // Draw standard parallels if active
    if (this.mapState.parallel1.active) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = 'green';
      path({
        type: 'LineString',
        coordinates: [[-180, this.mapState.parallel1.value], [180, this.mapState.parallel1.value]]
      });
      this.ctx.stroke();
    }

    if (this.mapState.parallel2.active) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = 'blue';
      path({
        type: 'LineString',
        coordinates: [[-180, this.mapState.parallel2.value], [180, this.mapState.parallel2.value]]
      });
      this.ctx.stroke();
    }
  }

  private getActiveParallels(): number[] {
    const parallels: number[] = [];
    if (this.mapState.parallel1.active) parallels.push(this.mapState.parallel1.value);
    if (this.mapState.parallel2.active) parallels.push(this.mapState.parallel2.value);
    return parallels;
  }

  toggleParallel(num: 1 | 2) {
    const parallel = num === 1 ? 'parallel1' : 'parallel2';
    this.mapState[parallel].active = !this.mapState[parallel].active;
    this.draw();
  }

  updateParallelValue(num: 1 | 2, event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    const parallel = num === 1 ? 'parallel1' : 'parallel2';
    this.mapState[parallel].value = value;
    this.draw();
  }

  updateCentralParallel(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.mapState.centralParallel = value;
    this.draw();
  }
}
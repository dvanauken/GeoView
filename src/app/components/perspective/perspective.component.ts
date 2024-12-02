import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Perspective from './Perspective';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { geoSatellite } from 'd3-geo-projection';


@Component({
  selector: 'app-perspective',
  templateUrl: './perspective.component.html',
  styleUrls: ['./perspective.component.scss']
})
export class PerspectiveComponent implements OnInit, AfterViewInit {
  @ViewChild('mapCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;
  private width!: number;
  private perspective!: Perspective;

   ngOnInit() {
  //   this.width = window.innerWidth * 0.8; // Add this
  //   this.initializePerspective();
   }

  // ngAfterViewInit() {
  //   // Move canvas setup here
  //   this.setupCanvas();
  //   this.setupControls();
  // }

  ngAfterViewInit() {
    this.setupCanvas();         // First set up canvas and get width
    this.setupControls();       // Set up controls
    this.initializePerspective(); // Then initialize perspective which needs canvas width
}

  private setupCanvas(): void {
    const canvas = this.canvas.nativeElement;
    this.width = window.innerWidth * 0.8;
    canvas.width = this.width;
    canvas.height = this.width * 0.6;
    this.context = canvas.getContext('2d')!;
  }

  private async initializePerspective(): Promise<void> {
    this.perspective = new Perspective();
    await this.perspective.init(this.width);
    this.updateView();
  }

  private setupControls(): void {
    document.querySelectorAll('input[type="range"]').forEach(input => {
      input.addEventListener('input', this.handleInput.bind(this));
    });

    this.canvas.nativeElement.addEventListener('mousedown', () => {
      this.perspective?.setResolution(false);
      this.updateView();
    });

    this.canvas.nativeElement.addEventListener('mouseup', () => {
      this.perspective?.setResolution(true);
      this.updateView();
    });
  }

  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    const name = input.name;
    let displayValue = value;

    if (name === 'altitude') {
      displayValue = Math.pow(2, value);
      input.nextElementSibling!.textContent = `${displayValue.toFixed(0)} km`;
    } else {
      input.nextElementSibling!.textContent = 
        `${value.toFixed(name === 'longitude' || name === 'latitude' ? 2 : 0)}°`;
    }

    if (this.perspective) {
      const params: {[key: string]: number} = {};
      params[name] = name === 'altitude' ? Math.pow(2, value) : value;
      this.perspective.updateParams(params);
      this.updateView();
    }
  }

  private updateView(): void {
    if (this.perspective) {
      this.perspective.draw(this.context);
    }
  }
}
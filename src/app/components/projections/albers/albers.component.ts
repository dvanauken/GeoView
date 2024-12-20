import { Component, OnInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

@Component({
  selector: 'app-albers',
  templateUrl: './albers.component.html',
  styleUrls: ['./albers.component.scss']
})
export class AlbersComponent implements OnInit {
  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Create the SVG container
    const svg = d3.select(this.elementRef.nativeElement.querySelector('#map-container'))
      .append('svg')
      .attr('viewBox', '0 0 975 610')
      .attr('width', '100%')
      .attr('height', '100%');

    // Create path generator
    const path = d3.geoPath();

    // Create group for map features
    const g = svg.append('g');

    // Load and render TopoJSON data
    fetch('/assets/counties-albers-110m.json')
      .then(response => response.json())
      .then(us => {
        // Add county boundaries
        g.append('path')
          .attr('class', 'county-boundaries')
          .attr('d', path(topojson.mesh(us, us.objects.counties, (a: any, b: any) => 
            a !== b && (Math.floor(a.id / 1000) === Math.floor(b.id / 1000))
          )));

        // Add state boundaries
        g.append('path')
          .attr('class', 'state-boundaries')
          .attr('d', path(topojson.mesh(us, us.objects.states, (a: any, b: any) => a !== b)));

        // Add nation boundary
        g.append('path')
          .attr('class', 'nation-boundary')
          .attr('d', path(topojson.feature(us, us.objects.nation)));
      })
      .catch(error => {
        console.error('Error loading the map data:', error);
      });
  }

  private createAlbersUsaProjection() {
    return d3.geoAlbersUsa()
      .scale(1300)
      .translate([487.5, 305]);
  }
}

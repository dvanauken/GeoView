import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Topology, Objects, GeometryCollection } from 'topojson-specification';

interface StateConfig {
  code: string;
}

@Component({
  selector: 'app-albers',
  templateUrl: './albers.component.html',
  styleUrls: ['./albers.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AlbersComponent implements OnInit {
  private readonly states: StateConfig[] = [
    { code: 'al' }, { code: 'ak' }, { code: 'az' }, { code: 'ar' }, { code: 'ca' },
    { code: 'co' }, { code: 'ct' }, { code: 'de' }, { code: 'fl' }, { code: 'ga' },
    { code: 'hi' }, { code: 'id' }, { code: 'il' }, { code: 'in' }, { code: 'ia' },
    { code: 'ks' }, { code: 'ky' }, { code: 'la' }, { code: 'me' }, { code: 'md' },
    { code: 'ma' }, { code: 'mi' }, { code: 'mn' }, { code: 'ms' }, { code: 'mo' },
    { code: 'mt' }, { code: 'ne' }, { code: 'nv' }, { code: 'nh' }, { code: 'nj' },
    { code: 'nm' }, { code: 'ny' }, { code: 'nc' }, { code: 'nd' }, { code: 'oh' },
    { code: 'ok' }, { code: 'or' }, { code: 'pa' }, { code: 'ri' }, { code: 'sc' },
    { code: 'sd' }, { code: 'tn' }, { code: 'tx' }, { code: 'ut' }, { code: 'vt' },
    { code: 'va' }, { code: 'wa' }, { code: 'wv' }, { code: 'wi' }, { code: 'wy' }
   ];

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    const host = this.elementRef.nativeElement;
    const svg = d3.select(host.querySelector('#map-container'))
      .append('svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('viewBox', '0 0 975 610')
      .attr('width', '100%')
      .attr('height', '100%');

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const projection = d3.geoAlbersUsa()
      .scale(1300)
      .translate([487.5, 305]);

    const path = d3.geoPath(projection);
    const g = svg.append('g');

    Promise.all(
      this.states.map(state =>
        fetch(`/assets/congress-3/us-districts-${state.code}-119.topojson`)
          .then(response => response.json())
      )
    ).then(districts => {
      const features = districts.flatMap(district =>
        topojson.feature(district, district.objects.data as GeometryCollection).features
      );

      g.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('class', 'district-boundaries')
        .attr('d', path)
        .style('vector-effect', 'non-scaling-stroke') // This prevents stroke width scaling
        .on('click', (event, d) => {
          console.log('District Properties:');
          Object.entries(d.properties).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
          });
        });
    }).catch(error => {
      console.error('Error loading the map data:', error);
    });
  }
}
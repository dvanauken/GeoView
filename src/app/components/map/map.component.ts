import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { DataModel } from '../../models/data-model';
import { Subscription } from 'rxjs';
import { ProjectionType } from '../../enums/projection-type.enum';
import { MatTableDataSource } from '@angular/material/table';

interface StatisticsElement {
  airportCode: string;
  count: number;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private gSphere: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gCountries: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gRoutes: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gAirports: d3.Selection<SVGGElement, unknown, null, undefined>;
  private projection: d3.GeoProjection;
  private path: d3.GeoPath;
  private resizeObserver: ResizeObserver;
  private subscription: Subscription;
  private zoom: d3.ZoomBehavior<Element, unknown>;
  private projectionType: ProjectionType = ProjectionType.Orthographic;
  statisticsData: StatisticsElement[] = [];

  constructor() {}

  ngOnInit(): void {
    console.log('MapComponent ngOnInit called.');
    this.initMap();
    this.subscription = DataModel.getInstance().getSelectedFeatures().subscribe(features => {
      console.log('MapComponent received updated features:', features);
      this.updateMapSelection(features);
    });
  }

  ngAfterViewInit(): void {
    console.log('MapComponent ngAfterViewInit called. Ready for interaction.');
    this.resizeObserver = new ResizeObserver(() => this.resizeMap());
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.subscription.unsubscribe();
  }

  private initMap(): void {
    console.log('Initializing map.');
    this.setupSVG();
    this.setProjection(this.projectionType);

    // Draw the spherical background
    this.path = d3.geoPath().projection(this.projection); // Define the path generator with the set projection
    this.gSphere.append("path")
      .datum({ type: "Sphere" })
      .attr("class", "sphere")
      .attr("d", this.path)
      .style('fill', '#f5f5f5 ') // Optional: Add fill style for the sphere background
      .style('stroke', '#000'); // Optional: Add stroke style for the boundary of the sphere

    this.applyZoom();
    this.addLayers();

     this.addAirports();  // Function to add airports

    this.resizeMap();
  }

  private setupSVG(): void {
    console.log('Setting up SVG elements.');
    const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
    const height = this.mapContainer.nativeElement.offsetHeight * 0.95;

    this.svg = d3.select(this.mapContainer.nativeElement).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Separate groups for different layers
    this.gSphere = this.svg.append('g').attr('class', 'sphere-layer');
    this.gCountries = this.svg.append('g').attr('class', 'countries-layer');
    this.gRoutes = this.svg.append('g').attr('class', 'routes-layer');
    this.gAirports = this.svg.append('g').attr('class', 'airports-layer');
  }

  private setProjection(type: ProjectionType): void {
    console.log('Setting projection:', type);
    const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
    const height = this.mapContainer.nativeElement.offsetHeight * 0.95;
    const translate: [number, number] = [width / 2, height / 2];

    const projection = d3['geoOrthographic']()
      .translate(translate)
      .center([-75, -30])
      .rotate([75, -10, 0]);

    if ('parallels' in projection) {
      console.log('Setting parallels for projection.');
      (projection as d3.GeoConicProjection).parallels([30.5, 45.5]);
    }

    this.projection = projection;
    this.path = d3.geoPath().projection(this.projection);
  }

  private applyZoom(): void {
    console.log('Applying zoom behavior to the map.');
    this.svg.call(
      d3.zoom()
        .scaleExtent([1, 50])
        .on('zoom', (event) => {
          console.log('Zoom event triggered:', event.transform);
          this.gSphere.attr('transform', event.transform);
          this.gCountries.attr('transform', event.transform);
          this.gRoutes.attr('transform', event.transform);
          this.gAirports.attr('transform', event.transform);
          this.svg.selectAll('path').attr('vector-effect', 'non-scaling-stroke'); // Ensure stroke width is constant
        })
    );
  }

  private addLayers(): void {
    console.log('Adding layers to the map.');
    const layerNames = DataModel.getInstance().getLayerNames();
    const uniqueAirports = new Set<string>();

    layerNames.forEach(layerName => {
      console.log(`Processing layer: ${layerName}`);
      const layer = DataModel.getInstance().getLayer(layerName);
      if (layer && layer.features) {
        if (layerName === 'countries') {
          // Add geography features
          console.log(`Adding countries layer with ${layer.features.length} features.`);
          this.gCountries.selectAll('path')
            .data(layer.features, (d: any) => d.id)
            .enter().append('path')
            .attr("class", d => `${d.geometry.type.toLowerCase()} country`)
            .attr('d', this.path)
            .style('fill', '#cccccc'); // Optional: Add some styling for geography
        } else if (layerName === 'routes') {
          // Add route features
          console.log(`Adding routes layer with ${layer.features.length} features.`);
          this.gRoutes.selectAll('path')
            .data(layer.features, (d: any) => d.id)
            .enter().append('path')
            .attr("class", d => `${d.geometry.type.toLowerCase()} route`)
            .attr('d', this.path)
            .style('stroke', '#ff0000') // Optional: Add styling for routes
            .style('stroke-width', 0.5)
            .style('fill', 'none')
            .on('click', (event, feature) => {
              console.log('Clicked feature ID:', feature.id);
              this.selectFeature(event, feature);
            })
            .style('cursor', 'pointer');

          // Collect unique airports from the routes
layer.features.forEach((feature: any) => {
  console.log('Processing route feature:', feature);
  if (feature.properties && feature.properties.Base && feature.properties.Ref) {
    uniqueAirports.add(feature.properties.Base);
    uniqueAirports.add(feature.properties.Ref);
  } else {
    console.error('Route feature is missing Base or Ref airport:', feature);
  }
});
        }
      }
    });

//     // Add airport circles and labels
//     console.log('Adding airport circles and labels.');
//     uniqueAirports.forEach((airportCode: string) => {
//       console.log('Processing airport:', airportCode);
//       const airport = DataModel.getInstance().getAirportDetails(airportCode);
//       if (airport) {
//         console.log('Adding airport circle and label for:', airportCode);
//         // Add airport circles
//         const projectedCoords = this.projection([airport.lon, airport.lat]);
//         if (projectedCoords && !isNaN(projectedCoords[0]) && !isNaN(projectedCoords[1])) {
//           console.log('Projected coordinates:', projectedCoords);
//           this.gAirports.append('circle')
//             .attr('class', 'airport-circle')
//             .attr('cx', projectedCoords[0])
//             .attr('cy', projectedCoords[1])
//             .attr('r', 5)
//             .style('fill', 'blue');
//
//           // Add airport labels
//           this.gAirports.append('text')
//             .attr('class', 'airport-label')
//             .attr('x', projectedCoords[0] + 5) // Offset for better visibility
//             .attr('y', projectedCoords[1])
//             .text(airportCode)
//             .style('font-size', '14px')
//             .style('fill', 'black')
//             .attr('vector-effect', 'non-scaling-stroke'); // Ensure text remains constant size
//         } else {
//           console.error('Failed to project coordinates for airport:', airportCode);
//         }
//       } else {
//         console.error('Airport details not found for:', airportCode);
//       }
//     });


 }

  public resizeMap(): void {
    console.log('Resizing map.');
    if (this.mapContainer && this.svg) {
      const containerWidth = this.mapContainer.nativeElement.offsetWidth;
      const containerHeight = this.mapContainer.nativeElement.offsetHeight;
      const width = containerWidth * 0.95;
      const height = containerHeight * 0.95;

      this.svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
      this.projection.fitSize([width, height], { type: 'FeatureCollection', features: DataModel.getInstance().getAllFeatures() });
      this.svg.selectAll('path').attr('d', this.path);
    }
  }

  private selectFeature(event: MouseEvent, feature: Feature): void {
    console.log('Selecting feature:', feature);
    if (feature.id) {
      DataModel.getInstance().setSelectedFeatures([feature]);
      console.log('Selected feature set in DataModel:', feature.id);
    } else {
      console.error('Feature ID is undefined, cannot select');
    }
  }

  private updateMapSelection(features: Feature[] | null): void {
    console.log('Updating map selection with features:', features);
    this.gRoutes.selectAll('.selected').classed('selected', false); // Deselect previous selected routes
    if (features) {
      features.forEach(feature => {
        console.log('Selecting route feature on map:', feature.id);
        this.gRoutes.selectAll('path')
          .filter((d: Feature) => d.id === feature.id)
          .classed('selected', true);
      });
    }
  }


private addAirports(): void {
  // Gather unique airport codes. Replace this with your actual way of fetching airport codes
  const layerNames = DataModel.getInstance().getLayerNames();
  const uniqueAirports = new Set<string>();

  layerNames.forEach(layerName => {
    const layer = DataModel.getInstance().getLayer(layerName);
    if (layer && layer.features) {
      if (layerName === 'routes') {
        layer.features.forEach((feature: any) => {
          if (feature.properties && feature.properties.Base && feature.properties.Ref) {
            uniqueAirports.add(feature.properties.Base);
            uniqueAirports.add(feature.properties.Ref);
          }
        });
      }
    }
  });

  // Now proceed to project and draw airports
  uniqueAirports.forEach((airportCode: string) => {
    const airport = DataModel.getInstance().getAirportDetails(airportCode);
    if (airport) {
      const projectedCoords = this.projection([airport.lon, airport.lat]);
      if (projectedCoords && !isNaN(projectedCoords[0]) && !isNaN(projectedCoords[1])) {
        this.gAirports.append('circle')
          .attr('class', 'airport-circle')
          .attr('cx', projectedCoords[0])
          .attr('cy', projectedCoords[1])
          .attr('r', 5)
          .style('fill', 'blue');

        this.gAirports.append('text')
          .attr('class', 'airport-label')
          .attr('x', projectedCoords[0] + 5) // Offset for better visibility
          .attr('y', projectedCoords[1])
          .text(airportCode)
          .style('font-size', '14px')
          .style('fill', 'black');
      } else {
        console.error('Failed to project coordinates for airport:', airportCode);
      }
    } else {
      console.error('Airport details not found for:', airportCode);
    }
  });
}

}

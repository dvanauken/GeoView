import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { Feature, FeatureCollection, Geometry, GeometryObject } from 'geojson';
import { Subscription } from 'rxjs';
import { ProjectionType } from '../../enums/projection-type.enum';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../../services/data.service';
import { throttle } from 'lodash';
import { GlobeDragHandler } from "./globe-drag-handler";
import { GlobeKeyboardHandler } from './globe-keyboard-handler';
import verticalPerspective from './vertical-perspective';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private gSphere: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gGraticule: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gCountries: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gRoutes: d3.Selection<SVGGElement, unknown, null, undefined>;
  private gAirports: d3.Selection<SVGGElement, unknown, null, undefined>;
  //private projection: d3.GeoProjection;
  private projection = verticalPerspective()
    //.distance(2.5)  // Adjust perspective height
    .center([0, 0]) // Set center coordinates
    .scale(250);    // Adjust scale

  private path: d3.GeoPath;
  private resizeObserver: ResizeObserver;
  private subscription: Subscription;
  private zoom: d3.ZoomBehavior<Element, unknown>;
  private projectionType: ProjectionType = ProjectionType.Orthographic;
  private dragHandler: GlobeDragHandler;
  private currentZoomScale: number = 1;
  private renderedAirports: Set<string> = new Set();
  private keyboardHandler: GlobeKeyboardHandler;

  constructor(private dataService: DataService) {
  }

  ngOnInit(): void {
    console.log('MapComponent ngOnInit called.');
    this.initMap();
    this.subscription = this.dataService.getSelectedFeatures().subscribe(features => {
      console.log('MapComponent received updated features:', features);
      this.updateMapSelection(features);
      this.updateLayers();
    });
  }

  ngAfterViewInit(): void {
    console.log('MapComponent ngAfterViewInit called. Ready for interaction.');
    this.resizeObserver = new ResizeObserver(() => this.resizeMap());
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  // Add a method to handle zoom changes
  private applyZoomChange(zoomFactor: number): void {
    this.zoom.scaleBy(this.svg, zoomFactor);
  }

  private updateMap(): void {
    console.log('Updating the map based on new rotations or changes.');
    // Re-render or refresh any D3 map layers as necessary
    this.gSphere.selectAll('path').attr('d', this.path);
    this.gGraticule.selectAll('path').attr('d', this.path);
    this.gCountries.selectAll('path').attr('d', this.path);
    this.gRoutes.selectAll('path').attr('d', this.path);
    this.updateAirportPositions();
  }

  private setupSVG(): void {
    console.log('Setting up SVG elements.');
    const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
    const height = this.mapContainer.nativeElement.offsetHeight * 0.95;

    // Clear any existing SVG
    d3.select(this.mapContainer.nativeElement).selectAll('svg').remove();

    this.svg = d3.select(this.mapContainer.nativeElement).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create groups in correct order (bottom to top)
    this.gSphere = this.svg.append('g').attr('class', 'sphere-layer');
    this.gGraticule = this.svg.append('g').attr('class', 'graticule-layer');
    this.gCountries = this.svg.append('g').attr('class', 'countries-layer');
    this.gRoutes = this.svg.append('g').attr('class', 'routes-layer');
    this.gAirports = this.svg.append('g').attr('class', 'airports-layer');
  }

  private initMap(): void {
    console.log('Initializing map.');
    this.setupSVG();
    this.setProjection(this.projectionType);

    this.path = d3.geoPath().projection(this.projection);

    // Add the base sphere with subtle color
    this.gSphere.append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'sphere')
      .attr('d', this.path);

    // Add graticule
    const graticule = d3.geoGraticule();
    this.gGraticule.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', this.path)

    // Now add other layers
    this.updateLayers();
    this.applyZoom();
    this.resizeMap();
  }

  private setProjection(type: ProjectionType): void {
    console.log('Setting projection:', type);
    const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
    const height = this.mapContainer.nativeElement.offsetHeight * 0.95;

    // this.projection = d3.geoOrthographic()
    //   .scale(Math.min(width, height) / 2.5)
    //   .translate([width / 2, height / 2])
    //   .center([0, 0])
    //   .rotate([74, -30, 0])
    //   .clipAngle(90);

    // this.projection = verticalPerspective()
    // .distance(1.025)  // Perspective height
    // .center([-74, 41.5]) // Center coordinates
    // .tilt(55)  // Tilt angle
    // .azimuth(210)  // Azimuth angle
    // .scale(250)
    // .clipAngle(90); // Adjust this value to control view extent
      
    // this.projection = verticalPerspective()
    // .distance(1.025)  // 160km above surface
    // //.center([-74, 41.5]) // Center on Newburgh, NY
    // .tilt(55)  // Matching Snyder's example
    // .azimuth(210)
    // .scale(Math.min(width, height) / 2.5)
    // .translate([width / 2, height / 2])
    // ;


    // this.projection = verticalPerspective()
    // .distance(1.025)  // 160km above surface, check if implemented
    // .center([-74, 41.5]) // Ensure these are used if your custom projection supports it
    // .tilt(55)  // Check if the tilt is applied as expected
    // .azimuth(210)  // Ensure azimuth is correctly factored in
    // .scale(Math.min(width, height) / 2.5)
    // .translate([width / 2, height / 2]);


    this.projection = verticalPerspective()
      .distance(1.025)  // 160km above surface, check if implemented
      .center([-74, 41.5]) // Ensure these are used if your custom projection supports it
      .tilt(55)  // Check if the tilt is applied as expected
      .azimuth(210)  // Ensure azimuth is correctly factored in
      .scale(Math.min(width, height) / 2.5)
      .translate([width / 2, height / 2]);


    this.path = d3.geoPath().projection(this.projection);
  }

  private updateLayers(): void {
    console.log('Updating layers on the map.');
    const layerNames = this.dataService.getLayerNames();
    layerNames.forEach(layerName => {
      console.log(`Processing layer: ${layerName}`);
      const layer = this.dataService.getLayer(layerName);
      if (layer && layer.getFeatures()) {
        if (layerName === 'countries') {
          this.updateCountriesLayer(layer.getFeatures());
        } else if (layerName === 'routes' || layerName.toUpperCase() === 'PA') {
          this.updateRoutesLayer(layerName, layer.getFeatures());
          this.updateAirportsForRoutes(layer.getFeatures());
        }
      }
    });
  }

  private updateCountriesLayer(features: Feature[]): void {
    this.gCountries.selectAll('path')
      .data(features)
      .join(
        enter => enter.append('path')
          .attr('class', (d: Feature) => `${d.geometry.type.toLowerCase()} country`)
          .attr('d', this.path)
          .style('fill', '#cccccc')
          .style('stroke', '#666666')
          .style('stroke-width', '0.5px'),
        update => update.attr('d', this.path),
        exit => exit.remove()
      );
  }

  private updateRoutesLayer(layerName: string, features: Feature[]): void {
    this.gRoutes.selectAll(`path.${layerName}`)
      .data(features, (d: Feature) => d.id)
      .join(
        enter => enter.append('path')
          .attr('class', (d: Feature) => `${d.geometry.type.toLowerCase()} ${layerName}`)
          .attr('d', this.path)
          .on('click', (event: MouseEvent, feature: Feature<Geometry, { [name: string]: any }>) =>
            this.selectFeature(event, feature)
          )
          .style('cursor', 'pointer'),
        update => update.attr('d', this.path),
        exit => exit.remove()
      );
  }

  private updateAirportsForRoutes(features: Feature[]): void {
    const airportsToAdd = new Set<string>();

    // Collect all unique airports from the features
    features.forEach((feature: any) => {
      if (feature.properties && feature.properties.base && feature.properties.ref) {
        airportsToAdd.add(feature.properties.base);
        airportsToAdd.add(feature.properties.ref);
      }
    });

    // Only add airports that haven't been rendered yet
    airportsToAdd.forEach(airportCode => {
      if (!this.renderedAirports.has(airportCode)) {
        this.addAirport(airportCode);
        this.renderedAirports.add(airportCode);
      }
    });
  }


  private addAirport(airportCode: string): void {
    const airport = this.dataService.getAirport(airportCode);
    if (!airport) return;

    const lon = Number(airport.lon);
    const lat = Number(airport.lat);

    if (isNaN(lon) || isNaN(lat)) return;

    const coords: [number, number] = [lon, lat];
    const projectedCoords = this.projection(coords as [number, number]);

    if (!projectedCoords || isNaN(projectedCoords[0]) || isNaN(projectedCoords[1])) return;

    // Add airport circle
    this.gAirports.append('circle')
      .attr('class', 'airport-circle')
      .attr('cx', projectedCoords[0])
      .attr('cy', projectedCoords[1])
      .attr('r', 1)
      .style('fill', '#add8e6')
      .style('stroke', 'blue')
      .style('stroke-width', '2px')
      .attr('data-airport', airportCode)
      .attr('vector-effect', 'non-scaling-stroke');

    // Add single text label with consistent styling
    this.gAirports.append('text')
      .attr('class', 'airport-label')
      .attr('x', projectedCoords[0] + 7)
      .attr('y', projectedCoords[1] + 3)
      .text(airportCode)
      .style('font-size', '12px')
      .style('fill', 'blue')
      .style('stroke', 'none')
      .attr('data-airport', airportCode)
      .attr('vector-effect', 'non-scaling-stroke');
  }

  private updateAirportPositions(): void {
    const zoomScale = this.currentZoomScale ? 1 / this.currentZoomScale : 1;

    this.gAirports.selectAll('.airport-circle, .airport-label').each((d: any, i, nodes) => {
      const element = d3.select(nodes[i]);
      const airportCode = element.attr('data-airport');
      const airport = this.dataService.getAirport(airportCode);

      if (airport) {
        const coords: [number, number] = [Number(airport.lon), Number(airport.lat)];
        const visible = d3.geoDistance(coords, [-this.projection.rotate()[0], -this.projection.rotate()[1]] as [number, number]) < Math.PI / 2;

        if (visible) {
          const projectedCoords = this.projection(coords as [number, number]);

          if (projectedCoords && !isNaN(projectedCoords[0]) && !isNaN(projectedCoords[1])) {
            if (element.classed('airport-circle')) {
              element
                .attr('cx', projectedCoords[0])
                .attr('cy', projectedCoords[1])
                .attr('r', 5 * zoomScale)
                .style('display', 'block');
            } else {
              element
                .attr('x', projectedCoords[0] + 7 * zoomScale)
                .attr('y', projectedCoords[1] + 3 * zoomScale)
                .style('font-size', `${12 * zoomScale}px`)
                .style('display', 'block');
            }
          }
        } else {
          element.style('display', 'none');
        }
      }
    });

    this.svg.selectAll('.airport-geometry').attr('vector-effect', 'non-scaling-stroke');
  }

  public resizeMap(): void {
    console.log('Resizing map.');
    if (this.mapContainer && this.svg) {
      const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
      const height = this.mapContainer.nativeElement.offsetHeight * 0.95;

      this.svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

      this.projection
        .scale(Math.min(width, height) / 2.5)
        .translate([width / 2, height / 2]);

      // Update all paths and positions
      this.gSphere.selectAll('path').attr('d', this.path);
      this.gGraticule.selectAll('path').attr('d', this.path);
      this.gCountries.selectAll('path').attr('d', this.path);
      this.gRoutes.selectAll('path').attr('d', this.path);
      this.updateAirportPositions();
    }
  }

  private selectFeature(event: MouseEvent, feature: Feature): void {
    console.log('Selecting feature:', feature);
    if (feature.id) {
      this.dataService.setSelectedFeatures([feature]);
      console.log('Selected feature set in DataModel:', feature.id);
    } else {
      console.error('Feature ID is undefined, cannot select');
    }
  }

  private updateMapSelection(features: Feature[] | null): void {
    this.gRoutes.selectAll('.selected').classed('selected', false);
    if (features && features.length) {
      features.forEach(feature => {
        if (feature.id) {
          this.gRoutes.selectAll('path')
            .filter((d: any) => d.id === feature.id)
            .classed('selected', true)
            .raise();
        }
      });
    }
  }

  private applyZoom(): void {
    console.log('Applying zoom behavior to the map.');

    this.dragHandler = new GlobeDragHandler(
      this.projection,
      () => {
        this.gSphere.selectAll('path').attr('d', this.path);
        this.gGraticule.selectAll('path').attr('d', this.path);
        this.gCountries.selectAll('path').attr('d', this.path);
        this.gRoutes.selectAll('path').attr('d', this.path);
        this.updateAirportPositions();
      }
    );

    this.dragHandler.attachDragBehavior(this.gSphere.select('.sphere'));
    //this.dragHandler.attachDragBehavior(this.gSphere.select('*'));

    this.zoom = d3.zoom()
      .scaleExtent([1, 32])
      .on('zoom', (event) => {
        const { transform } = event;
        const scaleTransformString = `translate(${transform.x}, ${transform.y}) scale(${transform.k})`;
        this.gSphere.attr('transform', scaleTransformString);
        this.gGraticule.attr('transform', scaleTransformString);
        this.gCountries.attr('transform', scaleTransformString);
        this.gRoutes.attr('transform', scaleTransformString);
        this.gAirports.attr('transform', scaleTransformString);
        this.svg.selectAll('path').attr('vector-effect', 'non-scaling-stroke');
        this.currentZoomScale = event.transform.k;
        this.updateAirportPositions();
      });
    this.svg.call(this.zoom);
  }






  ngOnDestroy(): void {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.subscription) this.subscription.unsubscribe();
    if (this.dragHandler) this.dragHandler.destroy();
    if (this.keyboardHandler) this.keyboardHandler.removeEventListener(); // Access property here
  }






}

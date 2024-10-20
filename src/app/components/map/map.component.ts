import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import {Feature, FeatureCollection, GeometryObject} from 'geojson';
import { DataModel } from '../../models/data-model';  // Ensure correct import path
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private projection: d3.GeoProjection;
  private path: d3.GeoPath;
  private resizeObserver: ResizeObserver;
  private subscription: Subscription;
  private zoom: d3.ZoomBehavior<Element, unknown>;

  constructor() {}

  ngOnInit(): void {
    this.initMap();  // Initialize the map first
    this.subscription = DataModel.getInstance().getSelectedFeatures().subscribe(features => {
      console.log('Received features to update selection:', features);
      this.updateMapSelection(features);
    });
    // Uncomment below to test with a static feature after ensuring data loading is correct
    // this.testFeatureSelection();
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      console.log('Map container resized.');
      this.resizeMap();
    });
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.subscription.unsubscribe(); // Properly clean up the subscription
  }

  private updateMapSelection(features: Feature[] | null): void {
    console.log('Updating map selection for features:', features?.map(f => f.id));
    this.svg.selectAll('path')
      .classed('selected', d => {
        const isSelected = features?.some(f => f.id === (d as Feature).id);
        console.log(`Feature ${((d as Feature).id)} selected: ${isSelected}`);
        return isSelected;
      });
  }

  private initMap(): void {
    const layerNames = DataModel.getInstance().getLayers();
    const containerWidth = this.mapContainer.nativeElement.offsetWidth;
    const containerHeight = this.mapContainer.nativeElement.offsetHeight;
    const width = containerWidth * 0.95;
    const height = containerHeight * 0.95;

    this.svg = d3.select(this.mapContainer.nativeElement).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    this.g = this.svg.append('g');  // Group for the map paths

    this.projection = d3Geo.geoMercator()
      .translate([width / 2, height / 2]);

    this.path = d3Geo.geoPath().projection(this.projection);

    // Draw the spherical background
    this.g.append("path")
      .datum({type: "Sphere"})
      .attr("class", "sphere")
      .attr("d", this.path)
      //.attr("fill", "#F5F5F5");  // Light blue fill, or choose any suitable color


    // Draw the spherical background
    this.g.append("path")
      .datum({type: "Sphere"})
      .attr("class", "sphere")
      .attr("d", this.path)
      .attr("fill", "#ADD8E6");  // Light blue fill, or choose any suitable color


    this.zoom = d3.zoom()
      .scaleExtent([1, 50])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);  // Apply the zoom behavior to the SVG

    layerNames.forEach(name => {
      const layer = DataModel.getInstance().getLayer(name);
      if (layer && layer.features) {
        this.addLayerToMap(layer.features);
      }
    });
    this.resizeMap(); // Ensure initial sizing is correct
  }

  // private addLayerToMap(features: Feature<GeometryObject>[]): void {
  //   this.svg.append('g').selectAll('path')
  //     .data(features, (d: any) => d.id)  // Use the 'id' to bind data
  //     .enter().append('path')
  //     .attr("class", d => d.geometry.type.toLowerCase())
  //     .attr('d', this.path)
  //     .on('click', (event, feature) => {
  //       console.log('Clicked feature ID:', feature.id);  // Log to confirm the ID is accessible
  //       this.selectFeature(event, feature);
  //     })
  //     .style('cursor', 'pointer');
  // }
  private addLayerToMap(features: Feature<GeometryObject>[]): void {
    // Use the existing group 'g' that has the zoom behavior applied.
    this.g.selectAll('path')
      .data(features, (d: any) => d.id)  // Use the 'id' to bind data
      .enter().append('path')
      .attr("class", d => d.geometry.type.toLowerCase())
      .attr('d', this.path)
      .on('click', (event, feature) => {
        console.log('Clicked feature ID:', feature.id);  // Log to confirm the ID is accessible
        this.selectFeature(event, feature);
      })
      .style('cursor', 'pointer');
  }

  public resizeMap(): void {
    if (this.mapContainer && this.svg) {
      const containerWidth = this.mapContainer.nativeElement.offsetWidth;
      const containerHeight = this.mapContainer.nativeElement.offsetHeight;
      const width = containerWidth * 0.95;
      const height = containerHeight * 0.95;

      console.log(`Resizing map to ${width}x${height}`);

      this.svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

      this.projection
        .fitSize([width, height], { type: 'FeatureCollection', features: this.getAllFeatures() });

      this.svg.selectAll('path')
        .attr('d', this.path); // Reapply projection and path after resizing
    }
  }

  private getAllFeatures(): Feature[] {
    const allFeatures = [];
    const layerNames = DataModel.getInstance().getLayers();
    layerNames.forEach(name => {
      const layer = DataModel.getInstance().getLayer(name);
      if (layer && layer.features) {
        allFeatures.push(...layer.features);
      }
    });
    return allFeatures;
  }

  private selectFeature(event: MouseEvent, feature: Feature): void {
    if (feature.id) {
      DataModel.getInstance().setSelectedFeatures([feature]);
      console.log('Selected feature set in DataModel:', feature.id);
    } else {
      console.error('Feature ID is undefined, cannot select');
    }
  }

  private testFeatureSelection(): void {
    const testFeature = {
      type: 'Feature',
      id: 'test1',
      properties: { name: 'Test Feature' },
      geometry: {
        type: 'LineString',
        coordinates: [[-101.744384, 39.32155], [-101.552982, 39.330048]]
      }
    };
    this.selectFeature(new MouseEvent('click'), testFeature as any);
  }
}

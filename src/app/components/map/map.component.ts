import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { DataModel } from '../../models/data-model';
import { Subscription } from 'rxjs';
import { ProjectionType } from '../../enums/projection-type.enum';

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
  //private projectionType: string = 'mercator'; // Default to Mercator
  private projectionType: ProjectionType = ProjectionType.LambertConicConformal;

  //Todo
  //-rotation[yaw, pitch, roll];
  //--yaw = rotation[0];
  //--pitch = rotation[1];
  //--roll = rotation[2];
  //-Export -> svg?, PDF
  //-Extent
  //-Labels (codes)
  //-Table editing
  //-Script tagging.
  //-Table
  //--sorting
  //--filtering
  //-Widgets
  //--Roll, pitch, yaw widget
  //--Layer widget
  //-Level of Detail
  //-Strokes should remain 1px for every zoom level

  constructor() {}

  ngOnInit(): void {
    this.initMap();
    this.subscription = DataModel.getInstance().getSelectedFeatures().subscribe(features => {
      this.updateMapSelection(features);
    });
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.resizeMap());
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.subscription.unsubscribe();
  }

  private initMap(): void {
    this.setupSVG();
    this.setProjection(this.projectionType);

    // Draw the spherical background
    this.path = d3.geoPath().projection(this.projection); // Define the path generator with the set projection
    this.g.append("path")
      .datum({type: "Sphere"})
      .attr("class", "sphere")
      .attr("d", this.path)

    //Graticule
    //Airport codes

    this.applyZoom();
    this.addLayers();
    this.resizeMap();
  }

  private setupSVG(): void {
    const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
    const height = this.mapContainer.nativeElement.offsetHeight * 0.95;

    this.svg = d3.select(this.mapContainer.nativeElement).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    this.g = this.svg.append('g');
  }

private setProjection(type: ProjectionType): void {
    const width = this.mapContainer.nativeElement.offsetWidth * 0.95;
    const height = this.mapContainer.nativeElement.offsetHeight * 0.95;
    const translate: [number, number] = [width / 2, height / 2];
    const center: [number, number] = [0, 0];  // This is the correct tuple definition
    const rotation: [number, number, number] = [-74, -41.5, 0]; // Ensure this is also correctly typed

    switch (type) {
      //case ProjectionType.Armadillo:
      //  this.projection = d3.geoArmadillo()
      //    .translate(translate)
      //    .rotate(rotation)
      //  break;
      case ProjectionType.Gnomonic:
        this.projection = d3.geoGnomonic()
          .translate(translate)
          .center(center)
          .rotate(rotation)
        break;
      case ProjectionType.LambertConicConformal:
         this.projection = d3.geoConicConformal()
           .translate(translate)
           .rotate(rotation)
          .parallels([29.5, 45.5])  // Specific to this projection type
        break;
      case ProjectionType.Mercator:
        this.projection = d3.geoMercator()
          .translate(translate)
          .center(center)
          //.rotate(rotation)
        break;
      case ProjectionType.Orthographic:
        this.projection = d3.geoOrthographic()
          .translate(translate)
          .rotate([74, -30])
        break;
      //case ProjectionType.TiltedPerspective:
      //  // Using satellite for a 3D-like perspective view
      //  this.projection = d3.geoSatellite()
      //    .distance(1.5)  // This adjusts how much of the sphere is visible
      //    .rotate(rotation)
      //    .translate(translate)
      //    .scale(5000)
      //    .tilt(25);  // Simulating pitch
      //  break;
      case ProjectionType.TransverseMercator:
        this.projection = d3.geoTransverseMercator()
          .translate(translate)
          //.rotate(rotation)
          break;
      default:
        this.projection = d3.geoMercator()
          .translate(translate)
          //.rotate(rotation)
        break;
    }
    this.path = d3.geoPath().projection(this.projection);
    this.redrawMap();
  }

  private applyZoom(): void {
    this.zoom = d3.zoom()
      .scaleExtent([1, 50])
      .on('zoom', event => this.g.attr('transform', event.transform));
    this.svg.call(this.zoom);
  }

  private addLayers(): void {
    const layerNames = DataModel.getInstance().getLayers();
    layerNames.forEach(name => {
      const layer = DataModel.getInstance().getLayer(name);
      if (layer && layer.features) {
        this.addLayerToMap(layer.features);
      }
    });
  }

  private addLayerToMap(features: Feature<GeometryObject>[]): void {
    this.g.selectAll('path')
      .data(features, (d: any) => d.id)
      .enter().append('path')
      .attr("class", d => d.geometry.type.toLowerCase())
      .attr('d', this.path)
      .on('click', (event, feature) => {
        console.log('Clicked feature ID:', feature.id);
        this.selectFeature(event, feature);
      })
      .style('cursor', 'pointer');
  }

  private redrawMap(): void {
    const features = this.getAllFeatures();
    this.g.selectAll('path')
      .data(features, (d: any) => d.id)
      .join(
        enter => enter.append('path')
          .attr('class', d => d.geometry.type.toLowerCase())
          .attr('d', this.path)
          .on('click', (event, d) => this.selectFeature(event, d))
          .style('cursor', 'pointer'),
        update => update.attr('d', this.path),
        exit => exit.remove()
      );
  }

  public resizeMap(): void {
    if (this.mapContainer && this.svg) {
      const containerWidth = this.mapContainer.nativeElement.offsetWidth;
      const containerHeight = this.mapContainer.nativeElement.offsetHeight;
      const width = containerWidth * 0.95;
      const height = containerHeight * 0.95;

      this.svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
      this.projection.fitSize([width, height], { type: 'FeatureCollection', features: this.getAllFeatures() });
      this.svg.selectAll('path').attr('d', this.path);
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

  private updateMapSelection(features: Feature[] | null): void {
    console.log('Map features updated:', features);
    this.svg.selectAll('path')
      .classed('selected', d => features && features.some(f => f.id === (d as Feature).id));
  }

}

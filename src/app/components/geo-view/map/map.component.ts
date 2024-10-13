import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { GeoModel } from '../../../models/geo-model';
import { CriteriaModel } from '../../../models/criteria.model';
import { ModelListener } from '../../../interfaces/model-listener';
import { SelectionListener } from '../../../interfaces/selection-listener';
import { FilterListener } from '../../../interfaces/filter-listener';
import { Feature } from 'geojson';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, ModelListener, SelectionListener, FilterListener {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private projection!: d3.GeoProjection;
  private path!: d3.GeoPath;
  private zoom!: d3.ZoomBehavior<Element, unknown>;
  private g!: d3.Selection<SVGGElement, unknown, null, undefined>;

  private width = 800;
  private height = 600;
  private currentModel: GeoModel | null = null;

  constructor(public elementRef: ElementRef) {} // Inject ElementRef

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();

    window.addEventListener('resize', () => {
      const width = this.elementRef.nativeElement.offsetWidth;
      const height = this.elementRef.nativeElement.offsetHeight;
      this.resize(width, height); // Pass width and height
    });

    // Call resize initially to ensure the map starts with the correct size:
    const initialWidth = this.elementRef.nativeElement.offsetWidth;
    const initialHeight = this.elementRef.nativeElement.offsetHeight;
    this.resize(initialWidth, initialHeight);

    // Force layout recalculation after the initial render completes
    requestAnimationFrame(() => {
      const width = this.elementRef.nativeElement.offsetWidth;
      const height = this.elementRef.nativeElement.offsetHeight;
      this.resize(width, height);
    });
  }


  onModelChange(model: GeoModel): void {
    this.updateMapData(model);  // Call updateMapData when model changes
  }

  onSelect(feature: Feature): void {
    console.log('Feature selected:', feature);
    this.highlightFeature(feature);
  }

  onDeselect(feature: Feature): void {
    console.log('Feature deselected:', feature);
  }

  onClearSelection(): void {}

  onFilter(criteria: CriteriaModel): void {
    this.applyFilter(criteria);
  }

  onClearFilter(): void {}

  onResize() {}

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.svg
      .attr('width', width)
      .attr('height', height);
    this.projection.translate([width / 2, height / 2]);
    if (this.currentModel) {
      this.updateMapData(this.currentModel);
    }
  }

  private initMap(): void {
    this.svg = d3.select(this.mapContainer.nativeElement)
      .append('svg');

    this.projection = d3Geo.geoMercator()
      .scale(150)
      .translate([this.width / 2, this.height / 2]);

    this.path = d3Geo.geoPath().projection(this.projection);

    this.zoom = d3.zoom()
      .scaleExtent([1, 20])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    this.g = this.svg.append('g');
  }

  private renderGeoJSON(geoData: GeoModel): void {
    // Clear previous paths to avoid duplication
    this.g.selectAll<SVGPathElement, any>('path').remove();

    // Bind the GeoJSON features to the path elements
    const paths = this.g.selectAll<SVGPathElement, any>('path')
      .data(geoData.data.features, (d: any) => d.id || d.properties?.name || Math.random());

    // Append new paths for each feature
    paths.enter()
      .append('path')
      .attr('d', (d) => this.path(d as any) || '')  // Generate the path using D3's geoPath
      .attr('class', (d: any) => this.getFeatureClass(d))  // Assign CSS class based on feature type
      .merge(paths as d3.Selection<SVGPathElement, any, SVGGElement, unknown>)  // Ensure the types match
      .attr('data-feature-id', (d: any) => d.id || '');  // Optional: Add data attribute for debugging

    // Remove any paths that no longer have data bound to them
    paths.exit().remove();
  }




  private getFeatureClass(feature: any): string {
    switch (feature.geometry.type) {
      case 'Polygon':
      case 'MultiPolygon':
        return 'polygon';  // Class for countries or regions
      case 'LineString':
        return 'line-route';  // Class for route lines
      default:
        return '';  // No class for unsupported types
    }
  }

  private updateMapData(model: GeoModel): void {
    this.currentModel = model;
    this.renderGeoJSON(model);  // Call renderGeoJSON when the model is updated
  }

  private onFeatureClick(event: PointerEvent, feature: Feature): void {
    event.stopPropagation();

    const isSelected = feature.properties?.selected;
    feature.properties = { ...feature.properties, selected: !isSelected };

    // Add or remove the 'selected' class based on the feature's state
    this.g.selectAll('path')
      .filter((d: any) => d.id === feature.id)
      .classed('selected', feature.properties.selected);

    if (!isSelected) {
      this.g.selectAll('path')
        .filter((d: any) => d.id !== feature.id)
        .classed('selected', false);
    }

    // Notify other components
    if (feature.properties.selected) {
      this.onSelect(feature);
    } else {
      this.onDeselect(feature);
    }
  }

  private highlightFeature(feature: Feature): void {
    this.g.selectAll('path')
      .attr('fill', (d: Feature) => d === feature ? '#ff7f00' : '#ccc');
  }

  private applyFilter(criteria: CriteriaModel): void {
    console.log('Applying filter:', criteria);
  }

  onFeatureUpdate(featureId: string, properties: { [key: string]: any }): void {
    if (this.currentModel) {
      const updatedFeature = this.currentModel.features.find(f => f.id === featureId);

      if (updatedFeature) {
        Object.assign(updatedFeature.properties, properties);

        // Update map visualization
        this.g.selectAll('path')
          .filter((d: any) => d.id === featureId)
          .attr('fill', this.getFeatureColor(updatedFeature))
          .attr('stroke-width', this.getFeatureStrokeWidth(updatedFeature));

        if (properties.geometry) {
          this.g.selectAll('path')
            .filter((d: any) => d.id === featureId)
            .attr('d', (d) => this.path(d as any) || '');
        }

        if ('visible' in properties) {
          this.g.selectAll('path')
            .filter((d: any) => d.id === featureId)
            .attr('visibility', properties.visible ? 'visible' : 'hidden');
        }

        if ('opacity' in properties) {
          this.g.selectAll('path')
            .filter((d: any) => d.id === featureId)
            .attr('opacity', properties.opacity);
        }
      }
    }
  }

  private getFeatureColor(feature: Feature): string {
    return feature.properties?.color || '#ccc';
  }

  private getFeatureStrokeWidth(feature: Feature): number {
    return feature.properties?.selected ? 2 : 1;
  }

  private centerMapOnFeature(feature: Feature): void {
    const bounds = this.path.bounds(feature as any);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / this.width, dy / this.height)));
    const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

    this.svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
  }

  ngOnDestroy(): void {
    // Cleanup logic can go here if necessary
  }
}

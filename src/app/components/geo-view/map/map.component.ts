import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { GeoModel } from '../../../models/geo-model';
import { FeatureModel } from '../../../models/feature.model';
import { CriteriaModel } from '../../../models/criteria.model';
import { ModelListener } from '../../../interfaces/model-listener';
import { SelectionListener } from '../../../interfaces/selection-listener';
import { FilterListener } from '../../../interfaces/filter-listener';

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

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or event listeners if necessary
  }

  onModelChange(model: GeoModel): void {
    this.updateMapData(model);
  }

  onSelect(feature: FeatureModel): void {
    // Implement logic to notify other components about the selection
    console.log('Feature selected:', feature);
    // For example, you might emit an event here
    this.highlightFeature(feature);
  }

  onDeselect(feature: FeatureModel): void {
    // Implement logic to notify other components about the deselection
    console.log('Feature deselected:', feature);
    // For example, you might emit an event here
  }

  onClearSelection(): void {}

  onFilter(criteria: CriteriaModel): void {
    this.applyFilter(criteria);
  }

  onClearFilter(): void {}

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
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.projection = d3Geo.geoMercator()
      .scale(150)
      .translate([this.width / 2, this.height / 2]);

    this.path = d3Geo.geoPath().projection(this.projection);

    this.zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    this.g = this.svg.append('g');
  }

  private updateMapData(model: GeoModel): void {
    this.currentModel = model;
    this.g.selectAll('path').remove();

    this.g.selectAll('path')
      .data(model.data.features as FeatureModel[])
      .enter()
      .append('path')
      //.attr('d', this.path)
      .attr('d', (d) => this.path(d as any) || '')
      .attr('fill', '#ccc')
      .attr('stroke', '#333')
      .on('click', (event: PointerEvent, d: FeatureModel) => this.onFeatureClick(event, d));
  }

private onFeatureClick(event: PointerEvent, feature: FeatureModel): void {
  console.log('Feature clicked:', feature);

  // Prevent the event from bubbling up to parent elements
  event.stopPropagation();

  // Toggle the selection state of the clicked feature
  const isSelected = feature.properties.selected;
  feature.properties.selected = !isSelected;

  // Update the visual representation of the clicked feature
  this.g.selectAll('path')
    .filter((d: any) => d.id === feature.id)
    .attr('fill', this.getFeatureColor(feature))
    .attr('stroke-width', this.getFeatureStrokeWidth(feature));

  // If this feature was just selected, deselect all other features
  if (!isSelected) {
    this.g.selectAll('path')
      .filter((d: any) => d.id !== feature.id)
      .each((d: any) => {
        d.properties.selected = false;
      })
      .attr('fill', (d: any) => this.getFeatureColor(d))
      .attr('stroke-width', (d: any) => this.getFeatureStrokeWidth(d));
  }

  // Emit an event or call a method to notify other components about the selection change
  if (feature.properties.selected) {
    this.onSelect(feature);
  } else {
    this.onDeselect(feature);
  }

  // If you want to center the map on the selected feature, you can add this:
  if (feature.properties.selected) {
    this.centerMapOnFeature(feature);
  }
}

  private highlightFeature(feature: FeatureModel): void {
    this.g.selectAll('path')
      .attr('fill', (d: FeatureModel) => d === feature ? '#ff7f00' : '#ccc');
  }

  private applyFilter(criteria: CriteriaModel): void {
    // Implement filtering logic
    console.log('Applying filter:', criteria);
  }

  onFeatureUpdate(featureId: string, properties: { [key: string]: any }): void {
    if (this.currentModel) {
      // Find the feature in the current model
      const updatedFeature = this.currentModel.features.find(f => f.id === featureId);

      if (updatedFeature) {
        // Update the feature's properties
        Object.assign(updatedFeature.properties, properties);

        // Update the map visualization
        this.g.selectAll('path')
          .filter((d: any) => d.id === featureId)
          .attr('fill', this.getFeatureColor(updatedFeature))
          .attr('stroke-width', this.getFeatureStrokeWidth(updatedFeature));

        // If the update includes changes that affect the feature's shape or position,
        // we need to redraw the path
        if (properties.geometry) {
          this.g.selectAll('path')
            .filter((d: any) => d.id === featureId)
            .attr('d', (d) => this.path(d as any) || '');
        }

        // If there are any specific property updates that require special handling,
        // add them here. For example:
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

  // Helper methods for feature styling
  private getFeatureColor(feature: FeatureModel): string {
    // Implement your color logic here. For example:
    return feature.properties.color || '#ccc';
  }

  private getFeatureStrokeWidth(feature: FeatureModel): number {
    // Implement your stroke width logic here. For example:
    return feature.properties.selected ? 2 : 1;
  }

  // Helper method to center the map on a feature
  private centerMapOnFeature(feature: FeatureModel): void {
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
}

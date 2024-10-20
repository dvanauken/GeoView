import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FeatureCollection, Feature } from 'geojson';
import {DataModel} from "../../models/data-model";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tableContainer', { static: true }) tableContainer: ElementRef;
  displayedColumns: string[] = []; // Define your table columns dynamically based on GeoJSON data
  dataSource: any[] = []; // Add your data here
  private resizeObserver!: ResizeObserver;
  private selectedLayerName: string = '';  // Default or user-selected layer name

  constructor() {}

  ngOnInit(): void {
    //this.loadLayerData();
    this.loadSelectedLayerData();
  }

  ngAfterViewInit(): void {
    this.resizeTable(); // Initial table size adjustment

    // Use ResizeObserver to detect size changes in the parent container (pane)
    this.resizeObserver = new ResizeObserver(() => {
      console.log('Table container resized.');
      this.resizeTable(); // Adjust the table size on container resize
    });

    // Observe the parent container element
    this.resizeObserver.observe(this.tableContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect(); // Clean up observer on destroy
    }
  }

  private loadLayerData(): void {
    const layerNames = DataModel.getInstance().getLayers();
    if (layerNames.length > 0) {
      // Optionally, allow user selection or default to the first layer
      this.selectedLayerName = layerNames[0];
      this.populateTable(this.selectedLayerName);
    }
  }

  private populateTable(layerName: string): void {
    const layer = DataModel.getInstance().getLayer(layerName);
    if (layer && layer.features) {
      // Dynamically set the table columns based on the first feature's properties
      this.displayedColumns = Object.keys(layer.features[0].properties || {});
      // Populate the data source with feature properties (non-geometry)
      this.dataSource = layer.features.map((feature: Feature) => feature.properties);
    }
  }

  public selectLayer(layerName: string): void {
    this.selectedLayerName = layerName;
    this.populateTable(layerName);
  }

  resizeTable(): void {
    if (this.tableContainer) {
      const width = this.tableContainer.nativeElement.offsetWidth;
      const height = this.tableContainer.nativeElement.offsetHeight;

      console.log(`Resizing table to ${width}x${height}`);

      // Adjust table layout, such as setting widths or heights based on container size
    }
  }

  private loadSelectedLayerData(): void {
    const selectedLayer = DataModel.getInstance().getSelectedLayer();
    if (selectedLayer && selectedLayer.features) {
      // Set table columns based on properties of the first feature
      this.displayedColumns = Object.keys(selectedLayer.features[0].properties || {});
      // Populate the table data source with properties of each feature
      this.dataSource = selectedLayer.features.map((feature: Feature) => feature.properties);
    } else {
      console.error('No selected layer or no features available.');
    }
  }

  applyFilter(filterValue: string): void {
    // Logic to filter table data based on input
  }

  // sortData(column: string): void {
  //   // Logic to sort the data when a column header is clicked
  // }
  //
  onRowClick(row: any): void {
    // Logic to handle row click events
  }
}

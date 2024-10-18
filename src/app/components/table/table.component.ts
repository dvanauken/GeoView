import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FeatureCollection, Feature } from 'geojson';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tableContainer', { static: true }) tableContainer: ElementRef;
  displayedColumns: string[] = []; // Define your table columns dynamically based on GeoJSON data
  dataSource: any[] = []; // Add your data here
  private geoData: FeatureCollection | null = null;
  private resizeObserver!: ResizeObserver;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch GeoJSON data
    this.http.get<FeatureCollection>('assets/110m/countries.geojson').subscribe(geoJson => {
      this.geoData = geoJson;
      this.populateTable();
    });
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

  private populateTable(): void {
    if (this.geoData) {
      const features = this.geoData.features;

      if (features.length > 0) {
        // Dynamically set the table columns based on the first feature's properties
        this.displayedColumns = Object.keys(features[0].properties || {});

        // Populate the data source with feature properties (non-geometry)
        this.dataSource = features.map((feature: Feature) => feature.properties);
      }
    }
  }

  resizeTable(): void {
    if (this.tableContainer) {
      const width = this.tableContainer.nativeElement.offsetWidth;
      const height = this.tableContainer.nativeElement.offsetHeight;

      console.log(`Resizing table to ${width}x${height}`);

      // Adjust table layout, such as setting widths or heights based on container size
    }
  }

  applyFilter(filterValue: string): void {
    // Logic to filter table data based on input
  }

  sortData(column: string): void {
    // Logic to sort the data when a column header is clicked
  }

  onRowClick(row: any): void {
    // Logic to handle row click events
  }
}

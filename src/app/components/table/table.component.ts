import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FeatureCollection, Feature } from 'geojson';
import {DataModel} from "../../models/data-model";
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tableContainer', { static: true }) tableContainer: ElementRef;
  displayedColumns: string[] = [];
  dataSource: any[] = [];
  private resizeObserver!: ResizeObserver;
  private selectedLayerName: string = '';
  private subscription: Subscription;
  selectedRows = new Set();
  lastClickedRowIndex: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    console.log('TableComponent constructor called');
  }

  ngOnInit(): void {
    this.loadSelectedLayerData(); // Ensure data is loaded
    this.subscription = DataModel.getInstance().getSelectedFeatures().subscribe(features => {
      this.updateTableSelection(features);
    });
  }

  updateTableSelection(features: Feature[] | null): void {
    if (!features) {
      console.log('No features to update in table.');
      return;
    }

    this.dataSource.forEach(row => {
      const isSelected = features.some(feature => feature && feature.id === row.id);
      if (isSelected !== row.selected) {
        row.selected = isSelected;
        console.log(`Row with ID ${row.id} selection updated to ${isSelected}`);
      }
    });
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeTable();
    });
    this.resizeObserver.observe(this.tableContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.subscription.unsubscribe();
  }

  private loadSelectedLayerData(): void {
    console.log('loadSelectedLayerData called');
    // Example: Load layer data, assuming it's synchronous for simplicity
    // In practice, you might need to handle asynchronous data fetching here
    const selectedLayer = DataModel.getInstance().getSelectedLayer();
    if (selectedLayer && selectedLayer.features) {
      this.displayedColumns = Object.keys(selectedLayer.features[0].properties || {});
      this.dataSource = selectedLayer.features.map(feature => ({
        ...feature.properties,
        id: feature.id,
        selected: false  // Initialize selection state
      }));
    }
  }


  resizeTable(): void {
    if (this.tableContainer) {
      const width = this.tableContainer.nativeElement.offsetWidth;
      const height = this.tableContainer.nativeElement.offsetHeight;
      console.log(`Resizing table to ${width}x${height}`);
    }
  }

  onRowClick(row: any, index: number, event: MouseEvent): void {
    this.lastClickedRowIndex = index;  // Update the last clicked index for shift-click logic
    let newSelection;
    if (event.shiftKey && this.lastClickedRowIndex !== null) {
      const start = Math.min(index, this.lastClickedRowIndex);
      const end = Math.max(index, this.lastClickedRowIndex);
      newSelection = this.dataSource.slice(start, end + 1);
    } else if (event.ctrlKey || event.metaKey) {
      newSelection = [...DataModel.getInstance().getSelectedFeatures().value || []];
      const idx = newSelection.findIndex(item => item.id === row.id);
      if (idx > -1) {
        newSelection.splice(idx, 1);  // Deselect if already selected
      } else {
        newSelection.push(row);  // Select if not already selected
      }
    } else {
      newSelection = [row];  // Normal click, select only this row
    }

    DataModel.getInstance().setSelectedFeatures(newSelection);
  }

  // isSelected(row: any): boolean {
  //   // const selected = this.selectedRows.has(row);
  //   // console.log(`Row selected: ${selected}, applying background: ${selected ? '#add8e6' : 'none'}`);
  //   // return selected;
  //   return true;
  // }

  // private logSelectionState(): void {
  //   console.log('Current selection state:');
  //   console.log('Selected rows count:', this.selectedRows.size);
  //   console.log('Selected rows:', Array.from(this.selectedRows));
  //   console.log('Last clicked row index:', this.lastClickedRowIndex);
  // }
}

import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FeatureCollection, Feature } from 'geojson';
import { DataModel } from "../../models/data-model";
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

  // State for new data entry
  newEntry: any = {};
  // Track if a row is being edited
  editingRowIndex: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    console.log('TableComponent constructor called');
  }

  ngOnInit(): void {
    // Set initial selection as empty
    DataModel.getInstance().setSelectedFeatures([]);

    this.initTable(); // Ensure data is loaded
    this.initializeNewEntry();
    this.subscription = DataModel.getInstance().getSelectedFeatures().subscribe(features => {
      this.updateTableSelection(features);
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

  private initTable(): void {
    console.log('initTable called');
    const selectedLayer = DataModel.getInstance().getSelectedLayer();
    if (selectedLayer && selectedLayer.features) {
      this.displayedColumns = Object.keys(selectedLayer.features[0].properties || {});
      this.dataSource = selectedLayer.features.map(feature => ({
        ...feature.properties,
        id: feature.id,
        selected: false,  // Ensure all rows are initialized as not selected
        isEditing: false  // Initialize editing state
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
    if (this.editingRowIndex !== null && this.editingRowIndex !== index) {
      // Prevent row selection if another row is being edited
      return;
    }
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

  updateTableSelection(features: Feature[] | null): void {
    if (!features) {
      console.log('No features to update in table.');
      return;
    }

    this.dataSource.forEach(row => {
      const isSelected = features.some(feature => feature && feature.id === row.id);
      if (isSelected !== row.selected) {
        row.selected = isSelected;
        //console.log(`Row with ID ${row.id} selection updated to ${isSelected}`);
      }
    });
  }

  onEdit(row: any, index: number, event: Event): void {
    event.stopPropagation(); // Prevent row click event
    if (this.editingRowIndex !== null && this.editingRowIndex !== index) {
      return; // Don't allow editing another row if one is already being edited
    }
    row.originalData = { ...row }; // Store original data for potential cancel
    row.isEditing = true;
    this.editingRowIndex = index;
  }

  onSave(row: any, index: number): void {
    row.isEditing = false;
    this.editingRowIndex = null;
    // Implement your saving logic here (e.g., call an API)
    console.log('Saved data:', row);
  }

  onCancel(row: any, index: number): void {
    Object.assign(row, row.originalData);
    row.isEditing = false;
    this.editingRowIndex = null;
  }

  initializeNewEntry(): any {
    const defaultEntry: any = {
      id: 'NEW', // Read-only
      base: '(0.0, 0.0)', // Read-only
      ref: '(0.0, 0.0)', // Read-only
      Airline: 'X',
      Base: 'X',
      Ref: 'X',
      'City 1': 'X',
      'City 2': 'X'
    };

    return defaultEntry;
  }

  isEditableCell(column: string, row: any): boolean {
    const readOnlyColumns = ['id', 'base', 'ref'];
    return !readOnlyColumns.includes(column);
  }

  onNewEntrySave(): void {
    // Validate the entry
    if (this.isNewEntryValid()) {
      // Generate a unique ID or use your ID generation logic
      const newId = `NEW_${Date.now()}`;
      const newData = {
        ...this.newEntry,
        id: newId,
        isEditing: false,
        selected: false
      };

      this.dataSource = [...this.dataSource, newData];
      this.newEntry = this.initializeNewEntry();

      // Optionally notify a service or perform additional operations
      console.log('New entry saved:', newData);
    } else {
      console.error('New entry validation failed');
    }
  }

  isNewEntryValid(): boolean {
    const requiredFields = this.displayedColumns.filter(column =>
      !['id', 'base', 'ref'].includes(column)
    );

    return requiredFields.every(field =>
      this.newEntry[field] && this.newEntry[field].trim() !== ''
    );
  }
}

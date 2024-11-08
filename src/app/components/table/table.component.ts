import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FeatureCollection, Feature } from 'geojson';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';


interface PaginationConfig {
  pageSize: number;
  currentPage: number;
  totalItems: number;
  pageSizeOptions: number[];
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
    animations: [
      trigger('filterAnimation', [
        state('hidden', style({
          opacity: 0,
          height: '0px',
          minHeight: '0',
          padding: '0',
          overflow: 'hidden'
        })),
        state('visible', style({
          opacity: 1,
          height: '*',
          minHeight: '48px'
        })),
        transition('hidden <=> visible', [
          animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')
        ])
      ])
    ]
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tableContainer', { static: true }) tableContainer: ElementRef;
  displayedColumns: string[] = [];
  dataSource: any[] = [];
  private resizeObserver!: ResizeObserver;
  private subscription: Subscription;
  selectedRows = new Set();
  lastClickedRowIndex: number | null = null;
  editingRows = new Set<number>();
  formatCoord = (coord: number) => coord.toFixed(3);
  showFilters = false;

    paginatedData: any[] = [];  // Add this line

    pagination: PaginationConfig = {
      pageSize: 10,
      currentPage: 1,
      totalItems: 0,
      pageSizeOptions: [10, 25, 50, 100, -1]  // -1 represents 'All'
    };


  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.dataService.setSelectedFeatures([]);
    this.initTable();
    this.subscription = this.dataService.getSelectedFeatures().subscribe(features => {
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
    const selectedLayer = this.dataService.getSelectedLayer();
    if (selectedLayer?.getFeatures()?.length > 0) {
      const features = selectedLayer.getFeatures();
      if (features[0].properties) {
        this.displayedColumns = Object.keys(features[0].properties);
        this.dataSource = features.map(feature => ({
          ...feature.properties,
          id: feature.id,
          selected: false,
          isEditing: false
        }));
        this.pagination.totalItems = this.dataSource.length;
        this.updatePaginatedData();
      }
    }
  }

  initializeNewEntry(): any {
    return {
      id: 'NEW',
      Airline: 'DL',
      base: '',
      ref: '',
      'City 1': '',
      'City 2': '',
      'Coords 1': '(0.000, 0.000)',
      'Coords 2': '(0.000, 0.000)',
      isEditing: true,
      isNew: true
    };
  }

  onAddNewRow(): void {
    const newEntry = this.initializeNewEntry();
    this.dataSource.unshift(newEntry);
  }

  onFieldChange(value: string, field: string, row: any, index: number): void {
    // Sanitize the input
    const sanitizedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Update the specific row's field
    row[field] = sanitizedValue;

    // Only trigger the airport lookup if we have a complete code
    if (sanitizedValue.length === 3) {
      if (field === 'base') {
        const baseAirport = this.dataService.getAirport(sanitizedValue);
        if (baseAirport) {
          row['City 1'] = baseAirport.city;
          row['Coords 1'] = `(${this.formatCoord(baseAirport.lon)}, ${this.formatCoord(baseAirport.lat)})`;
          this.updateId(row);
        } else {
          alert('Base airport not found');
          row.base = '';
        }
      } else if (field === 'ref') {
        const refAirport = this.dataService.getAirport(sanitizedValue);
        if (refAirport) {
          row['City 2'] = refAirport.city;
          row['Coords 2'] = `(${this.formatCoord(refAirport.lon)}, ${this.formatCoord(refAirport.lat)})`;
          this.updateId(row);
        } else {
          alert('Ref airport not found');
          row.ref = '';
        }
      }
    }
  }

  updateId(row: any): void {
    if (row.base && row.ref) {
      const newId = `${row.base}-${row.ref}-DL`;
      const idExists = this.dataSource.some(r => r.id === newId && r !== row);
      if (idExists) {
        alert('Route with this ID already exists');
        row.id = row.isNew ? 'NEW' : row.originalData.id;
      } else {
        row.id = newId;
      }
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
    if (this.editingRows.size > 0) {
      return; // Prevent selection while editing
    }
    this.lastClickedRowIndex = index;
    let newSelection;
    if (event.shiftKey && this.lastClickedRowIndex !== null) {
      const start = Math.min(index, this.lastClickedRowIndex);
      const end = Math.max(index, this.lastClickedRowIndex);
      newSelection = this.dataSource.slice(start, end + 1);
    } else if (event.ctrlKey || event.metaKey) {
      newSelection = [...this.dataService.getSelectedFeatures().value || []];
      const idx = newSelection.findIndex(item => item.id === row.id);
      if (idx > -1) {
        newSelection.splice(idx, 1);
      } else {
        newSelection.push(row);
      }
    } else {
      newSelection = [row];
    }

    this.dataService.setSelectedFeatures(newSelection);
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
      }
    });
  }

  onEdit(row: any, index: number, event: Event): void {
    event.stopPropagation();
    row.originalData = { ...row };
    row.isEditing = true;
    this.editingRows.add(index);
  }

  onSave(row: any, index: number): void {
    if (row.id === 'NEW' || !row.base || !row.ref) {
      alert('Please complete all required fields before saving');
      return;
    }

    const feature = this.createFeatureFromEntry(row);
    const selectedLayer = this.dataService.getSelectedLayer();

    if (selectedLayer) {
      if (row.isNew) {
        this.dataService.addFeature(feature);
      } else {
        this.dataService.updateFeature(feature);
      }

      this.dataService.addLayer('routes', selectedLayer);

      row.isEditing = false;
      row.isNew = false;
      delete row.originalData;
      this.editingRows.delete(index);

      const currentlySelectedFeatures = this.dataService.getSelectedFeatures().value || [];
      this.dataService.setSelectedFeatures([...currentlySelectedFeatures]);
    }
  }

  onCancel(row: any, index: number): void {
    if (row.isNew) {
      this.dataSource = this.dataSource.filter((_, i) => i !== index);
    } else {
      Object.assign(row, row.originalData);
      row.isEditing = false;
      delete row.originalData;
    }
    this.editingRows.delete(index);
  }

  onDelete(row: any, index: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this row?')) {
      const selectedLayer = this.dataService.getSelectedLayer();
      if (selectedLayer && !row.isNew) {
        this.dataService.removeFeature(row.id);
        this.dataService.addLayer('routes', selectedLayer);
      }
      this.dataSource = this.dataSource.filter((_, i) => i !== index);
    }
  }

  onSaveAll(): void {
    const selectedLayer = this.dataService.getSelectedLayer();
    if (!selectedLayer) {
      alert('No layer selected');
      return;
    }

    for (const row of this.dataSource) {
      if (row.isNew || row.isEditing) {
        if (row.id === 'NEW' || !row.base || !row.ref) {
          alert('Please complete all required fields before saving');
          return;
        }

        const feature = this.createFeatureFromEntry(row);
        if (row.isNew) {
          this.dataService.addFeature(feature);
        } else {
          this.dataService.updateFeature(feature);
        }

        row.isEditing = false;
        row.isNew = false;
        delete row.originalData;
      }
    }

    this.editingRows.clear();
    this.dataService.addLayer('routes', selectedLayer);

    const currentlySelectedFeatures = this.dataService.getSelectedFeatures().value || [];
    this.dataService.setSelectedFeatures([...currentlySelectedFeatures]);
  }

  private createFeatureFromEntry(entry: any): Feature {
    const city1 = this.dataService.getAirport(entry.base);
    const city2 = this.dataService.getAirport(entry.ref);
    const coords1 = [city1.lon, city1.lat];
    const coords2 = [city2.lon, city2.lat];

    return {
      type: 'Feature',
      id: entry.id,
      geometry: {
        type: 'LineString',
        coordinates: [
          coords1,
          coords2
        ]
      },
      properties: {
        Airline: entry.Airline,
        base: entry.base,
        ref: entry.ref,
        'City 1': entry['City 1'],
        'City 2': entry['City 2'],
        'Coords 1': entry['Coords 1'],
        'Coords 2': entry['Coords 2']
      },
    };
  }

  // Pagination Methods
  updatePaginatedData(): void {
    if (this.pagination.pageSize === -1) {
      // Show all data
      this.paginatedData = [...this.dataSource];
      return;
    }

    const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize;
    const endIndex = startIndex + this.pagination.pageSize;
    this.paginatedData = this.dataSource.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    if (this.pagination.pageSize === -1) return 1;
    return Math.ceil(this.pagination.totalItems / this.pagination.pageSize);
  }

  get visiblePages(): number[] {
    const totalPages = this.totalPages;
    const current = this.pagination.currentPage;
    const pages: number[] = [];

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) pages.push(-1); // Add ellipsis

      // Show pages around current page
      for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
        pages.push(i);
      }

      if (current < totalPages - 2) pages.push(-1); // Add ellipsis

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  }

  onPageSizeChange(newSize: number): void {
    this.pagination.pageSize = newSize;
    this.pagination.currentPage = 1; // Reset to first page
    this.updatePaginatedData();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pagination.currentPage = page;
    this.updatePaginatedData();
  }

  // Navigation methods
  goToFirstPage(): void {
    this.onPageChange(1);
  }

  goToLastPage(): void {
    this.onPageChange(this.totalPages);
  }

  goToPreviousPage(): void {
    this.onPageChange(this.pagination.currentPage - 1);
  }

  goToNextPage(): void {
    this.onPageChange(this.pagination.currentPage + 1);
  }

  toggleFilters(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showFilters = !this.showFilters;
  }

}

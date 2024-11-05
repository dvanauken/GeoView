import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FeatureCollection, Feature } from 'geojson';
import { DataService } from '../../services/data.service';
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
  private subscription: Subscription;
  selectedRows = new Set();
  lastClickedRowIndex: number | null = null;
  newEntry: any = this.initializeNewEntry();
  editingRowIndex: number | null = null;
  formatCoord = (coord: number) => coord.toFixed(3);

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {
    console.log('TableComponent constructor called');
  }

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
    console.log('initTable called');
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
      } else {
        console.error('Feature properties are undefined for the selected layer.');
      }
    } else {
      console.error('Selected layer or features are undefined or empty.');
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
      'Coords 2': '(0.000, 0.000)'
    };
  }

  isEditableCell(column: string, row: any): boolean {
    const editableColumns = ['base', 'ref', 'City 1', 'City 2', 'Coords 1', 'Coords 2'];
    return editableColumns.includes(column);
  }

  onBaseChange(): void {
    if (this.newEntry.base && this.newEntry.base.length === 3) {
      const baseAirport = this.dataService.getAirport(this.newEntry.base);
      if (baseAirport) {
        this.newEntry['City 1'] = baseAirport.city;
        this.newEntry['Coords 1'] = `(${this.formatCoord(baseAirport.lon)}, ${this.formatCoord(baseAirport.lat)})`;
        this.updateId();
      } else {
        alert('Base airport not found');
      }
    }
  }

  onRefChange(): void {
    if (this.newEntry.ref && this.newEntry.ref.length === 3) {
      const refAirport = this.dataService.getAirport(this.newEntry.ref);
      if (refAirport) {
        this.newEntry['City 2'] = refAirport.city;
        this.newEntry['Coords 2'] = `(${this.formatCoord(refAirport.lon)}, ${this.formatCoord(refAirport.lat)})`;
        this.updateId();
      } else {
        alert('Ref airport not found');
      }
    }
  }

  updateId(): void {
    if (this.newEntry.base && this.newEntry.ref) {
      const newId = `${this.newEntry.base}-${this.newEntry.ref}-DL`;
      const idExists = this.dataSource.some(row => row.id === newId);

      if (idExists) {
        alert('Route with this ID already exists');
        this.newEntry.id = 'NEW';
      } else {
        this.newEntry.id = newId;
      }
    }
  }

  // onNewEntrySave(): void {
  //   if (this.newEntry.id !== 'NEW') {
  //     const newData = {
  //       ...this.newEntry,
  //       isEditing: false,
  //       selected: false
  //     };

  //     this.dataSource = [...this.dataSource, newData];
  //     this.newEntry = this.initializeNewEntry();
  //     console.log('New entry saved:', newData);
  //   } else {
  //     alert('Please enter a valid route before saving.');
  //   }
  // }

  isNewEntryValid(): boolean {
    return this.newEntry.base?.length === 3 && this.newEntry.ref?.length === 3 && this.newEntry.id !== 'NEW';
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
      return;
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
    if (this.editingRowIndex !== null && this.editingRowIndex !== index) {
      return;
    }
    row.originalData = { ...row };
    row.isEditing = true;
    this.editingRowIndex = index;
  }

  onSave(row: any, index: number): void {
    row.isEditing = false;
    this.editingRowIndex = null;
    row['Coords 1'] = [this.formatCoord(row['Coords 1'][0]), this.formatCoord(row['Coords 1'][1])];
    row['Coords 2'] = [this.formatCoord(row['Coords 2'][0]), this.formatCoord(row['Coords 2'][1])];
    console.log('Saved data:', row);
  }

  onCancel(row: any, index: number): void {
    Object.assign(row, row.originalData);
    row.isEditing = false;
    this.editingRowIndex = null;
  }

  private createFeatureFromEntry(entry: any): Feature {
    // Parse coordinates from strings like "(lon, lat)"
    // Get precise coordinates from AirportData using the city names

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

//   onNewEntrySave(): void {
//     if (this.newEntry.id !== 'NEW') {
//       const newData = {
//         ...this.newEntry,
//         isEditing: false,
//         selected: false
//       };
//
//       // Create a new feature from the entry
//       const newFeature = this.createFeatureFromEntry(newData);
//
//       // Get the currently selected layer
//       const selectedLayer = this.dataService.getSelectedLayer();
//
//       if (selectedLayer) {
//         // Add the new feature to the layer
//         selectedLayer.addFeature(newFeature);
//
//         this.dataService.addLayer('routes', selectedLayer);
//
//         // Update the table's dataSource
//         this.dataSource = [...this.dataSource, newData];
//
//         console.log(selectedLayer);
//
//         //// Update the selected features in the DataService to trigger map update
//         const updatedFeatures = selectedLayer.getFeatures();
//         this.dataService.setSelectedFeatures(updatedFeatures);
//
//         // Reset the new entry form
//         this.newEntry = this.initializeNewEntry();
//         console.log('New entry saved:', newData);
//       } else {
//         alert('No layer selected. Please select a layer before adding new routes.');
//       }
//     } else {
//       alert('Please enter a valid route before saving.');
//     }
//  }


  onNewEntrySave(): void {
    if (this.newEntry.id !== 'NEW') {
      const newData = {
        ...this.newEntry,
        isEditing: false,
        selected: false
      };

      // Create a new feature from the entry
      const newFeature = this.createFeatureFromEntry(newData);

      // Get the currently selected layer
      const selectedLayer = this.dataService.getSelectedLayer();

      if (selectedLayer) {
        // Add the new feature to the layer
        selectedLayer.addFeature(newFeature);

        // Update the layer in the data service
        this.dataService.addLayer('routes', selectedLayer);

        // Update the table's dataSource
        this.dataSource = [...this.dataSource, newData];

        // Keep currently selected features and notify subscribers of the layer update
        const currentlySelectedFeatures = this.dataService.getSelectedFeatures().value || [];
        this.dataService.setSelectedFeatures([...currentlySelectedFeatures]);

        // Reset the new entry form
        this.newEntry = this.initializeNewEntry();
        console.log('New entry saved:', newData);
      } else {
        alert('No layer selected. Please select a layer before adding new routes.');
      }
    } else {
      alert('Please enter a valid route before saving.');
    }
  }

  sanitizeBaseRefInput(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const sanitizedValue = input.value.toUpperCase().replace(/[^A-Z1-9]/g, '');

    if (field === 'base') {
      this.newEntry.base = sanitizedValue;
    } else if (field === 'ref') {
      this.newEntry.ref = sanitizedValue;
    }
  }


}

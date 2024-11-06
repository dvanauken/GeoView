import { ChangeDetectorRef, Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AirportData } from '../../interfaces/airport-data.interface';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-airport-table',
  templateUrl: './airport-table.component.html',
  styleUrls: ['./airport-table.component.scss']
})
export class AirportTableComponent implements OnInit, OnChanges {
  @Input() airportData: AirportData[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource: MatTableDataSource<AirportData> = new MatTableDataSource<AirportData>();
  displayedColumns: string[] = ['code', 'region', 'name', 'city', 'country', 'lat', 'lon', 'actions'];

  // Control for displaying the new entry row
  isAddingNewEntry = false;

  newEntry: AirportData = {
    code: '',
    region: 0,
    name: '',
    city: '',
    country: '',
    lat: null,
    lon: null
  };

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeDataSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['airportData'] && changes['airportData'].currentValue) {
      this.updateDataSource();
    }
  }

  toggleNewEntryRow(): void {
    this.isAddingNewEntry = !this.isAddingNewEntry;
    this.cdr.markForCheck(); // Mark the component for change detection
  }

  addInlineEntry() {
    if (this.newEntry.code && this.newEntry.name && this.newEntry.city && this.newEntry.country && this.newEntry.lat !== null && this.newEntry.lon !== null) {
      const data = this.dataSource.data;
      data.unshift({ ...this.newEntry });
      this.dataSource.data = data;
      this.dataService.setAirport(this.newEntry);
      this.clearNewEntry();
      this.isAddingNewEntry = false;
      this.cdr.markForCheck(); // Mark the component for change detection
    }
  }

  clearNewEntry() {
    this.newEntry = {
      code: '',
      region: 0,
      name: '',
      city: '',
      country: '',
      lat: null,
      lon: null
    };
    this.isAddingNewEntry = false;
    this.cdr.markForCheck(); // Mark the component for change detection
  }

  initializeDataSource(): void {
    this.dataSource.data = this.airportData;
    this.dataSource.paginator = this.paginator;
  }

  updateDataSource(): void {
    this.dataSource.data = this.airportData;
  }
}

// airport-table.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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
  displayedColumns: string[] = ['code', 'region', 'name', 'city', 'country', 'lat', 'lon'];


  // Object for storing new entry values
  newEntry: AirportData = {
    code: 'RBK',
    region: 0,
    name: 'French Valley',
    city: 'Temecula',
    country: 'USA',
    lat: 33.57417,
    lon: -117.12861
  };

  constructor(
    private dataService: DataService
  ) {}


  ngOnInit(): void {
    this.initializeDataSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['airportData'] && changes['airportData'].currentValue) {
      this.updateDataSource();
    }
  }

  initializeDataSource(): void {
    this.dataSource.data = this.airportData;
    this.dataSource.paginator = this.paginator;
  }

  updateDataSource(): void {
    this.dataSource.data = this.airportData;
  }

  addInlineEntry() {
    if (this.newEntry.code && this.newEntry.name && this.newEntry.city && this.newEntry.country && this.newEntry.lat !== null && this.newEntry.lon !== null) {
      const data = this.dataSource.data;
      data.push({ ...this.newEntry });
      this.dataSource.data = data; // Refresh the dataSource
      this.dataService.setAirport(this.newEntry);

      this.clearNewEntry(); // Clear input fields
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
  }

  convertDMSToDecimal(dmsString: string): number {
    const regex = /(\d+)\u00B0(\d+)'(\d+\.?\d*)"?\s*([NSEW])/;
    const match = dmsString.match(regex);
    if (!match) {
      throw new Error('Invalid DMS format');
    }
    const degrees = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseFloat(match[3]);
    const direction = match[4];

    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
      decimal = decimal * -1;
    }
    return decimal;
  }

  convertDecimalToDMS(decimal: number, isLatitude: boolean): string {
    const direction = isLatitude
      ? (decimal >= 0 ? 'N' : 'S')
      : (decimal >= 0 ? 'E' : 'W');
    decimal = Math.abs(decimal);
    const degrees = Math.floor(decimal);
    const minutesDecimal = (decimal - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(2);

    return `${degrees}\u00B0${minutes}'${seconds}" ${direction}`;
  }


}

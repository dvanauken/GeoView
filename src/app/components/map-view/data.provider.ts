// src/app/matrix/ixt-matrix.provider.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AirportCodeEditorComponent, ColumnConfigs, CoordinateEditorComponent, IxtDialogService } from '@dvanauken/ixtlan/dist/ixtlan';

//import { TableConfig } from '@dvanauken/ixtlan';
import { TableConfig } from '@dvanauken/ixtlan/dist/ixtlan';
import { ITabContent, ITabsetConfig} from '@dvanauken/ixtlan';

interface MatrixNode {
  id?: number;
  name: string;
  department?: string;
  position?: string;
  salary?: number;
  type?: string;
  size?: string;
  modified?: string;
  children?: MatrixNode[];
}

@Injectable({
  providedIn: 'root'
})
export class DataProvider {
  constructor(
    private http: HttpClient,
    private dialogService: IxtDialogService
  ) {}

  getColumnConfigs(): ColumnConfigs {
    return {
      code: {
        type: AirportCodeEditorComponent as any,
        field: 'code',
        editable: true,
        label: 'IATA Code' 
      },
      region: {
        type: 'text',
        field: 'region',
        label: 'Region', 
        editable: true
      },
      name: {
        type: 'text',
        field: 'name',
        label: 'Name', 
        editable: true
      },
      city: {
        type: 'text',
        field: 'city',
        label: 'City', 
        editable: true
      },
      country: {
        type: 'text',
        field: 'country',
        label: 'Country', 
        editable: true
      },
      lat: {
        type: CoordinateEditorComponent,
        field: 'lat',
        label: 'LAT', 
        editable: true
      },
      lon: {
        type: CoordinateEditorComponent,
        field: 'lon',
        label: 'LON', 
        editable: true
      }
    };
  }




  getAirportData(): Observable<any[]> {
    return this.http.get<any[]>('assets/Airport.json');
  }

  getAirportColumnConfigs(): ColumnConfigs {
    return this.getColumnConfigs();
  }
}
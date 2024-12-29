//src\app\components\map-view\data.provider.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IxtDialogService } from '@dvanauken/ixtlan';
import { ColumnConfigs, AirportCodeEditorComponent, CoordinateEditorComponent } from '@dvanauken/ixtlan';

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
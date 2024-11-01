import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AirportData } from '../interfaces/airport-data.interface';  // Update the path as necessary

@Injectable({
  providedIn: 'root'
})
export class AirportService {

  constructor(private http: HttpClient) {}

  loadAirportData(): Observable<AirportData[]> {
    return this.http.get<AirportData[]>('assets/Airport.json');
  }
}

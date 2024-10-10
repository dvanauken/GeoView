import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AirportService {
  private airports: any[] = [];

  constructor(private http: HttpClient) {}

  // Method to load airport.json file
  loadAirports(): Observable<any> {
    return this.http.get('assets/Airport.json').pipe(
      map((data: any[]) => {
        this.airports = data;
        return this.airports;
      }),
      catchError(error => {
        console.error('Error loading Airport.json:', error);
        return of([]);  // Return an empty array on error
      })
    );
  }

  // Method to get airport by code
  getAirportByCode(code: string): any | undefined {
    return this.airports.find(airport => airport.code === code);
  }
}

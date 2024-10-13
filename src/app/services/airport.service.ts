import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AirportService {
  private airports: any[] = [];

  constructor(private http: HttpClient) {}

  // Method to load airport.json file
  loadAirports(): Observable<any> {
    console.log("loadAirports.start")
    return this.http.get('assets/Airport.json').pipe(
      map((data: any[]) => {
        this.airports = data;

        // Log each airport as it's loaded
        this.airports.forEach((airport, index) => {
          //console.log(`Airport ${index + 1}:`, airport);
        });

        //console.log('All airports loaded:', this.airports);  // Log the full airport list
        return this.airports;
      }),
      catchError((error) => {
        console.error('Error loading Airport.json:', error);
        return of([]); // Return an empty array on error
      }),
    );
    console.log("loadAirports.end")
  }

  // Method to get airport by code
  getAirportByCode(code: string): any | undefined {
    const airport = this.airports.find((airport) => airport.code === code);
    //console.log(`Looking up airport by code: ${code}`, airport);  // Debug: log airport lookup
    return airport;
  }
}

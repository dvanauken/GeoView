import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AirlineService {
  private airlines: any[] = [];

  constructor(private http: HttpClient) {}

  // Method to load airline.json file
  loadAirlines(): Observable<any> {
    return this.http.get('assets/Airline.json').pipe(
      map((data: any[]) => {
        this.airlines = data;
        return this.airlines;
      }),
      catchError(error => {
        console.error('Error loading Airline.json:', error);
        return of([]);  // Return an empty array on error
      })
    );
  }

  // Method to get airline by code
  getAirlineByCode(code: string): any | undefined {
    return this.airlines.find(airline => airline.code === code);
  }
}

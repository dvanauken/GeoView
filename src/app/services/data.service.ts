import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { FeatureCollection } from 'geojson';
import { JSONModel } from '../models/json.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private geoDataSubject = new BehaviorSubject<FeatureCollection | null>(null);
  private jsonDataSubject = new BehaviorSubject<{ [key: string]: JSONModel }>(
    {},
  );
  geoData$ = this.geoDataSubject.asObservable();
  jsonData$ = this.jsonDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadGeoJSON(url: string): Observable<FeatureCollection> {
    return this.http.get<FeatureCollection>(url).pipe(
      tap((data) => console.log('Received GeoJSON data:', data)),
      tap((data) => this.geoDataSubject.next(data)),
      catchError(this.handleError<FeatureCollection>('loadGeoJSON')),
    );
  }
  loadJSON(url: string, key: string): Observable<JSONModel> {
    return this.http.get(url).pipe(
      map((data) => new JSONModel(data)),
      tap((model) => {
        const currentData = this.jsonDataSubject.value;
        this.jsonDataSubject.next({ ...currentData, [key]: model });
      }),
      catchError(this.handleError<JSONModel>('loadJSON')),
    );
  }

  getGeoData(): FeatureCollection | null {
    return this.geoDataSubject.value;
  }

  updateGeoData(updatedData: FeatureCollection): void {
    this.geoDataSubject.next(updatedData);
  }
  updateJSONData(key: string, updatedData: JSONModel): void {
    const currentData = this.jsonDataSubject.value;
    this.jsonDataSubject.next({ ...currentData, [key]: updatedData });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { GeoJSONModel } from '../models/geo-json.model';
import { JSONModel } from '../models/json.model';
import { GeoJSON } from 'geojson';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private geoDataSubject = new BehaviorSubject<GeoJSONModel | null>(null);
  private jsonDataSubject = new BehaviorSubject<{[key: string]: JSONModel}>({});
  geoData$ = this.geoDataSubject.asObservable();
  jsonData$ = this.jsonDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadGeoJSON(url: string): Observable<GeoJSONModel> {
    return this.http.get<GeoJSON>(url).pipe(
      map(data => new GeoJSONModel(data)),
      tap(model => this.geoDataSubject.next(model)),
      catchError(this.handleError<GeoJSONModel>('loadGeoJSON'))
    );
  }

  loadJSON(url: string, key: string): Observable<JSONModel> {
    return this.http.get(url).pipe(
      map(data => new JSONModel(data)),
      tap(model => {
        const currentData = this.jsonDataSubject.value;
        this.jsonDataSubject.next({ ...currentData, [key]: model });
      }),
      catchError(this.handleError<JSONModel>('loadJSON'))
    );
  }

  getGeoData(): GeoJSONModel | null {
    return this.geoDataSubject.value;
  }

  getJSONData(key: string): JSONModel | undefined {
    return this.jsonDataSubject.value[key];
  }

  updateGeoData(updatedData: GeoJSONModel): void {
    this.geoDataSubject.next(updatedData);
  }

  updateJSONData(key: string, updatedData: JSONModel): void {
    const currentData = this.jsonDataSubject.value;
    this.jsonDataSubject.next({ ...currentData, [key]: updatedData });
  }

  combineGeoJSONWithJSON(geoJSONKey: string, jsonKey: string, joinField: string): Observable<GeoJSONModel> {
    const geoData = this.getGeoData();
    const jsonData = this.getJSONData(jsonKey);

    if (!geoData || !jsonData) {
      return of(new GeoJSONModel({ type: 'FeatureCollection', features: [] }));
    }

    const combinedFeatures = geoData.features.map(feature => {
      const matchingData = jsonData.get(feature.properties?.[geoJSONKey]);
      if (matchingData) {
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...matchingData
          }
        };
      }
      return feature;
    });

    const combinedGeoJSON = new GeoJSONModel({
      type: 'FeatureCollection',
      features: combinedFeatures
    });

    this.updateGeoData(combinedGeoJSON);
    return of(combinedGeoJSON);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}

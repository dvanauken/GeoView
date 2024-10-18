import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { GeoModel } from '../models/geo-model';
import { AirportService } from './airport.service';
import { AirlineService } from './airline.service';
import { Feature, FeatureCollection } from 'geojson';

@Injectable({
  providedIn: 'root'
})
export class GeoModelService {
  private geoModel: GeoModel;
  private geoModelSubject: BehaviorSubject<GeoModel>;

  constructor(
    private http: HttpClient,
    private airportService: AirportService,
    private airlineService: AirlineService
  ) {
    this.geoModel = new GeoModel({ type: 'FeatureCollection', features: [] });
    this.geoModelSubject = new BehaviorSubject<GeoModel>(this.geoModel);
  }

  getGeoModel(): Observable<GeoModel> {
    return this.geoModelSubject.asObservable();
  }

  loadData(): Observable<GeoModel> {
    return forkJoin({
      airports: this.airportService.loadAirports(),
      airlines: this.airlineService.loadAirlines(),
      geoJSON: this.loadGeoJSON()
    }).pipe(
      switchMap(({ airports, airlines, geoJSON }) => {
        this.geoModel = new GeoModel(geoJSON);
        this.createFeaturesFromAirports(airports);
        this.addAirlineInfoToFeatures(airlines);
        this.geoModelSubject.next(this.geoModel);
        return this.getGeoModel();
      })
    );
  }

  private loadGeoJSON(): Observable<FeatureCollection> {
    return this.http.get<FeatureCollection>('assets/your-geojson-file.json');
  }

  private createFeaturesFromAirports(airports: any[]): void {
    const airportFeatures = airports.map(airport => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [airport.longitude, airport.latitude]
      },
      properties: {
        type: 'airport',
        code: airport.code,
        name: airport.name,
        city: airport.city,
        country: airport.country
      }
    } as Feature));

    this.geoModel.addFeatures(airportFeatures);
  }

  private addAirlineInfoToFeatures(airlines: any[]): void {
    const airlineFeatures = airlines.map(airline => ({
      type: 'Feature',
      geometry: null,
      properties: {
        type: 'airline',
        code: airline.code,
        name: airline.name,
        country: airline.country
      }
    } as Feature));

    this.geoModel.addFeatures(airlineFeatures);
  }

  filterFeatures(filterFunction: (feature: Feature) => boolean): void {
    const filteredFeatures = this.geoModel.features.filter(filterFunction);
    this.geoModel = new GeoModel({
      type: 'FeatureCollection',
      features: filteredFeatures
    });
    this.geoModelSubject.next(this.geoModel);
  }

  updateFeature(id: string | number, updatedProperties: any): void {
    this.geoModel.updateFeature(id, { properties: updatedProperties });
    this.geoModelSubject.next(this.geoModel);
  }

  getFeatureById(id: string | number): Feature | undefined {
    return this.geoModel.getFeatureById(id);
  }

  getFeaturesByProperty(key: string, value: any): Feature[] {
    return this.geoModel.getFeaturesByProperty(key, value);
  }

  addFeature(feature: Feature): void {
    this.geoModel.addFeature(feature);
    this.geoModelSubject.next(this.geoModel);
  }

  removeFeature(id: string | number): void {
    this.geoModel.removeFeature(id);
    this.geoModelSubject.next(this.geoModel);
  }

  getPropertyKeys(): string[] {
    return this.geoModel.getPropertyKeys();
  }

  getBounds(): [number, number, number, number] | null {
    return this.geoModel.getBounds();
  }
}

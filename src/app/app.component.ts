import { Component, OnInit, OnDestroy } from '@angular/core';
import { Feature, FeatureCollection, LineString } from 'geojson';
import { AirportService } from './services/airport.service';
import { AirlineService } from './services/airline.service';
import { createGreatCircleFeature } from './utils/geo-feature.util';
import * as d3 from 'd3';
import { BehaviorSubject, Subscription } from 'rxjs';

interface CityPair {
  al: string;    // Airline code
  base: string;  // Base airport code
  ref: string;   // Reference (destination) airport code
}

@Component({
  selector: 'app-root',
  template: '<app-geo-view [geoData]="geoData$ | async"></app-geo-view>'
})
export class AppComponent implements OnInit, OnDestroy {
  private geoDataSubject = new BehaviorSubject<FeatureCollection | null>(null);
  geoData$ = this.geoDataSubject.asObservable();

  isLoadingCityPairs: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private airportService: AirportService,
    private airlineService: AirlineService
  ) {}

  ngOnInit() {
    this.loadGeoJSON();
    this.loadCityPairData(['XP']); // Load data for ZX airline
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private loadGeoJSON() {
    d3.json('assets/110m/countries.geojson').then((data: any) => {
      const geoData = data as FeatureCollection;
      this.geoDataSubject.next(geoData);
      console.log('GeoData loaded:', geoData);
    }).catch((error) => {
      console.error('Error loading GeoJSON:', error);
    });
  }

  loadCityPairData(airlinesToInclude: string[] = ['XP']) {
    this.isLoadingCityPairs = true;

    d3.json('assets/citypair.20240823.json').then((data: any) => {
      console.log('Raw City Pair Data:', data);

      const cityPairs: CityPair[] = Array.isArray(data) ? data : [];
      console.log(`Total city pairs loaded: ${cityPairs.length}`);

      this.logAirlineCounts(cityPairs);

      const filteredData = this.filterCityPairs(cityPairs, airlinesToInclude);
      console.log(`Filtered city pairs: ${filteredData.length}`);
      console.log('First few filtered city pairs:', filteredData.slice(0, 5));

      const features = this.createFeatures(filteredData);
      console.log(`Created ${features.length} features`);

      this.updateGeoData(features);

      this.isLoadingCityPairs = false;
    }).catch((error) => {
      console.error('Error loading citypair.20240823.json:', error);
      this.isLoadingCityPairs = false;
    });
  }

  private logAirlineCounts(cityPairs: CityPair[]) {
    const airlineCounts = cityPairs.reduce((acc, pair) => {
      acc[pair.al] = (acc[pair.al] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('Airline counts:', airlineCounts);
  }

  private filterCityPairs(cityPairs: CityPair[], airlinesToInclude: string[]): CityPair[] {
    return cityPairs.filter(cityPair => airlinesToInclude.includes(cityPair.al));
  }

  private createFeatures(filteredData: CityPair[]): Feature<LineString>[] {
    return filteredData.map((cityPair, index) => {
      console.log(`Processing city pair ${index}:`, cityPair);
      const feature = createGreatCircleFeature(cityPair, this.airportService, this.airlineService);
      if (!feature) {
        console.warn(`Failed to create feature for city pair:`, cityPair);
      }
      return feature;
    }).filter((f): f is NonNullable<ReturnType<typeof createGreatCircleFeature>> => f !== null);
  }

  private updateGeoData(features: Feature<LineString>[]) {
    const currentGeoData = this.geoDataSubject.value;
    if (currentGeoData) {
      const updatedGeoData: FeatureCollection = {
        ...currentGeoData,
        features: [...currentGeoData.features, ...features]
      };
      this.geoDataSubject.next(updatedGeoData);
    } else {
      const newGeoData: FeatureCollection = {
        type: 'FeatureCollection',
        features: features
      };
      this.geoDataSubject.next(newGeoData);
    }
    console.log('Updated geoData with city pairs:', this.geoDataSubject.value);
  }
}

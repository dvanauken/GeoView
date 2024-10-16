import { Component, OnInit, OnDestroy } from '@angular/core';
import { Feature, FeatureCollection, LineString } from 'geojson';
import { AirportService } from './services/airport.service';
import { AirlineService } from './services/airline.service';
import { createGreatCircleFeature } from './utils/geo-feature.util';
import * as d3 from 'd3';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MapComponent } from './components/geo-view/map/map.component';
import { TableComponent } from './components/geo-view/table/table.component';

interface CityPair {
  al: string;    // Airline code
  base: string;  // Base airport code
  ref: string;   // Reference (destination) airport code
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  geoData$ = new BehaviorSubject<FeatureCollection | null>(null);
  isLoadingCityPairs: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private airportService: AirportService,
    private airlineService: AirlineService
  ) {}

  ngOnInit() {
    console.log('AppComponent initialized');
    this.loadGeoJSON();
    this.loadCityPairData(['1I']); // Load data for XP airline
  }

  ngOnDestroy() {
    console.log('AppComponent destroyed');
    this.subscription.unsubscribe();
  }

  private loadGeoJSON() {
    console.log('Loading GeoJSON data...');
    d3.json('assets/110m/countries.geojson').then((data: any) => {
      console.log('GeoJSON data loaded:', data);
      const geoData = data as FeatureCollection;
      this.geoData$.next(geoData);
    }).catch((error) => {
      console.error('Error loading GeoJSON:', error);
    });
  }

  private loadCityPairData(airlinesToInclude: string[] = ['SU']) {
    console.log('Loading City Pair data...');
    this.isLoadingCityPairs = true;

    d3.json('assets/citypair.20240823.json').then((data: any) => {
      console.log('Raw City Pair Data loaded');
      const cityPairs: CityPair[] = Array.isArray(data) ? data : [];
      console.log(`Total city pairs loaded: ${cityPairs.length}`);

      const filteredData = this.filterCityPairs(cityPairs, airlinesToInclude);
      console.log(`Filtered city pairs: ${filteredData.length}`);

      const features = this.createFeatures(filteredData);
      console.log(`Created ${features.length} features`);

      this.updateGeoData(features);
      this.isLoadingCityPairs = false;
    }).catch((error) => {
      console.error('Error loading City Pair data:', error);
      this.isLoadingCityPairs = false;
    });
  }

  private filterCityPairs(cityPairs: CityPair[], airlinesToInclude: string[]): CityPair[] {
    return cityPairs.filter(cityPair => airlinesToInclude.includes(cityPair.al));
  }

  private createFeatures(filteredData: CityPair[]): Feature<LineString>[] {
    return filteredData.map((cityPair) => {
      const feature = createGreatCircleFeature(cityPair, this.airportService, this.airlineService);
      return feature;
    }).filter((f): f is NonNullable<ReturnType<typeof createGreatCircleFeature>> => f !== null);
  }

  private updateGeoData(features: Feature<LineString>[]) {
    const currentGeoData = this.geoData$.value;
    if (currentGeoData) {
      const updatedGeoData: FeatureCollection = {
        ...currentGeoData,
        features: [...currentGeoData.features, ...features]
      };
      this.geoData$.next(updatedGeoData);
    } else {
      const newGeoData: FeatureCollection = {
        type: 'FeatureCollection',
        features: features
      };
      this.geoData$.next(newGeoData);
    }
  }

  onFeatureSelect(feature: Feature) {
    console.log('Feature selected:', feature);
    // Implement any logic needed when a feature is selected
  }

  onFilterChange(criteria: { filterString: string }) {
    console.log('Filter changed:', criteria);
    // Implement filtering logic here
    // You might want to filter the geoData and update geoData$
  }
}

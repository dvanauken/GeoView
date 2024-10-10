import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
import { Feature, FeatureCollection, LineString } from 'geojson';
import { AirportService } from './services/airport.service';
import { AirlineService } from './services/airline.service';
import * as d3 from 'd3-geo';

@Component({
  selector: 'app-root',
  template: '<app-geo-view [geoData]="geoData"></app-geo-view>'
})
export class AppComponent implements OnInit {
  geoData: FeatureCollection | null = null;
  cityPairData: any[] = [];

  constructor(
    private dataService: DataService,
    private airportService: AirportService,
    private airlineService: AirlineService
  ) {}

  ngOnInit() {
    // Load the main GeoJSON file (countries.geojson)
    this.dataService.loadGeoJSON('assets/110m/countries.geojson').subscribe(
      data => this.geoData = data,
      error => console.error('Error loading GeoJSON:', error)
    );

    // // Load citypair.json and process each row to create a Feature
    // this.dataService.loadJSON('assets/citypair.20240823.json', 'cityPairData').subscribe(
    //   data => {
    //     this.cityPairData = Array.isArray(data) ? data : [];
    //     const features = this.cityPairData.map(cityPair => this.createGreatCircleFeature(cityPair));
    //     this.geoData = {
    //       type: 'FeatureCollection',
    //       features: features.filter(feature => feature !== null) as Feature[]
    //     };
    //   },
    //   error => console.error('Error loading citypair.20240823.json:', error)
    // );
  }

  // Function to create a GeoJSON Feature (Great Circle Path) from citypair data
  createGreatCircleFeature(cityPair: any): Feature<LineString> | null {
    const baseAirport = this.airportService.getAirportByCode(cityPair.base);
    const refAirport = this.airportService.getAirportByCode(cityPair.ref);

    if (!baseAirport || !refAirport) {
      console.error('Airport not found for base or ref:', cityPair.base, cityPair.ref);
      return null;
    }

    const baseCoords: [number, number] = [baseAirport.lon, baseAirport.lat];
    const refCoords: [number, number] = [refAirport.lon, refAirport.lat];

    const greatCircle = d3.geoInterpolate(baseCoords, refCoords);
    const steps = 50;
    const pathCoords = Array.from({ length: steps + 1 }, (_, i) => greatCircle(i / steps));

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: pathCoords
      },
      properties: {
        base: baseAirport.code,
        ref: refAirport.code,
        airline: this.airlineService.getAirlineByCode(cityPair.al)?.name || 'Unknown Airline'
      }
    };
  }
}

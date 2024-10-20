import { Injectable } from '@angular/core';
import { geoInterpolate, geoDistance } from 'd3-geo';
import { Layer } from '../models/layer-model';  // Adjust the path according to your project structure
import { Feature, GeometryObject } from 'geojson';

@Injectable({
  providedIn: 'root'
})
export class RouteLayerService {

  constructor() {}

  // Function to generate great circle route features with dynamic point density
  createRouteLayer(airports: any[], cityPairs: any[], pointsPerUnit = 0.2): Layer {
    const features = this.createFeatures(cityPairs, airports, pointsPerUnit);
    return new Layer(features);
  }

  private createFeatures(cityPairs: any[], airports: any[], pointsPerUnit: number): Feature<GeometryObject>[] {
    const airportMap = this.mapAirportsByCode(airports);
    const features: Feature<GeometryObject>[] = [];
    const unmappableCodes = new Set<string>();

    // Filter city pairs first by airline and then by airport code 'IAH'
    const filteredCityPairs = cityPairs.filter(pair =>
      pair.al === 'UA' && (pair.base === 'DEN' || pair.ref === 'DEN')
    );

    filteredCityPairs.forEach(pair => {
      const baseAirport = airportMap[pair.base];
      const refAirport = airportMap[pair.ref];

      if (!baseAirport || !refAirport) {
        if (!baseAirport) unmappableCodes.add(pair.base);
        if (!refAirport) unmappableCodes.add(pair.ref);
        return;
      }

      const start: [number, number] = [baseAirport.lon, baseAirport.lat];
      const end: [number, number] = [refAirport.lon, refAirport.lat];
      const distance = geoDistance(start, end);
      const numPoints = Math.max(10, Math.ceil(distance * pointsPerUnit * 180 / Math.PI));

      const interpolate = geoInterpolate(start, end);
      const coordinates = Array.from({length: numPoints}, (_, i) => interpolate(i / (numPoints - 1)));

      features.push({
        type: 'Feature',
        properties: {
          name: `${baseAirport.city} to ${refAirport.city}`,
          airline: pair.al
        },
        geometry: {
          type: 'LineString',
          coordinates
        }
      });
    });

    if (unmappableCodes.size > 0) {
      console.log('Unmappable airport codes:', Array.from(unmappableCodes).join(', '));
    }

    return features;
  }

  private mapAirportsByCode(airports: any[]): Record<string, any> {
    return airports.reduce((map, airport) => {
      map[airport.code] = airport;
      return map;
    }, {});
  }
}

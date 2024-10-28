import { Injectable } from '@angular/core';
import { geoInterpolate, geoDistance } from 'd3-geo';
import { Layer } from '../models/layer-model';  // Adjust the path according to your project structure
import { Feature, GeometryObject } from 'geojson';
import {DataModel} from "../models/data-model";

@Injectable({
  providedIn: 'root'
})
export class RouteLayerService {

  private static airports: any[];

  constructor() {
    if (!RouteLayerService.airports) {
      // Assuming getAirports() returns all airport data
      RouteLayerService.airports = DataModel.getInstance().getAirports();
    }
  }

  // Function to generate great circle route features with dynamic point density
  createRouteLayer(cityPairs: any[], pointsPerUnit = 1.0): Layer {
    console.log('Creating route layer...');
    const features = this.createFeatures(cityPairs, pointsPerUnit);
    console.log(`Route layer created with ${features.length} features.`);
    return new Layer(features);
  }

  private createFeatures(cityPairs: any[], pointsPerUnit: number): Feature<GeometryObject>[] {
    console.log('Creating features for route layer...');
    const airportMap = this.mapAirportsByCode(RouteLayerService.airports);
    const features: Feature<GeometryObject>[] = [];
    const unmappableCodes = new Set<string>();

    // Filter city pairs by airline and/or specific conditions
    const filteredCityPairs = cityPairs.filter(pair =>
      pair.al === '3M' || pair.al === 'PA' // Modify or uncomment different filters as needed
    );
    console.log(`Filtered ${filteredCityPairs.length} city pairs out of ${cityPairs.length} total pairs.`);

    filteredCityPairs.forEach((pair, index) => {
      //console.log(`Processing city pair #${index + 1}:`, pair);
      const baseAirport = airportMap[pair.base];
      const refAirport = airportMap[pair.ref];

      if (!baseAirport || !refAirport) {
        if (!baseAirport) unmappableCodes.add(pair.base);
        if (!refAirport) unmappableCodes.add(pair.ref);
        console.warn(`Skipping city pair due to missing airport data: ${pair.base} - ${pair.ref}`);
        return;
      }

      const start: [number, number] = [baseAirport.lon, baseAirport.lat];
      const end: [number, number] = [refAirport.lon, refAirport.lat];
      const distance = geoDistance(start, end);
      //console.log(`Distance between ${pair.base} and ${pair.ref}: ${distance} radians.`);

      const numPoints = Math.max(10, Math.ceil(distance * pointsPerUnit * 180 / Math.PI));
      //console.log(`Number of points for interpolation: ${numPoints}`);

      const interpolate = geoInterpolate(start, end);
      const coordinates = Array.from({ length: numPoints }, (_, i) => interpolate(i / (numPoints - 1)));

      const feature: Feature<GeometryObject> = {
        type: 'Feature',
        id: `${pair.base}-${pair.ref}-${pair.al}`, // Ensure each feature has a unique ID
        properties: {
          id: `${pair.base}-${pair.ref}-${pair.al}`,
          Airline: pair.al,
          Base: baseAirport.code,
          Ref: refAirport.code,
          'City 1': `${baseAirport.city}`,
          'City 2': `${refAirport.city}`,
          'base': `(${baseAirport.lat}, ${baseAirport.lon})`,
          'ref': `(${refAirport.lat}, ${refAirport.lon})`,
        },
        geometry: {
          type: 'LineString',
          coordinates
        }
      };

      console.log(`Generated feature for city pair ${pair.base} - ${pair.ref}:`, feature);
      features.push(feature);
    });

    if (unmappableCodes.size > 0) {
      console.warn('Unmappable airport codes:', Array.from(unmappableCodes).join(', '));
    }
    console.log(`Total features generated: ${features.length}`);
    return features;
  }

  private mapAirportsByCode(airports: any[]): Record<string, any> {
    const airportMap = airports.reduce((map, airport) => {
      map[airport.code] = airport;
      return map;
    }, {});
    console.log(`Mapped ${airports.length} airports by code.`);
    return airportMap;
  }
}

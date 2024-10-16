import { Feature, LineString } from 'geojson';
import * as d3 from 'd3-geo';
import { AirportService } from '../services/airport.service';
import { AirlineService } from '../services/airline.service';


export function createGreatCircleFeature(
  cityPair: any,
  airportService: AirportService,
  airlineService: AirlineService
): Feature<LineString> | null {
  //console.log('Looking up base airport:', cityPair.base);
  const baseAirport = airportService.getAirportByCode(cityPair.base);

  //console.log('Looking up ref airport:', cityPair.ref);
  const refAirport = airportService.getAirportByCode(cityPair.ref);

  if (!baseAirport || !refAirport) {
    //console.error('Airport not found for base or ref:', cityPair.base, cityPair.ref);
    return null;
  }

  const baseCoords: [number, number] = [baseAirport.lon, baseAirport.lat];
  const refCoords: [number, number] = [refAirport.lon, refAirport.lat];

  const greatCircle = d3.geoInterpolate(baseCoords, refCoords);
  const steps = 50;
  const pathCoords = Array.from({ length: steps + 1 }, (_, i) => greatCircle(i / steps));

  const feature: Feature<LineString> = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: pathCoords
    },
    properties: {
      base: baseAirport.code,
      ref: refAirport.code,
      baseName: baseAirport.name,
      refName: refAirport.name,
      airline: airlineService.getAirlineByCode(cityPair.al)?.name || 'Unknown Airline',
      distance: d3.geoDistance(baseCoords, refCoords),
      layer: 'puck'
    }
  };

  return feature;
}

export interface AirportData {
  code: string;          // Airport code (e.g., IATA code)
  region: number;        // Region code or ID, if applicable
  name: string;          // Name of the airport
  city: string;          // City in which the airport is located
  country: string;       // Country in which the airport is located
  lat: number;           // Latitude of the airport
  lon: number;           // Longitude of the airport
}

import { Injectable } from '@angular/core';
import * as d3 from 'd3';  // Import D3

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() {}

  // Method to load GeoJSON using D3
  loadGeoJSON(url: string): Promise<any> {
    return d3.json(url);  // Use D3 to load the GeoJSON data as a promise
  }
}

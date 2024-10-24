import { Injectable } from '@angular/core';
import { FileService } from './file.service';

@Injectable({
  providedIn: 'root'
})
export class AirportService {
  private airportData: any[] = [];
  private readonly cacheKey = 'airportDataCache';

  constructor(private fileService: FileService) {}

  // Load Airport.json into memory and optionally cache it
  loadAirportData(): Promise<void> {
    const cachedData = localStorage.getItem(this.cacheKey);

    if (cachedData) {
      this.airportData = JSON.parse(cachedData);
      console.log('Loaded airport data from local storage cache:', this.airportData);
      return Promise.resolve(); // Data is already loaded from cache
    } else {
      return this.fileService.loadGeoJSON('assets/Airport.json').then((data) => {
        this.airportData = data;
        localStorage.setItem(this.cacheKey, JSON.stringify(data));
        console.log('Airport data loaded from file and stored in memory + cache:', this.airportData);
      }).catch((error) => {
        console.error('Error loading Airport data:', error);
      });
    }
  }

  // Getter for accessing the in-memory airport data
  getAirportData(): any[] {
    return this.airportData;
  }
}

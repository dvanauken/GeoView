import { Component, OnInit } from '@angular/core';
import { FileService } from './services/file.service';
import { DataModel } from './models/data-model';
import { Layer } from './models/layer-model';
import { RouteLayerService } from './services/route-layer-service';
import { AirportService } from './services/airport.service'; // Correct import for AirportService
import { MatTableDataSource } from '@angular/material/table';

interface StatisticsElement {
  category: string;
  value: string | number;
}

// statisticsData: StatisticsElement[] = [];  // Initialize empty
// statisticsData = new MatTableDataSource<StatisticsElement>();

interface AirportData {
  code: string;
  region: number;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoading = true;  // Show the spinner initially
    displayedColumns: string[] = ['code', 'region', 'name', 'city', 'country', 'lat', 'lon'];
    airportData: MatTableDataSource<AirportData>;

  constructor(
    private fileService: FileService,
    private routeLayerService: RouteLayerService,
    private airportService: AirportService  // Inject the AirportService
  ) {}


  async ngOnInit(): Promise<void> {
    try {
      // Load airport data and update the application's data model
      const airports = await this.airportService.loadAirportData();
      this.airportData = new MatTableDataSource(airports);
      console.log('Airport data loaded successfully.');

      // Load countries GeoJSON
      await this.loadGeoJSONFile('countries.geojson');
      console.log('Countries GeoJSON loaded successfully.');

      // Load route data
      await this.loadRouteData();
      console.log('Route data loaded successfully.');
    } catch (error) {
      console.error('Error during initialization:', error);
    } finally {
      this.isLoading = false; // Hide the spinner after all data is loaded or an error occurs
      console.log('Initialization complete');
    }
  }

  private loadGeoJSONFile(fileName: string): Promise<void> {
    const filePath = `assets/110m/${fileName}`;
    return this.fileService.loadGeoJSON(filePath).then(geoData => {
      if (geoData && geoData.features) {
        const layerName = fileName.split('.')[0];
        console.log(`Successfully loaded ${fileName}, adding to DataModel as ${layerName}`);
        DataModel.getInstance().addLayer(layerName, new Layer(geoData.features));
      } else {
        console.error('GeoJSON data is invalid:', geoData);
      }
    }).catch(error => {
      console.error(`Failed to load GeoJSON data from ${fileName}`, error);
      throw error; // Ensure errors are propagated
    });
  }

  private async loadRouteData(): Promise<void> {
    console.log('Starting to load route data...');

    // Retrieve the airport data from DataModel
    const airports = DataModel.getInstance().getAirports();  // Assuming getAirports() returns all airport data

    try {
      // Load city pair data using Fetch API
      const response = await fetch('assets/citypair.20240823.json');
      if (!response.ok) throw new Error('Failed to fetch city pair data');
      const cityPairs = await response.json();
      console.log('City pairs data loaded:', cityPairs);

      // Create route layer
      const routeLayer = this.routeLayerService.createRouteLayer(airports, cityPairs, 5);
      if (routeLayer) {
        console.log('Route layer created successfully:', routeLayer);
        DataModel.getInstance().addLayer('routes', routeLayer);
        console.log('Routes layer added to DataModel.');

        // Log all layers in DataModel after adding routes
        console.log('DataModel layers after adding routes:', DataModel.getInstance().getLayers());
        DataModel.getInstance().setSelectedLayer('routes');
      } else {
        console.error('Failed to create route layer. Route layer is null or undefined.');
      }
    } catch (error) {
      console.error('Error loading route data:', error);
      throw error;  // Rethrow to allow handling at a higher level
    }
  }

}

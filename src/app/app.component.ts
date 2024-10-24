import { Component, OnInit } from '@angular/core';
import { FileService } from './services/file.service';
import { DataModel } from './models/data-model';
import { Layer } from './models/layer-model';
import { RouteLayerService } from './services/route-layer-service';
import { AirportService } from './services/airport.service'; // Correct import for AirportService

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoading = true;  // Show the spinner initially

  constructor(
    private fileService: FileService,
    private routeLayerService: RouteLayerService,
    private airportService: AirportService  // Inject the AirportService
  ) {}

  ngOnInit(): void {
    // Step 1: Load Airport Data
    this.airportService.loadAirportData()
      .then(() => {
        // Log that Airport data is successfully loaded
        console.log('Airport data loaded successfully.');

        // Step 2: Load standard GeoJSON files
        const geojsonFiles = ['countries.geojson']; // List of standard GeoJSON files to load
        return Promise.all(
          geojsonFiles.map(file => {
            console.log('Loading GeoJSON file:', file); // Logging which GeoJSON file is being loaded
            return this.loadGeoJSONFile(file); // Return the promise to ensure it is awaited
          })
        );
      })
      .then(() => {
        // Step 3: Once all GeoJSON files are processed, proceed to load route data
        console.log('GeoJSON files loaded successfully. Proceeding to load route data.');
        return this.loadRouteData();
      })
      .catch((error) => {
        // Catch any errors that occur during the chain
        console.error('Error during initialization:', error);
      })
      .finally(() => {
        // This block runs regardless of success or failure
        console.log('Initialization complete');
        console.log('DataModel layers after initialization:', DataModel.getInstance().getLayers());
        this.isLoading = false;
      });
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

  private loadRouteData(): Promise<void> {
    console.log('Starting to load route data...');

    // Use the in-memory airport data from AirportService
    const airports = this.airportService.getAirportData();

    return this.fileService.loadGeoJSON('assets/citypair.20240823.json')
      .then((cityPairs) => {
        console.log('City pairs data loaded:', cityPairs);
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
      })
      .catch((error) => {
        console.error('Error loading route data:', error);
        throw error; // Propagate error to the main chain
      });
  }
}

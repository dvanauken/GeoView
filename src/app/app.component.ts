import { Component, OnInit } from '@angular/core';
import { FileService } from './services/file.service';
import { DataModel } from './models/data-model';
import { Layer } from './models/layer-model';
import { RouteLayerService } from './services/route-layer-service'; // Ensure this service is properly implemented

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoading = true;  // Show the spinner initially

  constructor(
    private fileService: FileService,
    private routeLayerService: RouteLayerService  // Inject the RouteLayerService
  ) {}

  ngOnInit(): void {
    const geojsonFiles = [
      'countries.geojson',
      'lakes.geojson'
    ]; // List of standard GeoJSON files to load

    Promise.all(geojsonFiles.map(file =>
      this.loadGeoJSONFile(file)
    )).then(() => {
      // Handle additional data after GeoJSON files are processed
      this.loadRouteData();
    }).catch((error) => {
      console.error('Error loading GeoJSON files:', error);
      this.isLoading = false;
    });
  }

  private loadGeoJSONFile(fileName: string): Promise<void> {
    const filePath = `assets/110m/${fileName}`;
    return this.fileService.loadGeoJSON(filePath).then(geoData => {
      if (geoData && geoData.features) {
        const layerName = fileName.split('.')[0];
        DataModel.getInstance().addLayer(layerName, new Layer(geoData.features));
      } else {
        console.error('GeoJSON data is invalid:', geoData);
      }
    }).catch(error => {
      console.error(`Failed to load GeoJSON data from ${fileName}`, error);
    });
  }

  private loadRouteData(): void {
    Promise.all([
      this.fileService.loadGeoJSON('assets/Airport.json'),
      this.fileService.loadGeoJSON('assets/out.20240823.json')
    ]).then(([airports, cityPairs]) => {
      const routeLayer = this.routeLayerService.createRouteLayer(airports, cityPairs, 5); // Adjust point density as needed
      DataModel.getInstance().addLayer('routes', routeLayer);
      this.isLoading = false;
    }).catch((error) => {
      console.error('Error loading route data:', error);
      this.isLoading = false;
    });
  }
}

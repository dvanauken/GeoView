import { Component, OnInit } from '@angular/core';
import { FileService } from './services/file.service';
import { DataModel } from './models/data-model';
import { Layer } from './models/layer-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoading = true;  // Show the spinner initially

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    const files = [
      'countries.geojson',
      'lakes.geojson'
    ]; // List of GeoJSON files to load

    Promise.all(files.map(file =>
      this.loadGeoJSONFile(file)
    )).finally(() => {
      this.isLoading = false;  // Set loading false when all files are loaded or if an error occurs
    });
  }

  private loadGeoJSONFile(fileName: string): Promise<void> {
    const filePath = `assets/110m/${fileName}`;
    return this.fileService.loadGeoJSON(filePath).then(geoData => {
      if (geoData && geoData.features) {
        const layerName = fileName.split('.')[0];  // Use the file name without extension as the layer name
        const layer = new Layer(geoData.features);
        DataModel.getInstance().addLayer(layerName, layer);
      } else {
        console.error('GeoJSON data is invalid:', geoData);
      }
    }).catch(error => {
      console.error(`Failed to load GeoJSON data from ${fileName}`, error);
    });
  }
}

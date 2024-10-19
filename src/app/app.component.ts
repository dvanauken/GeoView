import { Component, OnInit } from '@angular/core';
import { FileService } from './services/file.service';
import { DataModel } from './models/data-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isLoading = true;  // Show the spinner initially

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    // Use D3 to load the GeoJSON data
    this.fileService.loadGeoJSON('assets/110m/countries.geojson').then(
      (geoData) => {
        // Assuming geoData is a GeoJSON FeatureCollection
        DataModel.getInstance().addFeatures(geoData.features);

        // Data loading is done, hide the spinner
        this.isLoading = false;
      },
      (error) => {
        console.error('Failed to load data', error);
        // Handle error, maybe show an error message
      }
    );
  }
}

// app.component.ts
import { Component, OnInit } from '@angular/core';
import { DataService } from "./services/data.service";
import { FeatureCollection } from 'geojson';

@Component({
  selector: 'app-root',
  template: '<app-geo-view [geoData]="geoData"></app-geo-view>'
})
export class AppComponent implements OnInit {
  geoData: FeatureCollection | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.loadGeoJSON('assets/110m/countries.geojson').subscribe(
      data => this.geoData = data,
      error => console.error('Error loading GeoJSON:', error)
    );
  }
}

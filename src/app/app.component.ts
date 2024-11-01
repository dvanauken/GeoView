import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from "@angular/material/table";
import { DataService } from './services/data.service';
import { Feature, LineString, FeatureCollection } from 'geojson';
import { Layer } from './models/layer';
import { AirportService } from './services/airport.service'; // Import AirportService
import { Resources } from './services/resources'; // Import AirportService
import { AirportData } from './interfaces/airport-data.interface';
import { Observable } from 'rxjs';
import * as Papa from 'papaparse';
//import { LoadResult, ErrorResult, LoadConfig, LayerService } from './services/layer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Airport and Route Manager';
  isLoading = true;  // Show the spinner initially
  displayedColumns: string[] = ['code', 'region', 'name', 'city', 'country', 'lat', 'lon'];
  airportData = new MatTableDataSource<AirportData>([]);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  countries: Layer | null = null;
  routes: Layer | null = null;
  airports: Layer | null = null;
  selectedFeatures$: Observable<Feature[]>;
  layers: Layer[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    //private layerService: LayerService,
    private airportService: AirportService, // Inject AirportService
  ) {
    this.selectedFeatures$ = this.dataService.getSelectedFeatures();
    //this.airportData = new MatTableDataSource<AirportData>([]);
  }

  ngOnInit(): void {
    (async () => {
      try {
        const airports = await Resources.load(["assets/Airport.json"]);
        console.log('airports.loaded:', airports[0].data);
        this.dataService.setAirports(airports[0].data);
        const files = await Resources.load(['assets/110m/countries.geojson', 'assets/routes.json', 'assets/pa.csv']);
        files.forEach(({ data, path }) => {
          if (path.endsWith('countries.geojson')) {
            this.dataService.addLayer('countries', new Layer('FeatureCollection', data.features || data));
            console.log("countries.geojson:path=" + path + ", data=" + data.features);
          } else if (path.endsWith('routes.json')) {
            // Ensure `airports[0].data` contains airport data for lookups
            const airportData = airports[0].data;

            // Create GeoJSON features for routes based on base and ref lookups using map and filter
            const features = data
              .filter((route: { al: string }) => route.al === 'F9') // Filter for routes with `al: F9`
              .map((route: { base: string; ref: string }) => {
                // Find the base and ref coordinates from airportData
                const baseAirport = airportData.find((airport: any) => airport.code === route.base);
                const refAirport = airportData.find((airport: any) => airport.code === route.ref);

                // Return a feature if both airports are found; otherwise, return null
                return (baseAirport && refAirport) ? {
                  type: 'Feature',
                  properties: { base: route.base, ref: route.ref },
                  geometry: {
                    type: 'LineString',
                    coordinates: [
                      [baseAirport.lon, baseAirport.lat],
                      [refAirport.lon, refAirport.lat]
                    ]
                  }
                } : null;
              })
              .filter(feature => feature !== null) as GeoJSON.Feature[]; // Filter out null values

//             // Reduce features array into a GeoJSON FeatureCollection
//             const layer = features.reduce((collection, feature) => {
//               collection.features.push(feature);
//               return collection;
//             }, { type: 'FeatureCollection', features: [] });

            // Add the new layer to the data service
            this.dataService.addLayer('routes', new Layer("routes", features));

            console.log("routes.json:path=" + path + ", data loaded and structured as GeoJSON FeatureCollection");
            console.log("routes.json:path=" + path + ", data=" + data)
          }
          else if (path.endsWith('pa.csv')) {
            console.log("pa.csv:path=" + path + ", data=" + data);

            // Create an airport lookup map
            const airportMap = new Map(
              airports[0].data.map(airport => [
                airport.code,
                [airport.lon, airport.lat]
              ])
            );

            console.log('Sample of airportMap:', Array.from(airportMap.entries()).slice(0, 3));
            console.log('Filtered data sample:', data.filter(row => row['origin'] && row['destination']).slice(0, 3));

            // Transform data to features
            const features = data
              .filter(row => row['origin'] && row['destination'])
              .map(row => {
                const origin = airportMap.get(row['origin']);
                const destination = airportMap.get(row['destination']);

                if (!origin || !destination) {
                  return null;
                }

                return {
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: [origin, destination]
                  },
                  properties: {
                    airline: 'pa',
                    base: row['origin'],
                    ref: row['destination'],
                    originCoords: origin,
                    destinationCoords: destination
                  }
                };
              })
              .filter(feature => feature !== null);

//               const layer = features.reduce((collection, feature) => {
//                 collection.features.push(feature);
//                 return collection;
//               }, { type: 'FeatureCollection', features: [] });

              // Add the new layer to the data service
              this.dataService.addLayer('pa', new Layer("pa", features));

            console.log('First 3 transformed features:', features.slice(0, 3));
            return features;
          }
        });
        console.log('All resource loading completed.');
        this.isLoading = false;
      } catch (err) {
        console.error('An error occurred during loading:', err);
        this.isLoading = false;
      }
    })();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.paginator) {
        this.airportData.paginator = this.paginator;
        this.cdr.detectChanges();
        console.log("Paginator linked successfully");
      } else {
        console.warn("Paginator not found");
      }
    });
  }

  onTabChange(event: any): void {
    if (event.index === 1) { // Airport tab index
      setTimeout(() => {
        if (this.paginator) {
          this.airportData.paginator = this.paginator;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onLayerSelect(layerName: string): void {
    this.dataService.setSelectedLayer(layerName);
  }
}

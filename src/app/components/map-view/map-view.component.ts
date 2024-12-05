import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from "@angular/material/table";
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Feature, LineString, FeatureCollection } from 'geojson';
import { Observable } from 'rxjs';
import * as Papa from 'papaparse';
//import { TableConfig } from '@dvanauken/ixtlan';
import { TableConfig } from '@dvanauken/ixtlan/dist/ixtlan';
import { ITabContent, ITabsetConfig } from '@dvanauken/ixtlan/dist/ixtlan';
import { AirportData } from 'src/app/interfaces/airport-data.interface';
import { DataService } from 'src/app/services/data.service';
import { Resources } from 'src/app/services/resources';
import { Layer } from 'src/app/models/layer';
import { DataProvider } from './data.provider';


@Component({
  selector: 'map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  title = 'Airport and Route Manager';
  isLoading = true;
  displayedColumns: string[] = ['code', 'region', 'name', 'city', 'country', 'lat', 'lon'];
  //airportData = new MatTableDataSource<AirportData>([]);
  airportData: AirportData[] = [];
  countries: Layer | null = null;
  routes: Layer | null = null;
  airports: Layer | null = null;
  selectedFeatures$: Observable<Feature[]>;
  layers: Layer[] = [];
  formatCoord = (coord: number) => coord.toFixed(1);



  matrixColumnConfigs = this.dataProvider.getAirportColumnConfigs();


  tableConfig: TableConfig<AirportData> = {
    columns: [
      { key: 'code', header: 'Code' },
      { key: 'name', header: 'Name' },
      { key: 'city', header: 'City' },
      { key: 'country', header: 'Country' },
      { key: 'lat', header: 'Latitude' },
      { key: 'lon', header: 'Longitude' }
    ],
    selectionMode: 'multiple',
    allowAdd: false,
    allowEdit: false,
    allowDelete: false
  };


  tabConfig: ITabsetConfig = {
    showNotificationBand: true,
    notificationText: '🗺️ GeoView Navigation',
    animationDuration: 300
  };

  tabs: ITabContent[] = [
    {
      id: 'map',
      title: 'Map',
      content: '',
      active: true
    },
    {
      id: 'airports',
      title: 'Airports',
      content: '',
      active: false
    },
    {
      id: 'style',
      title: 'Style Editor',
      content: '',
      active: false
    }
  ];






  constructor(
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    public dataProvider: DataProvider,
  ) {
    this.selectedFeatures$ = this.dataService.getSelectedFeatures();
  }

  ngOnInit(): void {
    (async () => {
      try {
        const loadedData = await Resources.load(["assets/Airport.json"]);
        if (loadedData.length === 0 || !loadedData[0].data) {
          throw new Error('Invalid airport data structure');
        }

        this.dataService.setAirports(loadedData[0].data);
        console.log('Airports loaded and set in DataService.');

        this.airportData = this.dataService.getAirports();

        //this.airportData = new MatTableDataSource<AirportData>(this.dataService.getAirports());
        //console.log('Loaded airport data for display:', this.airportData.data);

        const files = await Resources.load(['assets/110m/countries.geojson', 'assets/routes.json', 'assets/pa.csv']);
        files.forEach(({ data, path }) => {
          if (path.endsWith('countries.geojson')) {
            this.dataService.addLayer('countries', new Layer('FeatureCollection', data.features || data));
            console.log("countries.geojson:path=" + path + ", data=" + data.features.length);
          } else if (path.endsWith('routes.json')) {
            // Ensure `airports[0].data` contains airport data for lookups
            //const airportData = airports[0].data;

            const hubs = ['ATL', 'SLC', 'MSP', 'DTW', 'JFK', 'AUS', 'CVG', 'LAX', 'SEA', 'BOS', 'LGA', 'DCA', 'RDU', 'DFW']; // List of DL hubs

            // Create GeoJSON features for routes based on base and ref lookups using map and filter
            const features = data
              .filter((route: { al: string }) => route.al === 'DL') // Filter for routes with `al: DL`
              .filter((route: { base: string; ref: string }) => !hubs.includes(route.base) && !hubs.includes(route.ref)) // Exclude routes with hubs as base or ref
              .map((route: { base: string; ref: string; al: string }) => {
                // Find the base and ref coordinates from airportData
                const baseAirport = this.dataService.getAirports().find((airport: any) => airport.code === route.base);
                const refAirport = this.dataService.getAirports().find((airport: any) => airport.code === route.ref);

                // Return a feature if both airports are found; otherwise, return null
                return (baseAirport && refAirport) ? {
                  type: 'Feature',
                  id: `${route.base}-${route.ref}-${route.al}`, // Ensure each feature has a unique ID
                  geometry: {
                    type: 'LineString',
                    coordinates: [
                      [baseAirport.lon, baseAirport.lat],
                      [refAirport.lon, refAirport.lat]
                    ]
                  },
                  properties: {
                    id: `${route.base}-${route.ref}-${route.al}`, // Ensure each feature has a unique ID
                    Airline: route.al,
                    base: route.base,
                    ref: route.ref,
                    'City 1': `${baseAirport.city}`,
                    'City 2': `${refAirport.city}`,
                    'Coords 1': [this.formatCoord(baseAirport.lon), this.formatCoord(baseAirport.lat)],
                    'Coords 2': [this.formatCoord(refAirport.lon), this.formatCoord(refAirport.lat)]

                  },
                } : null;
              })
              .filter(feature => feature !== null) as GeoJSON.Feature[]; // Filter out null values

            this.dataService.addLayer('routes', new Layer("routes", features));
          }
          else if (path.endsWith('pa.csv')) {
            console.log("pa.csv:path=" + path + ", data=" + data.length);

            // Print sample data for verification
            console.log('Filtered data sample:', data.filter(row => row['origin'] && row['destination']).slice(0, 3));

            const cityPairSet = new Set();
            const features = data
              .filter(row => row['origin'] && row['destination'])
              .map(row => {
                const base = (row['origin'] < row['destination']) ? row['origin'] : row['destination'];
                const ref = (row['origin'] < row['destination']) ? row['destination'] : row['origin'];

                // Ensure base and ref are not the same
                if (base === ref) {
                  return null;
                }

                // Create a unique key for the city pair
                const pairKey = `${base}-${ref}-PA`;  // Include airline in uppercase in the key
                if (cityPairSet.has(pairKey)) {
                  return null; // Skip if the pair already exists
                }
                cityPairSet.add(pairKey);

                // Get the airport data directly from DataService
                const baseAirport = this.dataService.getAirport(base);
                const refAirport = this.dataService.getAirport(ref);

                // Ensure both coordinates are valid
                if (!baseAirport || !refAirport) {
                  return null;
                }

                // const originCoords = ;
                // const destinationCoords = ;

                return {
                  type: 'Feature',
                  id: pairKey,  // Assign the unique pair key with the airline as the id
                  geometry: {
                    type: 'LineString',
                    coordinates: [[baseAirport.lon, baseAirport.lat], [refAirport.lon, refAirport.lat]]
                  },
                  properties: {
                    id: pairKey,
                    Airline: 'PA',
                    base: base,
                    ref: ref,
                    'City 1': baseAirport.city,
                    'City 2': refAirport.city,
                    'Coords 1': [this.formatCoord(baseAirport.lon), this.formatCoord(baseAirport.lat)],
                    'Coords 2': [this.formatCoord(refAirport.lon), this.formatCoord(refAirport.lat)]
                  }
                };
              })
              .filter(feature => feature !== null)
              .sort((a, b) => a.id.localeCompare(b.id));  // Sort features by id in alphabetical order

            // Print the sorted features for verification
            console.log('Sorted Features:', features.length);

            // Optional: Add the features to DataService as a new layer
            this.dataService.addLayer('PA', new Layer("PA", features));
          }
        });
        //console.log('All resource loading completed.');
        this.dataService.setSelectedLayer("routes");

        this.isLoading = false;
      } catch (err) {
        //console.error('An error occurred during loading:', err);
        this.isLoading = false;
      }
    })();
  }

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   if (this.paginator) {
    //     //this.airportData.paginator = this.paginator;
    //     this.cdr.detectChanges();
    //     console.log("Paginator linked successfully");
    //   } else {
    //     console.warn("Paginator not found");
    //   }
    // });
  }

  // onTabChange(event: any): void {
  //   if (event.index === 1) { // Airport tab index
  //     setTimeout(() => {
  //       if (this.paginator) {
  //         //this.airportData.paginator = this.paginator;
  //         this.cdr.detectChanges();
  //       }
  //     });
  //   }
  // }

  onLayerSelect(layerName: string): void {
    this.dataService.setSelectedLayer(layerName);
  }

  onTabChange(tab: ITabContent): void {
    if (tab.id === 'airports') {
      setTimeout(() => {
        if (this.paginator) {
          this.cdr.detectChanges();
        }
      });
    }
  }
}
import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { FileService } from './services/file.service';
import { DataModel } from './models/data-model';
import { Layer } from './models/layer-model';
import { RouteLayerService } from './services/route-layer-service';
import { AirportService } from './services/airport.service';
import {MatTableDataSource} from "@angular/material/table";
import {FlightData} from "./interfaces/flight-data.interface"; // Correct import for AirportService
import * as Papa from 'papaparse';


interface StatisticsElement {
  category: string;
  value: string | number;
}

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
export class AppComponent implements OnInit, AfterViewInit {
  isLoading = true;  // Show the spinner initially
  displayedColumns: string[] = ['code', 'region', 'name', 'city', 'country', 'lat', 'lon'];
  airportData = new MatTableDataSource<AirportData>([]);

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(
    private cdr: ChangeDetectorRef,
    private fileService: FileService,
    private routeLayerService: RouteLayerService,
    private airportService: AirportService  // Inject the AirportService
  ) {
    this.airportData = new MatTableDataSource<AirportData>([]);
  }


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

      // Load PanAm route data
      await this.loadPanAm('assets/PanAm19840429.csv');
      console.log('PanAm route data loaded successfully.');

      DataModel.getInstance().setSelectedLayer("panam");

    } catch (error) {
      console.error('Error during initialization:', error);
    } finally {
      this.isLoading = false; // Hide the spinner after all data is loaded or an error occurs
      console.log('Initialization complete');
    }
  }

  ngAfterViewInit() {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
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

  // Add tab change handler
  onTabChange(event: any) {
    if (event.index === 1) { // Airport tab index
      setTimeout(() => {
        if (this.paginator) {
          this.airportData.paginator = this.paginator;
          this.cdr.detectChanges();
        }
      });
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
      //console.log('City pairs data loaded:', cityPairs);

      // Create route layer
      const routeLayer = this.routeLayerService.createRouteLayer(airports, cityPairs, 5);
      if (routeLayer) {
        console.log('Route layer created successfully:', routeLayer);
        DataModel.getInstance().addLayer('routes', routeLayer);
        console.log('Routes layer added to DataModel.');

        // Log all layers in DataModel after adding routes
        console.log('DataModel layers after adding routes:', DataModel.getInstance().getLayers());
        //DataModel.getInstance().setSelectedLayer('routes');
      } else {
        console.error('Failed to create route layer. Route layer is null or undefined.');
      }
    } catch (error) {
      console.error('Error loading route data:', error);
      throw error;  // Rethrow to allow handling at a higher level
    }
  }

  private async loadPanAm(filePath: string): Promise<void> {
    console.log('Starting to load PanAm route data from:', filePath);

    // Retrieve the airport data from DataModel
    const airports = DataModel.getInstance().getAirports();  // Assuming getAirports() returns all airport data
    //console.log('Retrieved airport data:', airports);

    try {
      // Load city pair data using Fetch API
      const response = await fetch(filePath);
      if (!response.ok) throw new Error('Failed to fetch PanAm route data');
      const csvText = await response.text();
      console.log('CSV file content loaded successfully:', csvText.slice(0, 200) + '...'); // Output a preview of the CSV content

      // Parse CSV using PapaParse
      const flightDataList: FlightData[] = Papa.parse<FlightData>(csvText, {
        header: true,
        skipEmptyLines: true,
      }).data;
      //console.log('Parsed flight schedule data:', flightDataList);

      // Reduce flight data to unique city pairs
      const uniqueCityPairs = new Map<string, { base: string; ref: string; al: string }>();

      const cityPairs = Array.from(
        flightDataList
          // 1. Filter: Keep only flights that have both origin and destination defined.
          .filter(flight => flight.origin && flight.destination)

          // 2. Map: Transform each flight into a city-pair object, including:
          // - A unique `key` (sorted combination of origin and destination to avoid duplicates).
          // - The `base` (origin), `ref` (destination), and `al` (airline).
          .map(flight => ({
            key: [flight.origin, flight.destination].sort().join('-'), // Unique key to identify the city pair
            base: flight.origin,
            ref: flight.destination,
            al: 'PA' // Assuming PanAm as the airline code
          }))

          // 3. Reduce: Iterate over all city-pair objects and add only unique pairs to a Map.
          // The `key` helps avoid duplicates (e.g., both "A-B" and "B-A" would have the same key).
          .reduce((acc, { key, base, ref, al }) => {
            if (!acc.has(key)) {
              acc.set(key, { base, ref, al });
            }
            return acc;
          }, new Map())

          // 4. Convert Map values to an array.
          .values()
      );
      // flightDataList.forEach((flight, index) => {
      //   //console.log(`Processing flight record #${index + 1}:`, flight);
      //   if (flight.origin && flight.destination) {
      //     const key = [flight.origin, flight.destination].sort().join('-');  // Use sorted key to avoid duplicate reverse pairs
      //     //console.log('Generated unique key for city pair:', key);
      //     if (!uniqueCityPairs.has(key)) {
      //       uniqueCityPairs.set(key, {
      //         base: flight.origin,
      //         ref: flight.destination,
      //         al: 'PA' // Assuming PanAm as the airline code
      //       });
      //       //console.log('City pair added:', key);
      //     } else {
      //       //console.log('City pair already exists, skipping:', key);
      //     }
      //   } else {
      //     console.warn('Flight record missing origin or destination:', flight);
      //   }
      // });
      //
      //// Convert Map to Array for use in createRouteLayer
      //const cityPairs = Array.from(uniqueCityPairs.values());
      //console.log('Unique city pairs to be used for route layer:', cityPairs);

      // Create route layer
      const routeLayer = this.routeLayerService.createRouteLayer(airports, cityPairs, 5);
      if (routeLayer) {
        console.log('Route layer created successfully:', routeLayer);
        DataModel.getInstance().addLayer('panam', routeLayer);
        console.log('Routes layer added to DataModel.');

        // Log all layers in DataModel after adding routes
        console.log('DataModel layers after adding routes:', DataModel.getInstance().getLayers());
        //DataModel.getInstance().setSelectedLayer('routes');
        console.log('Selected layer set to routes.');
      } else {
        console.error('Failed to create route layer. Route layer is null or undefined.');
      }
    } catch (error) {
      console.error('Error loading PanAm route data:', error);
      throw error;  // Rethrow to allow handling at a higher level
    }
  }



}

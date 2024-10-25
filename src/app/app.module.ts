import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// GeoView Components
import { MapComponent } from './components/map/map.component';
import { TableComponent } from './components/table/table.component';

import { AirportService } from './services/airport.service';
import { AirlineService } from './services/airline.service';
import { PaneModule } from './components/pane/pane.module';

import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';

// export function preloadData(
//   airportService: AirportService,
//   airlineService: AirlineService
// ) {
//   return () =>
//     Promise.all([
//       airportService.loadAirports().toPromise().then(() => {
//         console.log('Airports preloaded successfully');
//       }),
//       airlineService.loadAirlines().toPromise().then(() => {
//         console.log('Airlines preloaded successfully');
//       })
//     ]);
// }
// Function to preload data
//export function preloadData(geoModelService: GeoModelService) {
//  return () => geoModelService.loadData().toPromise();
//}

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    TableComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    PaneModule,
    MatTabsModule,
    MatTableModule
  ],
  providers: [
    // AirportService,
    // AirlineService,
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: preloadData,
    //   deps: [AirportService, AirlineService],
    //   multi: true,
    // },
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}

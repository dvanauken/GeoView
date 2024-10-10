import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';

// GeoView Components
import { GeoViewComponent } from './components/geo-view/geo-view.component';
import { MapComponent } from './components/geo-view/map/map.component';
import { TableComponent } from './components/geo-view/table/table.component';
import { LayersComponent } from './components/geo-view/layers/layers.component';
import { SliderComponent } from './components/geo-view/slider/slider.component';

import { AirportService } from './services/airport.service';
import { AirlineService } from './services/airline.service';

// Function to preload airport and airline data
// Function to preload airport and airline data
export function preloadData(
  airportService: AirportService,
  airlineService: AirlineService
) {
  return () =>
    Promise.all([
      airportService.loadAirports().toPromise().then(() => {
        console.log('Airports preloaded successfully');
      }),
      airlineService.loadAirlines().toPromise().then(() => {
        console.log('Airlines preloaded successfully');
      })
    ]);
}


@NgModule({
  declarations: [
    AppComponent,
    GeoViewComponent,
    MapComponent,
    TableComponent,
    LayersComponent,
    SliderComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
  ],
  providers: [
    AirportService,
    AirlineService,
    {
      provide: APP_INITIALIZER,
      useFactory: preloadData,
      deps: [AirportService, AirlineService],
      multi: true,
    },
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}

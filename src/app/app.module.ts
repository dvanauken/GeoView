import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

// GeoView Components
import { MapComponent } from './components/map/map.component';
import { TableComponent } from './components/table/table.component';

//import { AirportService } from './services/airport.service';
import { DataService } from './services/data.service';
//import { RouteService } from './services/route.service';

import { PaneModule } from './components/pane/pane.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { AirportTableComponent } from './components/airport-table/airport-table.component';
import { StyleEditorComponent } from './components/style-editor/style-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    TableComponent,
    AirportTableComponent,
    StyleEditorComponent
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
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    BrowserAnimationsModule // Needed for animations
  ],
  providers: [
    //AirportService,
    DataService
    //RouteService
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}

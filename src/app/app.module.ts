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
import { MapViewComponent } from './components/map-view/map-view.component';  // Make sure this is imported
import { TableComponent } from './components/table/table.component';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DataService } from './services/data.service';

import { PaneModule } from './components/pane/pane.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { AirportTableComponent } from './components/airport-table/airport-table.component';
import { StyleEditorComponent } from './components/style-editor/style-editor.component';

import { CommonModule } from '@angular/common';
import { IxtTableModule, IxtTabsetModule  } from '@dvanauken/ixtlan/dist/ixtlan';

import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';

import { RouterModule } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    TableComponent,
    AirportTableComponent,
    StyleEditorComponent,
    LoginComponent,
    MapViewComponent,
    MainLayoutComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    BrowserModule,
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
    MatTooltipModule,
    BrowserAnimationsModule,
    IxtTableModule,
    IxtTabsetModule
  ],
  providers: [
    DataService,
    AuthService,
    AuthGuard
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}

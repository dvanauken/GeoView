import { NgModule } from '@angular/core';
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

@NgModule({
  declarations: [
    AppComponent,
    GeoViewComponent,
    MapComponent,
    TableComponent,
    LayersComponent,
    SliderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

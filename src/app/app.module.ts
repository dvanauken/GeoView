import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { MapComponent } from './components/map/map.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { TableComponent } from './components/table/table.component';
import { DataService } from './services/data.service';
import { PaneModule } from './components/pane/pane.module';
import { AirportTableComponent } from './components/airport-table/airport-table.component';
import { StyleEditorComponent } from './components/style-editor/style-editor.component';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { PasswordComponent } from './components/identity/password/password.component';
import { UsernameComponent } from './components/identity/username/username.component';
import { ProfileComponent } from './components/identity/profile/profile.component';
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { IxtTableModule, IxtTabsetModule } from '@dvanauken/ixtlan/dist/ixtlan';
import { UserDetailComponent } from './components/admin/user-detail/user-detail.component';
import { UsersComponent } from './components/admin/users/users.component';
import { RoleDetailComponent } from './components/admin/role-detail/role-detail.component';
import { RolesComponent } from './components/admin/roles/roles.component';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    TableComponent,
    AirportTableComponent,
    StyleEditorComponent,
    LoginComponent,
    MapViewComponent,
    MainLayoutComponent,
    UsernameComponent,
    PasswordComponent,
    ProfileComponent,
    UsernameComponent,
    UsersComponent,
    UserDetailComponent,
    RolesComponent,
    RoleDetailComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AppRoutingModule,
    PaneModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatTooltipModule,
    IxtTableModule,
    IxtTabsetModule
  ],
  providers: [
    DataService,
    AuthService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
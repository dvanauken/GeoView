import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeoViewComponent } from './components/geo-view/geo-view.component';

const routes: Routes = [
  { path: 'geo-view', component: GeoViewComponent },
  { path: '', redirectTo: '/geo-view', pathMatch: 'full' },
  { path: '**', redirectTo: '/geo-view' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

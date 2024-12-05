// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { AuthGuard } from './guards/auth.guard';
import { PasswordComponent } from './components/identity/password/password.component';
import { ProfileComponent } from './components/identity/profile/profile.component';
import { UsernameComponent } from './components/identity/username/username.component';
import { UsersComponent } from './components/admin/users/users.component';
import { UserDetailComponent } from './components/admin/user-detail/user-detail.component';
import { RoleDetailComponent } from './components/admin/role-detail/role-detail.component';
import { RolesComponent } from './components/admin/roles/roles.component';
import { PerspectiveComponent } from './components/perspective/perspective.component';
import { PasswordResetComponent } from './components/identity/password-reset/password-reset.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'map', component: MapViewComponent },
      { path: 'admin/users', component: UsersComponent, canActivate: [AuthGuard] },
      { path: 'admin/users/:id', component: UserDetailComponent, canActivate: [AuthGuard] },
      { path: 'admin/roles', component: RolesComponent, canActivate: [AuthGuard] },
      { path: 'admin/roles/:id',  component: RoleDetailComponent, canActivate: [AuthGuard] },
      { path: 'perspective', component: PerspectiveComponent, canActivate: [AuthGuard] }, // Fixed typo in 'perspective'

      { path: 'logout', redirectTo: '/login', pathMatch: 'full' }
    ]
  },
  { path: 'identity/profile', component: ProfileComponent }, // Route for user registration
  { path: 'identity/password', component: PasswordComponent }, // Route for password reset
  { path: 'identity/username', component: UsernameComponent }, // Route for username assistance
  { path: 'identity/password-reset', component: PasswordResetComponent }, // New route
  { path: '**', redirectTo: '/login', pathMatch: 'full' } // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Define public routes that don't require authentication
    const publicRoutes = ['/login', '/identity/profile', '/identity/password', '/identity/username'];
    
    // Check if the current route is in public routes
    if (publicRoutes.some(route => state.url.startsWith(route))) {
      return true;
    }

    // Check if user is authenticated
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Not authenticated and not a public route, redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}
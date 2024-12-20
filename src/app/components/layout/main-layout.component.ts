// main-layout.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AsideService } from '../../services/aside.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  content$ = this.asideService.getContent();
  isVisible$ = this.asideService.getVisibility();

  constructor(
    private authService: AuthService,
    private asideService: AsideService
  ) {}
  
  logout() {
    this.authService.logout();
  }

  toggleAside() {
    this.asideService.toggleVisibility();
  }
}
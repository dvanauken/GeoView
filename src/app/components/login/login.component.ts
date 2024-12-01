// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = 'admin';
  password: string = 'admin';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.login(this.username, this.password);
  }
}
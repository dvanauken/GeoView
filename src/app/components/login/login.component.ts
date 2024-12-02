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
  errorMessage: string = ''; // To store the error message

  constructor(private authService: AuthService) {}

  onSubmit() {
    // Simulate login validation
    if (this.username !== 'correctUsername' || this.password !== 'correctPassword') {
      this.errorMessage = 'Username and/or password is not correct.'; // Set error message
      this.username = ''; // Clear username
      this.password = ''; // Clear password
    } else {
      this.errorMessage = ''; // Clear error message if login is successful
      this.authService.login(this.username, this.password);
    }
  }
}

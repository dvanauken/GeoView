// profile.component.ts
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  @ViewChild('registrationForm') registrationForm!: NgForm;
  
  username = '';
  email = '';
  firstName = '';
  middleInitial = '';
  lastName = '';
  errorMessages: string[] = [];
  successMessage = '';

  constructor(private router: Router) {}

  onSubmit() {
    this.errorMessages = [];
    this.successMessage = '';

    // Validate fields
    if (!this.username) {
      this.errorMessages.push('Username is required.');
    }

    if (!this.email) {
      this.errorMessages.push('Email is required.');
    }

    if (!this.firstName || !this.lastName) {
      this.errorMessages.push('First and last name are required.');
    }

    // Simulate username availability check
    if (this.username.toLowerCase() === 'admin') {
      this.errorMessages.push('This username is not available. Please choose another.');
      return;
    }

    // If no errors, proceed with registration
    if (this.errorMessages.length === 0) {
      // TODO: Implement actual registration logic here
      this.successMessage = 'Registration successful! Please check your email for confirmation.';
      
      // Reset form after successful submission
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  onCancel() {
    this.router.navigate(['/login']);
  }
}
// username.component.ts
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-username',
  templateUrl: './username.component.html',
  styleUrls: ['./username.component.scss']
})
export class UsernameComponent {
  @ViewChild('usernameForm') usernameForm!: NgForm;
  
  email = '';
  errorMessages: string[] = [];
  successMessage = '';

  constructor(private router: Router) {}

  onSubmit() {
    this.errorMessages = [];
    this.successMessage = '';

    if (!this.email) {
      this.errorMessages.push('Email address is required.');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessages.push('Please enter a valid email address.');
      return;
    }

    // Success message intentionally vague for security
    this.successMessage = 'If an account exists for this email address, you will receive your username recovery instructions shortly.';
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }

  onCancel() {
    this.router.navigate(['/login']);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }
}
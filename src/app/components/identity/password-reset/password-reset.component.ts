// src/app/components/identity/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  errorMessages: string[] = [];
  successMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.createPasswordStrengthValidator()
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.errorMessages = ['Invalid or expired password reset link'];
    }
  }

  createPasswordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;

      if (!password) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

      return !passwordValid ? { passwordStrength: true } : null;
    };
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  getPasswordErrors(): string[] {
    const errors: string[] = [];
    const password = this.resetForm.get('password');

    if (password?.errors && (password.dirty || password.touched)) {
      if (password.errors['required']) {
        errors.push('Password is required');
      }
      if (password.errors['minlength']) {
        errors.push('Password must be at least 8 characters');
      }
      if (password.errors['passwordStrength']) {
        errors.push('Password must include: uppercase letter, lowercase letter, number, and special character');
      }
    }

    if (this.resetForm.errors?.['passwordMismatch'] && 
        this.resetForm.get('confirmPassword')?.touched) {
      errors.push('Passwords must match');
    }

    return errors;
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      // Here you would call your service to update the password
      console.log('Password reset submitted');
      this.successMessage = 'Password successfully reset.';
      
      // Redirect to login after success
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } else {
      this.resetForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    if (this.resetForm.dirty) {
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}


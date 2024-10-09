import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material modules (uncomment and add as needed)
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSelectModule } from '@angular/material/select';
// import { MatTableModule } from '@angular/material/table';

// Custom components
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

// Custom directives
import { ClickOutsideDirective } from './directives/click-outside.directive';

// Custom pipes
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

@NgModule({
  declarations: [
    // Components
    LoadingSpinnerComponent,
    ConfirmDialogComponent,

    // Directives
    ClickOutsideDirective,

    // Pipes
    SafeHtmlPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // Material modules
    // MatButtonModule,
    // MatIconModule,
    // MatInputModule,
    // MatFormFieldModule,
    // MatSelectModule,
    // MatTableModule
  ],
  exports: [
    // Modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // Material modules
    // MatButtonModule,
    // MatIconModule,
    // MatInputModule,
    // MatFormFieldModule,
    // MatSelectModule,
    // MatTableModule,

    // Components
    LoadingSpinnerComponent,
    ConfirmDialogComponent,

    // Directives
    ClickOutsideDirective,

    // Pipes
    SafeHtmlPipe
  ]
})
export class SharedModule { }

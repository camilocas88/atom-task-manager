import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../../core/services/auth.service';
import { WelcomeDialogComponent } from '../../components/welcome-dialog/welcome-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const email = this.loginForm.value.email!;
      
      this.authService.login(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Login response:', response);
          console.log('Is new user?', response.isNew);
          
          if (response.isNew) {
            // Show welcome dialog for new users
            console.log('Showing welcome dialog for new user');
            const dialogRef = this.dialog.open(WelcomeDialogComponent, {
              data: { user: response.user },
              disableClose: false,
              width: '500px',
              panelClass: 'welcome-dialog-container'
            });
            
            dialogRef.afterClosed().subscribe(() => {
              console.log('Dialog closed, navigating to /tasks');
              this.navigateToTasks();
            });
          } else {
            // Existing user - go directly to tasks
            console.log('Existing user, navigating directly to /tasks');
            this.snackBar.open('¡Bienvenido de nuevo!', 'Cerrar', {
              duration: 3000
            });
            this.navigateToTasks();
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          this.handleError(error);
        }
      });
    }
  }

  private navigateToTasks(): void {
    console.log('Attempting to navigate to /tasks');
    this.router.navigate(['/tasks']).then(
      (success) => console.log('Navigation successful:', success),
      (error) => console.error('Navigation error:', error)
    );
  }

  private handleError(error: any): void {
    let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }
    
    this.snackBar.open(errorMessage, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  get emailControl() {
    return this.loginForm.get('email');
  }
}

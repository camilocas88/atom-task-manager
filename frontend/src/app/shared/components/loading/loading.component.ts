import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      min-height: 200px;
    }

    .loading-message {
      margin-top: 1rem;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }
  `]
})
export class LoadingComponent {
  /** Diámetro del spinner en pixeles */
  diameter = 50;

  /** Mensaje opcional que se muestra debajo del spinner */
  message?: string;
}

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../../domain/user.interface';

export interface WelcomeDialogData {
  user: User;
}

@Component({
  selector: 'app-welcome-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './welcome-dialog.component.html',
  styleUrls: ['./welcome-dialog.component.scss']
})
export class WelcomeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<WelcomeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WelcomeDialogData
  ) {}

  onClose(): void {
    console.log('Closing welcome dialog');
    this.dialogRef.close();
  }
}

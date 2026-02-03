import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Task, UpdateTaskDto } from '../../../../domain';

export interface EditTaskDialogData {
  task: Task;
}

@Component({
  selector: 'app-edit-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.scss']
})
export class EditTaskDialogComponent implements OnInit {
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTaskDialogData
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      title: [this.data.task.title, [Validators.required, Validators.maxLength(100)]],
      description: [this.data.task.description, [Validators.maxLength(500)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.valid) {
      const updateDto: UpdateTaskDto = {
        title: this.editForm.value.title.trim(),
        description: this.editForm.value.description.trim()
      };
      this.dialogRef.close(updateDto);
    }
  }

  get titleControl() {
    return this.editForm.get('title');
  }

  get descriptionControl() {
    return this.editForm.get('description');
  }
}

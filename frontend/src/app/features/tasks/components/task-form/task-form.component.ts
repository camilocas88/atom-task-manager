import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CreateTaskDto, Task } from '../../../../domain';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  @Input() task?: Task;
  @Input() isEditMode = false;
  @Output() submitTask = new EventEmitter<CreateTaskDto>();
  @Output() cancel = new EventEmitter<void>();

  taskForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: [this.task?.title || '', [Validators.required, Validators.maxLength(100)]],
      description: [this.task?.description || '', [Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const taskDto: CreateTaskDto = {
        title: this.taskForm.value.title.trim(),
        description: this.taskForm.value.description.trim()
      };
      this.submitTask.emit(taskDto);
      
      if (!this.isEditMode) {
        this.taskForm.reset();
      }
    }
  }

  onCancel(): void {
    this.cancel.emit();
    if (!this.isEditMode) {
      this.taskForm.reset();
    }
  }

  get titleControl() {
    return this.taskForm.get('title');
  }

  get descriptionControl() {
    return this.taskForm.get('description');
  }
}

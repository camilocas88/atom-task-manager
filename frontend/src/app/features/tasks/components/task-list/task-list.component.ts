import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskItemComponent } from '../task-item/task-item.component';
import { Task } from '../../../../domain';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    TaskItemComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Input() loading = false;
  @Output() toggleComplete = new EventEmitter<Task>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  onToggleComplete(task: Task): void {
    this.toggleComplete.emit(task);
  }

  onEdit(task: Task): void {
    this.editTask.emit(task);
  }

  onDelete(task: Task): void {
    this.deleteTask.emit(task);
  }
}

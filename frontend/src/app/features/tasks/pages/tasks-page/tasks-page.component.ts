import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CreateTaskDto, Task, UpdateTaskDto } from '../../../../domain';
import { EditTaskDialogComponent } from '../../components/edit-task-dialog/edit-task-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatBadgeModule,
    TaskFormComponent,
    TaskListComponent
  ],
  templateUrl: './tasks-page.component.html',
  styleUrls: ['./tasks-page.component.scss']
})
export class TasksPageComponent implements OnInit, OnDestroy {
  tasks$ = this.taskService.tasks$;
  loading$ = this.taskService.loading$;
  isHandset$: Observable<boolean>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isHandset$ = this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map(result => result.matches));
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTasks(): void {
    this.taskService.loadTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          this.snackBar.open('Error al cargar las tareas', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onCreateTask(taskDto: CreateTaskDto): void {
    this.taskService.createTask(taskDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Tarea creada exitosamente', 'Cerrar', {
            duration: 2000
          });
        },
        error: (error) => {
          this.snackBar.open('Error al crear la tarea', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onToggleComplete(task: Task): void {
    this.taskService.toggleComplete(task)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const message = task.completed 
            ? 'Tarea marcada como pendiente' 
            : 'Tarea completada';
          this.snackBar.open(message, 'Cerrar', { duration: 2000 });
        },
        error: (error) => {
          this.snackBar.open('Error al actualizar la tarea', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onEditTask(task: Task): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      data: { task },
      width: '500px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: UpdateTaskDto | undefined) => {
        if (result) {
          this.taskService.updateTask(task.id, result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Tarea actualizada exitosamente', 'Cerrar', {
                  duration: 2000
                });
              },
              error: (error) => {
                this.snackBar.open('Error al actualizar la tarea', 'Cerrar', {
                  duration: 3000,
                  panelClass: ['error-snackbar']
                });
              }
            });
        }
      });
  }

  onDeleteTask(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Tarea',
        message: `¿Estás seguro de que deseas eliminar la tarea "${task.title}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      },
      width: '400px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.taskService.deleteTask(task.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Tarea eliminada exitosamente', 'Cerrar', {
                  duration: 2000
                });
              },
              error: (error) => {
                this.snackBar.open('Error al eliminar la tarea', 'Cerrar', {
                  duration: 3000,
                  panelClass: ['error-snackbar']
                });
              }
            });
        }
      });
  }

  onLogout(): void {
    this.authService.logout();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get tasksCount() {
    return this.taskService.getTasksCount();
  }
}

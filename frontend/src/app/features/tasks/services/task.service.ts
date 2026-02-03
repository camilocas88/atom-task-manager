import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CreateTaskDto, Task, UpdateTaskDto } from '../../../domain';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly API_URL = environment.apiUrl;

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadTasks(): Observable<Task[]> {
    this.loadingSubject.next(true);

    return this.http.get<any>(`${this.API_URL}/tasks`).pipe(
      map(response => {
        console.log('Raw tasks response:', response);
        return response.data ? response.data : response;
      }),
      tap((tasks) => {
        console.log('Processed tasks:', tasks);
        this.tasksSubject.next(tasks);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        console.error('Error loading tasks', error);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  createTask(taskDto: CreateTaskDto): Observable<Task> {
    return this.http.post<any>(`${this.API_URL}/tasks`, taskDto).pipe(
      map(response => response.data ? response.data : response),
      tap((newTask) => {
        const currentTasks = this.tasksSubject.value;
        // Agregar la nueva tarea al inicio del array
        this.tasksSubject.next([newTask, ...currentTasks]);
      }),
      catchError((error) => {
        console.error('Error creating task', error);
        throw error;
      })
    );
  }

  updateTask(id: string, taskDto: UpdateTaskDto): Observable<Task> {
    return this.http.put<any>(`${this.API_URL}/tasks/${id}`, taskDto).pipe(
      map(response => response.data ? response.data : response),
      tap((updatedTask) => {
        const currentTasks = this.tasksSubject.value;
        const index = currentTasks.findIndex((t) => t.id === id);

        if (index !== -1) {
          const newTasks = [...currentTasks];
          newTasks[index] = updatedTask;
          this.tasksSubject.next(newTasks);
        }
      }),
      catchError((error) => {
        console.error('Error updating task', error);
        throw error;
      })
    );
  }

  toggleComplete(task: Task): Observable<Task> {
    return this.updateTask(task.id, { completed: !task.completed });
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/tasks/${id}`).pipe(
      tap(() => {
        const currentTasks = this.tasksSubject.value;
        const filteredTasks = currentTasks.filter((t) => t.id !== id);
        this.tasksSubject.next(filteredTasks);
      }),
      catchError((error) => {
        console.error('Error deleting task', error);
        throw error;
      })
    );
  }

  getTaskById(id: string): Task | undefined {
    return this.tasksSubject.value.find((t) => t.id === id);
  }

  clearTasks(): void {
    this.tasksSubject.next([]);
  }

  getTasksByStatus(completed: boolean): Task[] {
    return this.tasksSubject.value.filter((t) => t.completed === completed);
  }

  getTasksCount(): { completed: number; pending: number; total: number } {
    const tasks = this.tasksSubject.value;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.filter((t) => !t.completed).length;

    return {
      completed,
      pending,
      total: tasks.length,
    };
  }
}

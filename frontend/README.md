# Frontend - Angular 17

Aplicación web moderna construida con Angular 17 standalone components.

## 🏗️ Arquitectura

### Estructura de Módulos

```
src/app/
├── core/                  # Módulo singleton (servicios globales)
│   ├── guards/           # Route guards
│   ├── interceptors/     # HTTP interceptors
│   └── services/         # Servicios compartidos
├── shared/               # Módulo compartido (componentes reutilizables)
│   ├── components/       # Componentes UI
│   └── directives/       # Directivas personalizadas
├── features/             # Módulos de funcionalidades
│   ├── auth/            # Autenticación y login
│   └── tasks/           # Gestión de tareas
└── domain/              # Modelos e interfaces
```

## 📦 Dependencias Principales

```json
{
  "@angular/core": "^17.0.0",
  "@angular/material": "^17.0.0",
  "@angular/cdk": "^17.0.0",
  "rxjs": "^7.8.0"
}
```

## 🚀 Scripts

```bash
# Desarrollo
npm start              # Servidor dev en localhost:4200
ng serve              # Equivalente a npm start

# Build
npm run build         # Build producción
npm run build:dev     # Build desarrollo

# Testing
npm test              # Unit tests con Karma
npm run test:watch    # Tests en modo watch
ng e2e                # E2E tests

# Análisis
npm run build:analyze # Analizar bundle size

# Deploy
npm run deploy        # Build + Deploy a Firebase
```

## 🧩 Características Principales

### 1. Autenticación

**AuthService** (`src/app/core/services/auth.service.ts`)

Gestiona el estado de autenticación usando RxJS:

```typescript
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  login(email: string): Observable<User> {
    return this.http.post<User>(`${API_URL}/users/login`, { email })
      .pipe(
        tap(user => {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }
}
```

**AuthGuard** (`src/app/core/guards/auth.guard.ts`)

Protege rutas que requieren autenticación:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

### 2. Gestión de Tareas

**TaskService** (`src/app/features/tasks/services/task.service.ts`)

Maneja el estado de las tareas con patrón Observable:

```typescript
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  
  loadTasks(userId: string): void {
    this.http.get<Task[]>(`${API_URL}/tasks?userId=${userId}`)
      .subscribe(tasks => this.tasksSubject.next(tasks));
  }
  
  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${API_URL}/tasks`, task)
      .pipe(
        tap(newTask => {
          const currentTasks = this.tasksSubject.value;
          this.tasksSubject.next([newTask, ...currentTasks]);
        })
      );
  }
}
```

### 3. Componentes

#### Login Component

Formulario reactivo con validación:

```typescript
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
  
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.email!)
        .subscribe({
          next: () => this.router.navigate(['/tasks']),
          error: (err) => this.handleError(err)
        });
    }
  }
}
```

#### Task List Component

Lista optimizada con trackBy:

```typescript
@Component({
  selector: 'app-task-list',
  template: `
    <mat-card *ngFor="let task of tasks$ | async; trackBy: trackByTaskId">
      <!-- Task content -->
    </mat-card>
  `
})
export class TaskListComponent {
  tasks$ = this.taskService.tasks$;
  
  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}
```

## 🎨 Angular Material

### Configuración de Tema

Tema personalizado en `src/styles.scss`:

```scss
@use '@angular/material' as mat;

$primary-palette: mat.define-palette(mat.$indigo-palette);
$accent-palette: mat.define-palette(mat.$pink-palette);

$theme: mat.define-light-theme((
  color: (
    primary: $primary-palette,
    accent: $accent-palette
  )
));

@include mat.all-component-themes($theme);
```

### Componentes Utilizados

- `MatCard` - Tarjetas para tareas
- `MatButton` - Botones de acción
- `MatIcon` - Iconos
- `MatFormField` - Campos de formulario
- `MatInput` - Inputs de texto
- `MatCheckbox` - Checkboxes para completar tareas
- `MatDialog` - Diálogos modales
- `MatSidenav` - Navegación lateral

## 📱 Diseño Responsive

Usando Angular CDK Layout:

```typescript
export class TasksPageComponent {
  isHandset$ = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));
}
```

Breakpoints definidos:

```scss
$breakpoint-mobile: 600px;
$breakpoint-tablet: 960px;
$breakpoint-desktop: 1280px;
```

## 🔄 Routing

Configuración con lazy loading:

```typescript
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module')
      .then(m => m.AuthModule)
  },
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.module')
      .then(m => m.TasksModule),
    canActivate: [AuthGuard]
  }
];
```

## 🧪 Testing

### Unit Tests

Ejemplo de test de servicio:

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should login successfully', () => {
    const mockUser = { id: '1', email: 'test@test.com' };
    
    service.login('test@test.com').subscribe(user => {
      expect(user).toEqual(mockUser);
    });
    
    const req = httpMock.expectOne(`${API_URL}/users/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockUser);
  });
});
```

### Component Tests

Ejemplo de test de componente:

```typescript
describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskListComponent],
      imports: [MaterialModule]
    });
    
    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });
  
  it('should display tasks', () => {
    const mockTasks = [{ id: '1', title: 'Task 1' }];
    component.tasks$ = of(mockTasks);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('mat-card').length).toBe(1);
  });
});
```

## 🎯 Mejores Prácticas

### 1. OnPush Change Detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### 2. Unsubscribe Automático

Usando `async` pipe o `takeUntil`:

```typescript
export class Component implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 3. Tipado Estricto

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}
```

### 4. Lazy Loading

Módulos de features cargados bajo demanda.

### 5. TrackBy en *ngFor

Optimización de rendimiento:

```typescript
trackByTaskId(index: number, task: Task): string {
  return task.id;
}
```

## 🔧 Configuración de Entorno

### development

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### production

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-region-project.cloudfunctions.net/api'
};
```

## 📚 Recursos

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular Style Guide](https://angular.io/guide/styleguide)

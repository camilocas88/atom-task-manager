# 📝 Sistema de Gestión de Tareas - Atom

Aplicación full-stack para gestión de tareas personales, construida con **Angular 17** y **NestJS**, siguiendo principios de **Clean Architecture** y **Arquitectura Hexagonal**.

---

## 🚀 Demo en Vivo

**Frontend:** https://atom-343c0.web.app  
**API Backend:** https://us-central1-atom-343c0.cloudfunctions.net/api

> **Nota:** La primera request puede tardar ~10-15 segundos (cold start de Cloud Functions)

---


## ✨ Características

- ✅ **Autenticación simplificada** por email (sin contraseña)
- ✅ **CRUD completo** de tareas
- ✅ **Filtrado** por estado (completadas/pendientes)
- ✅ **Diseño responsive** con Angular Material
- ✅ **Persistencia** en Firestore
- ✅ **API REST** segura con JWT
- ✅ **Real-time updates** con RxJS

---

## 🏗️ Arquitectura

### Backend - Arquitectura Hexagonal (Ports & Adapters)

```
backend/
├── src/
│   ├── domain/              # Capa de Dominio (Entidades e Interfaces)
│   │   ├── entities/        # User, Task
│   │   └── repositories/    # IUserRepository, ITaskRepository
│   │
│   ├── application/         # Casos de Uso (Lógica de Negocio)
│   │   ├── use-cases/       # CreateTask, Login, etc.
│   │   └── dtos/            # Data Transfer Objects
│   │
│   ├── infrastructure/      # Adaptadores (Implementaciones)
│   │   ├── repositories/    # FirestoreUserRepository, FirestoreTaskRepository
│   │   ├── config/          # Firebase Config
│   │   └── factories/       # Repository Factory
│   │
│   ├── presentation/        # Capa de Presentación
│   │   ├── controllers/     # REST Controllers
│   │   └── middlewares/     # Guards, Interceptors
│   │
│   └── shared/              # Utilidades Compartidas
│       ├── services/        # AuthService, LoggingService
│       ├── decorators/      # Custom Decorators
│       └── interceptors/    # Transform, Logging
```


### Frontend - Clean Architecture

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/            # Servicios Singleton
│   │   │   ├── services/    # AuthService, HttpInterceptor
│   │   │   └── guards/      # AuthGuard
│   │   │
│   │   ├── domain/          # Modelos e Interfaces
│   │   │   ├── task.interface.ts
│   │   │   └── user.interface.ts
│   │   │
│   │   ├── features/        # Módulos de Funcionalidad
│   │   │   ├── auth/        # Login, Welcome Dialog
│   │   │   └── tasks/       # CRUD de Tareas
│   │   │
│   │   └── shared/          # Componentes Reutilizables
│   │       ├── components/  # Loading, Confirm Dialog
│   │       └── directives/  # Autofocus Directive
```


### Backend
- **NestJS** 11.x - Framework progresivo de Node.js
- **TypeScript** 5.x - Tipado estático
- **Firebase Admin SDK** - Autenticación y Firestore
- **class-validator** - Validación de DTOs
- **JWT** - Autenticación basada en tokens

### Frontend
- **Angular** 17 - Framework con standalone components
- **Angular Material** 17 - Componentes UI
- **RxJS** 7.x - Programación reactiva
- **TypeScript** 5.x - Tipado estático

### Base de Datos
- **Cloud Firestore** - Base de datos NoSQL en tiempo real

### DevOps
- **Firebase Hosting** - Hosting del frontend
- **Cloud Functions** - Serverless backend
- **GitHub Actions** - CI/CD

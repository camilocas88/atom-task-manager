/**
 * EJEMPLOS DE USO DE LOS REPOSITORIOS
 *
 * Este archivo contiene ejemplos de cómo usar los repositorios en casos de uso
 * NO ejecutar este archivo - solo es para referencia
 */

import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import { User } from '../../domain/entities/user.entity';
import * as taskRepositoryInterface from '../../domain/repositories/task.repository.interface';
import * as userRepositoryInterface from '../../domain/repositories/user.repository.interface';

/**
 * EJEMPLO 1: Caso de uso de autenticación
 */
@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: userRepositoryInterface.IUserRepository,
  ) {}

  async execute(email: string): Promise<{ user: User; isNew: boolean }> {
    // Buscar usuario existente
    let user = await this.userRepository.findByEmail(email);
    let isNew = false;

    // Si no existe, crear uno nuevo
    if (!user) {
      user = await this.userRepository.create(email);
      isNew = true;
    }

    return { user, isNew };
  }
}

/**
 * EJEMPLO 2: Caso de uso de crear tarea
 */
@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: taskRepositoryInterface.ITaskRepository,
    @Inject('IUserRepository')
    private readonly userRepository: userRepositoryInterface.IUserRepository,
  ) {}

  async execute(
    userId: string,
    title: string,
    description: string,
  ): Promise<Task> {
    // Validar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Crear la tarea
    const task = await this.taskRepository.create({
      userId,
      title,
      description,
      completed: false,
    });

    return task;
  }
}

/**
 * EJEMPLO 3: Caso de uso de obtener tareas de un usuario
 */
@Injectable()
export class GetUserTasksUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(userId: string): Promise<Task[]> {
    return this.taskRepository.findAllByUserId(userId);
  }
}

/**
 * EJEMPLO 4: Caso de uso de actualizar tarea
 */
@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(
    taskId: string,
    userId: string,
    updates: Partial<Task>,
  ): Promise<Task> {
    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await this.taskRepository.findById(taskId);

    if (!existingTask) {
      throw new Error('Task not found');
    }

    if (existingTask.userId !== userId) {
      throw new Error('Unauthorized: Task does not belong to user');
    }

    // Actualizar solo los campos permitidos
    const allowedUpdates: Partial<Task> = {};
    if (updates.title !== undefined) allowedUpdates.title = updates.title;
    if (updates.description !== undefined)
      allowedUpdates.description = updates.description;
    if (updates.completed !== undefined)
      allowedUpdates.completed = updates.completed;

    return this.taskRepository.update(taskId, allowedUpdates);
  }
}

/**
 * EJEMPLO 5: Caso de uso de eliminar tarea
 */
@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(taskId: string, userId: string): Promise<void> {
    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await this.taskRepository.findById(taskId);

    if (!existingTask) {
      throw new Error('Task not found');
    }

    if (existingTask.userId !== userId) {
      throw new Error('Unauthorized: Task does not belong to user');
    }

    await this.taskRepository.delete(taskId);
  }
}

/**
 * EJEMPLO 6: Caso de uso de toggle completado
 */
@Injectable()
export class ToggleTaskCompletedUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(taskId: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Invertir el estado de completado
    return this.taskRepository.update(taskId, {
      completed: !task.completed,
    });
  }
}

/**
 * EJEMPLO 7: Módulo completo con casos de uso
 */
/*
import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { LoginUserUseCase } from './use-cases/login-user.use-case';
import { CreateTaskUseCase } from './use-cases/create-task.use-case';
import { GetUserTasksUseCase } from './use-cases/get-user-tasks.use-case';
import { UpdateTaskUseCase } from './use-cases/update-task.use-case';
import { DeleteTaskUseCase } from './use-cases/delete-task.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [
    LoginUserUseCase,
    CreateTaskUseCase,
    GetUserTasksUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
  ],
  exports: [
    LoginUserUseCase,
    CreateTaskUseCase,
    GetUserTasksUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
  ],
})
export class ApplicationModule {}
*/

/**
 * EJEMPLO 8: Uso en un controller
 */
/*
import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { CreateTaskUseCase } from '../application/use-cases/create-task.use-case';
import { GetUserTasksUseCase } from '../application/use-cases/get-user-tasks.use-case';

@Controller('api/tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getUserTasksUseCase: GetUserTasksUseCase,
  ) {}

  @Get()
  async getAllTasks(@Request() req) {
    const userId = req.user.id; // Del middleware de autenticación
    return this.getUserTasksUseCase.execute(userId);
  }

  @Post()
  async createTask(@Request() req, @Body() body: { title: string; description: string }) {
    const userId = req.user.id;
    return this.createTaskUseCase.execute(userId, body.title, body.description);
  }
}
*/

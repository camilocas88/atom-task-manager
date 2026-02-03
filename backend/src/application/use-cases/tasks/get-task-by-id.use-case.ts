import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../../../domain/entities/task.entity';
import * as taskRepositoryInterface from '../../../domain/repositories/task.repository.interface';

@Injectable()
export class GetTaskByIdUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(taskId: string, userId: string): Promise<Task> {
    if (!taskId) {
      throw new Error('El ID de la tarea es requerido');
    }

    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new Error('La tarea no existe');
    }

    if (task.userId !== userId) {
      throw new Error('No tienes permiso para acceder a esta tarea');
    }

    return task;
  }
}

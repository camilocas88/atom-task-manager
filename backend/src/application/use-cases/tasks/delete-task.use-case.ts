import { Inject, Injectable } from '@nestjs/common';
import * as taskRepositoryInterface from '../../../domain/repositories/task.repository.interface';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(taskId: string, userId: string): Promise<void> {
    if (!taskId) {
      throw new Error('El ID de la tarea es requerido');
    }

    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error('La tarea no existe');
    }

    if (existingTask.userId !== userId) {
      throw new Error('No tienes permiso para eliminar esta tarea');
    }

    await this.taskRepository.delete(taskId);
  }
}

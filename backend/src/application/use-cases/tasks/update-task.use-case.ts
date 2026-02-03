import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../../../domain/entities/task.entity';
import * as taskRepositoryInterface from '../../../domain/repositories/task.repository.interface';
import { UpdateTaskDto } from '../../dtos/update-task.dto';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(
    taskId: string,
    dto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    // Validaciones
    if (!taskId) {
      throw new Error('El ID de la tarea es requerido');
    }

    // Verificar que la tarea existe
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      throw new Error('La tarea no existe');
    }

    // Verificar que la tarea pertenece al usuario
    if (existingTask.userId !== userId) {
      throw new Error('No tienes permiso para actualizar esta tarea');
    }

    // Preparar los datos a actualizar
    const updateData: Partial<Task> = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) {
      if (dto.title.trim().length === 0) {
        throw new Error('El título no puede estar vacío');
      }
      updateData.title = dto.title.trim();
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description.trim();
    }

    if (dto.completed !== undefined) {
      updateData.completed = dto.completed;
    }

    // Actualizar la tarea
    return this.taskRepository.update(taskId, updateData);
  }
}

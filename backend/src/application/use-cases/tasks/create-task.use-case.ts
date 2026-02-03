import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../../../domain/entities/task.entity';
import * as taskRepositoryInterface from '../../../domain/repositories/task.repository.interface';
import { CreateTaskDto } from '../../dtos/create-task.dto';

interface CreateTaskWithUser extends CreateTaskDto {
  userId: string;
}

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(dto: CreateTaskWithUser): Promise<Task> {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new Error('El título de la tarea es requerido');
    }

    if (!dto.userId) {
      throw new Error('El ID de usuario es requerido');
    }

    const taskData: Partial<Task> = {
      userId: dto.userId,
      title: dto.title.trim(),
      description: dto.description?.trim() || '',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.taskRepository.create(taskData);
  }
}

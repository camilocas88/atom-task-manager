import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../../../domain/entities/task.entity';
import * as taskRepositoryInterface from '../../../domain/repositories/task.repository.interface';

@Injectable()
export class GetTasksUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: taskRepositoryInterface.ITaskRepository,
  ) {}

  async execute(userId: string): Promise<Task[]> {
    if (!userId) {
      throw new Error('El ID de usuario es requerido');
    }

    const tasks = await this.taskRepository.findAllByUserId(userId);

    return tasks.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }
}

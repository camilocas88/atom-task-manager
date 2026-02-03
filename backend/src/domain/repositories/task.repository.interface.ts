import { Task } from '../entities/task.entity';

export interface ITaskRepository {
  findAllByUserId(userId: string): Promise<Task[]>;

  findById(id: string): Promise<Task | null>;

  create(task: Partial<Task>): Promise<Task>;

  update(id: string, task: Partial<Task>): Promise<Task>;

  delete(id: string): Promise<void>;
}

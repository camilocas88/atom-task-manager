import { Provider } from '@nestjs/common';
import { FirestoreTaskRepository } from '../repositories/firestore-task.repository';
import { FirestoreUserRepository } from '../repositories/firestore-user.repository';

export const UserRepositoryProvider: Provider = {
  provide: 'IUserRepository',
  useClass: FirestoreUserRepository,
};

export const TaskRepositoryProvider: Provider = {
  provide: 'ITaskRepository',
  useClass: FirestoreTaskRepository,
};

export const repositoryProviders: Provider[] = [
  UserRepositoryProvider,
  TaskRepositoryProvider,
];

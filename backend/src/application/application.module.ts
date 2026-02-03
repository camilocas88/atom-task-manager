import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

import { CreateTaskUseCase } from './use-cases/tasks/create-task.use-case';
import { DeleteTaskUseCase } from './use-cases/tasks/delete-task.use-case';
import { GetTaskByIdUseCase } from './use-cases/tasks/get-task-by-id.use-case';
import { GetTasksUseCase } from './use-cases/tasks/get-tasks.use-case';
import { UpdateTaskUseCase } from './use-cases/tasks/update-task.use-case';

import { CreateUserUseCase } from './use-cases/users/create-user.use-case';
import { FindUserByEmailUseCase } from './use-cases/users/find-user-by-email.use-case';
import { FindUserByIdUseCase } from './use-cases/users/find-user-by-id.use-case';
import { LoginUseCase } from './use-cases/users/login.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CreateTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    GetTasksUseCase,
    GetTaskByIdUseCase,

    CreateUserUseCase,
    FindUserByEmailUseCase,
    FindUserByIdUseCase,
    LoginUseCase,
  ],
  exports: [
    CreateTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    GetTasksUseCase,
    GetTaskByIdUseCase,
    CreateUserUseCase,
    FindUserByEmailUseCase,
    FindUserByIdUseCase,
    LoginUseCase,
  ],
})
export class ApplicationModule {}

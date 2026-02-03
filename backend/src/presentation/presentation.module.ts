import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { AuthGuard } from '../shared/guards/auth.guard';
import { TasksController } from './controllers/tasks.controller';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UsersController, TasksController],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class PresentationModule {}

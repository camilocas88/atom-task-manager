import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateTaskDto } from '../../application/dtos/create-task.dto';
import { UpdateTaskDto } from '../../application/dtos/update-task.dto';
import {
  CreateTaskUseCase,
  DeleteTaskUseCase,
  GetTaskByIdUseCase,
  GetTasksUseCase,
  UpdateTaskUseCase,
} from '../../application/use-cases/tasks';
import { Task } from '../../domain/entities/task.entity';
import { GetUser } from '../../shared/decorators/get-user.decorator';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTasksUseCase: GetTasksUseCase,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}

  @Get()
  async getAllTasks(@GetUser('id') userId: string): Promise<Task[]> {
    return this.getTasksUseCase.execute(userId);
  }

  @Get(':id')
  async getTaskById(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ): Promise<Task> {
    return this.getTaskByIdUseCase.execute(id, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser('id') userId: string,
  ): Promise<Task> {
    // Asegurar que el userId venga del usuario autenticado
    const taskData = {
      ...createTaskDto,
      userId,
    };
    return this.createTaskUseCase.execute(taskData);
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser('id') userId: string,
  ): Promise<Task> {
    return this.updateTaskUseCase.execute(id, updateTaskDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ): Promise<void> {
    return this.deleteTaskUseCase.execute(id, userId);
  }
}

import { Task } from '../../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../../domain/repositories/task.repository.interface';
import { UpdateTaskDto } from '../../../dtos/update-task.dto';
import { UpdateTaskUseCase } from '../update-task.use-case';

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;
  let mockRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new UpdateTaskUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const existingTask = new Task({
      id: 'task123',
      userId: 'user123',
      title: 'Título original',
      description: 'Descripción original',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });

    it('debería actualizar una tarea exitosamente', async () => {
      // Arrange
      const dto: UpdateTaskDto = {
        title: 'Título actualizado',
        description: 'Descripción actualizada',
        completed: true,
      };

      const updatedTask = new Task({
        ...existingTask,
        ...dto,
        updatedAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(existingTask);
      mockRepository.update.mockResolvedValue(updatedTask);

      // Act
      const result = await useCase.execute('task123', dto, 'user123');

      // Assert
      expect(result).toEqual(updatedTask);
      expect(mockRepository.findById).toHaveBeenCalledWith('task123');
      expect(mockRepository.update).toHaveBeenCalledWith(
        'task123',
        expect.objectContaining({
          title: dto.title,
          description: dto.description,
          completed: dto.completed,
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('debería lanzar error si la tarea no existe', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute('task123', { title: 'Nuevo título' }, 'user123'),
      ).rejects.toThrow('La tarea no existe');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('debería lanzar error si la tarea no pertenece al usuario', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(
        useCase.execute('task123', { title: 'Nuevo título' }, 'otroUser'),
      ).rejects.toThrow('No tienes permiso para actualizar esta tarea');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('debería lanzar error si el taskId está vacío', async () => {
      // Act & Assert
      await expect(
        useCase.execute('', { title: 'Nuevo título' }, 'user123'),
      ).rejects.toThrow('El ID de la tarea es requerido');

      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('debería lanzar error si el título actualizado está vacío', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(
        useCase.execute('task123', { title: '   ' }, 'user123'),
      ).rejects.toThrow('El título no puede estar vacío');

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('debería permitir actualizar solo el título', async () => {
      // Arrange
      const dto: UpdateTaskDto = {
        title: 'Nuevo título',
      };

      const updatedTask = new Task({
        ...existingTask,
        title: dto.title,
        updatedAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(existingTask);
      mockRepository.update.mockResolvedValue(updatedTask);

      // Act
      await useCase.execute('task123', dto, 'user123');

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith(
        'task123',
        expect.objectContaining({
          title: 'Nuevo título',
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('debería permitir actualizar solo el estado de completitud', async () => {
      // Arrange
      const dto: UpdateTaskDto = {
        completed: true,
      };

      const updatedTask = new Task({
        ...existingTask,
        completed: true,
        updatedAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(existingTask);
      mockRepository.update.mockResolvedValue(updatedTask);

      // Act
      await useCase.execute('task123', dto, 'user123');

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith(
        'task123',
        expect.objectContaining({
          completed: true,
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('debería recortar espacios en blanco del título y descripción', async () => {
      // Arrange
      const dto: UpdateTaskDto = {
        title: '  Título con espacios  ',
        description: '  Descripción con espacios  ',
      };

      const updatedTask = new Task({
        ...existingTask,
        title: 'Título con espacios',
        description: 'Descripción con espacios',
        updatedAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(existingTask);
      mockRepository.update.mockResolvedValue(updatedTask);

      // Act
      await useCase.execute('task123', dto, 'user123');

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith(
        'task123',
        expect.objectContaining({
          title: 'Título con espacios',
          description: 'Descripción con espacios',
        }),
      );
    });

    it('debería actualizar el campo updatedAt', async () => {
      // Arrange
      const dto: UpdateTaskDto = {
        title: 'Nuevo título',
      };

      const updatedTask = new Task({
        ...existingTask,
        title: dto.title,
        updatedAt: new Date(),
      });

      mockRepository.findById.mockResolvedValue(existingTask);
      mockRepository.update.mockResolvedValue(updatedTask);

      // Act
      await useCase.execute('task123', dto, 'user123');

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith(
        'task123',
        expect.objectContaining({
          updatedAt: expect.any(Date),
        }),
      );
    });
  });
});

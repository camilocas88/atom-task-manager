import { Task } from '../../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../../domain/repositories/task.repository.interface';
import { DeleteTaskUseCase } from '../delete-task.use-case';

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase;
  let mockRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteTaskUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const existingTask = new Task({
      id: 'task123',
      userId: 'user123',
      title: 'Título',
      description: 'Descripción',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('debería eliminar una tarea exitosamente', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(existingTask);
      mockRepository.delete.mockResolvedValue(undefined);

      // Act
      await useCase.execute('task123', 'user123');

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith('task123');
      expect(mockRepository.delete).toHaveBeenCalledWith('task123');
    });

    it('debería lanzar error si la tarea no existe', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('task123', 'user123')).rejects.toThrow(
        'La tarea no existe',
      );

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('debería lanzar error si la tarea no pertenece al usuario', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(existingTask);

      // Act & Assert
      await expect(useCase.execute('task123', 'otroUser')).rejects.toThrow(
        'No tienes permiso para eliminar esta tarea',
      );

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('debería lanzar error si el taskId está vacío', async () => {
      // Act & Assert
      await expect(useCase.execute('', 'user123')).rejects.toThrow(
        'El ID de la tarea es requerido',
      );

      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });
});

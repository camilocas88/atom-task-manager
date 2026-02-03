import { Task } from '../../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../../domain/repositories/task.repository.interface';
import { GetTasksUseCase } from '../get-tasks.use-case';

describe('GetTasksUseCase', () => {
  let useCase: GetTasksUseCase;
  let mockRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetTasksUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debería obtener todas las tareas de un usuario', async () => {
      // Arrange
      const tasks = [
        new Task({
          id: 'task1',
          userId: 'user123',
          title: 'Tarea 1',
          description: 'Descripción 1',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }),
        new Task({
          id: 'task2',
          userId: 'user123',
          title: 'Tarea 2',
          description: 'Descripción 2',
          completed: true,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        }),
      ];

      mockRepository.findAllByUserId.mockResolvedValue(tasks);

      // Act
      const result = await useCase.execute('user123');

      // Assert
      expect(result).toHaveLength(2);
      expect(mockRepository.findAllByUserId).toHaveBeenCalledWith('user123');
    });

    it('debería retornar un array vacío si el usuario no tiene tareas', async () => {
      // Arrange
      mockRepository.findAllByUserId.mockResolvedValue([]);

      // Act
      const result = await useCase.execute('user123');

      // Assert
      expect(result).toEqual([]);
      expect(mockRepository.findAllByUserId).toHaveBeenCalledWith('user123');
    });

    it('debería ordenar las tareas por fecha de creación (más recientes primero)', async () => {
      // Arrange
      const tasks = [
        new Task({
          id: 'task1',
          userId: 'user123',
          title: 'Tarea 1',
          description: 'Descripción 1',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }),
        new Task({
          id: 'task2',
          userId: 'user123',
          title: 'Tarea 2',
          description: 'Descripción 2',
          completed: true,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        }),
        new Task({
          id: 'task3',
          userId: 'user123',
          title: 'Tarea 3',
          description: 'Descripción 3',
          completed: false,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        }),
      ];

      mockRepository.findAllByUserId.mockResolvedValue(tasks);

      // Act
      const result = await useCase.execute('user123');

      // Assert
      expect(result[0].id).toBe('task2'); // La más reciente
      expect(result[1].id).toBe('task3');
      expect(result[2].id).toBe('task1'); // La más antigua
    });

    it('debería lanzar error si el userId está vacío', async () => {
      // Act & Assert
      await expect(useCase.execute('')).rejects.toThrow(
        'El ID de usuario es requerido',
      );

      expect(mockRepository.findAllByUserId).not.toHaveBeenCalled();
    });
  });
});

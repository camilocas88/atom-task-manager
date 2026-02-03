import { Task } from '../../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../../domain/repositories/task.repository.interface';
import { CreateTaskDto } from '../../../dtos/create-task.dto';
import { CreateTaskUseCase } from '../create-task.use-case';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let mockRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAllByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateTaskUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debería crear una tarea exitosamente con datos válidos', async () => {
      // Arrange
      const dto: CreateTaskDto = {
        userId: 'user123',
        title: 'Tarea de prueba',
        description: 'Descripción de prueba',
      };

      const expectedTask = new Task({
        id: 'task123',
        userId: dto.userId,
        title: dto.title,
        description: dto.description,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockRepository.create.mockResolvedValue(expectedTask);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result).toEqual(expectedTask);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: dto.userId,
          title: dto.title,
          description: dto.description,
          completed: false,
        }),
      );
    });

    it('debería lanzar error si el título está vacío', async () => {
      // Arrange
      const dto: CreateTaskDto = {
        userId: 'user123',
        title: '',
        description: 'Descripción',
      };

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(
        'El título de la tarea es requerido',
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar error si el título solo tiene espacios', async () => {
      // Arrange
      const dto: CreateTaskDto = {
        userId: 'user123',
        title: '   ',
        description: 'Descripción',
      };

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(
        'El título de la tarea es requerido',
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar error si el userId no está presente', async () => {
      // Arrange
      const dto: CreateTaskDto = {
        userId: '',
        title: 'Título',
        description: 'Descripción',
      };

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(
        'El ID de usuario es requerido',
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('debería recortar espacios en blanco del título y descripción', async () => {
      // Arrange
      const dto: CreateTaskDto = {
        userId: 'user123',
        title: '  Título con espacios  ',
        description: '  Descripción con espacios  ',
      };

      const expectedTask = new Task({
        id: 'task123',
        userId: dto.userId,
        title: 'Título con espacios',
        description: 'Descripción con espacios',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockRepository.create.mockResolvedValue(expectedTask);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Título con espacios',
          description: 'Descripción con espacios',
        }),
      );
    });

    it('debería usar descripción vacía si no se proporciona', async () => {
      // Arrange
      const dto: CreateTaskDto = {
        userId: 'user123',
        title: 'Título',
        description: undefined as any,
      };

      const expectedTask = new Task({
        id: 'task123',
        userId: dto.userId,
        title: dto.title,
        description: '',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockRepository.create.mockResolvedValue(expectedTask);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: '',
        }),
      );
    });

    it('debería establecer completed en false por defecto', async () => {
      // Arrange
      const dto: CreateTaskDto = {
        userId: 'user123',
        title: 'Título',
        description: 'Descripción',
      };

      const expectedTask = new Task({
        id: 'task123',
        userId: dto.userId,
        title: dto.title,
        description: dto.description,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockRepository.create.mockResolvedValue(expectedTask);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          completed: false,
        }),
      );
    });

    it('debería establecer createdAt y updatedAt', async () => {
      // Arrange
      const dto: CreateTaskDto = {
        userId: 'user123',
        title: 'Título',
        description: 'Descripción',
      };

      const expectedTask = new Task({
        id: 'task123',
        userId: dto.userId,
        title: dto.title,
        description: dto.description,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockRepository.create.mockResolvedValue(expectedTask);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });
  });
});

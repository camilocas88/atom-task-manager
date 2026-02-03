import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { CreateUserUseCase } from '../create-user.use-case';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new CreateUserUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debería crear un usuario exitosamente', async () => {
      // Arrange
      const email = 'test@example.com';
      const newUser = new User({
        id: 'user123',
        email: email,
        createdAt: new Date(),
      });

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(newUser);

      // Act
      const result = await useCase.execute(email);

      // Assert
      expect(result).toEqual(newUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockRepository.create).toHaveBeenCalledWith(email);
    });

    it('debería lanzar error si el email ya está registrado', async () => {
      // Arrange
      const email = 'test@example.com';
      const existingUser = new User({
        id: 'user123',
        email: email,
        createdAt: new Date(),
      });

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(email)).rejects.toThrow(
        'El correo electrónico ya está registrado',
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('debería lanzar error si el email está vacío', async () => {
      // Act & Assert
      await expect(useCase.execute('')).rejects.toThrow(
        'El correo electrónico es requerido',
      );

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('debería lanzar error si el email no es válido', async () => {
      // Act & Assert
      await expect(useCase.execute('correo-invalido')).rejects.toThrow(
        'El correo electrónico no es válido',
      );

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('debería convertir el email a minúsculas y recortar espacios', async () => {
      // Arrange
      const email = '  TEST@EXAMPLE.COM  ';
      const newUser = new User({
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date(),
      });

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(newUser);

      // Act
      await useCase.execute(email);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith('test@example.com');
    });
  });
});

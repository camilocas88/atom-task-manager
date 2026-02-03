import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { FindUserByEmailUseCase } from '../find-user-by-email.use-case';

describe('FindUserByEmailUseCase', () => {
  let useCase: FindUserByEmailUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new FindUserByEmailUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debería retornar usuario si existe', async () => {
      // Arrange
      const email = 'test@example.com';
      const existingUser = new User({
        id: 'user123',
        email: email,
        createdAt: new Date(),
      });

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act
      const result = await useCase.execute(email);

      // Assert
      expect(result).toEqual(existingUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('debería retornar null si el usuario no existe', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(email);

      // Assert
      expect(result).toBeNull();
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('debería lanzar error si el email está vacío', async () => {
      // Act & Assert
      await expect(useCase.execute('')).rejects.toThrow(
        'El correo electrónico es requerido',
      );

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('debería convertir el email a minúsculas y recortar espacios', async () => {
      // Arrange
      const email = '  TEST@EXAMPLE.COM  ';
      const existingUser = new User({
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date(),
      });

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act
      await useCase.execute(email);

      // Assert
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });
  });
});

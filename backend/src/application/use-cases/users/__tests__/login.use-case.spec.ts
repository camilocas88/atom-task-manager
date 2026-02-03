import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { LoginDto } from '../../../dtos/login.dto';
import { LoginUseCase } from '../login.use-case';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new LoginUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debería retornar usuario existente con isNew=false', async () => {
      // Arrange
      const dto: LoginDto = {
        email: 'test@example.com',
      };

      const existingUser = new User({
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date(),
      });

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.user).toEqual(existingUser);
      expect(result.isNew).toBe(false);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('debería crear nuevo usuario si no existe con isNew=true', async () => {
      // Arrange
      const dto: LoginDto = {
        email: 'newuser@example.com',
      };

      const newUser = new User({
        id: 'user456',
        email: 'newuser@example.com',
        createdAt: new Date(),
      });

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(newUser);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.user).toEqual(newUser);
      expect(result.isNew).toBe(true);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        'newuser@example.com',
      );
      expect(mockRepository.create).toHaveBeenCalledWith('newuser@example.com');
    });

    it('debería lanzar error si el email está vacío', async () => {
      // Arrange
      const dto: LoginDto = {
        email: '',
      };

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(
        'El correo electrónico es requerido',
      );

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('debería lanzar error si el email solo tiene espacios', async () => {
      // Arrange
      const dto: LoginDto = {
        email: '   ',
      };

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(
        'El correo electrónico es requerido',
      );

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('debería lanzar error si el email no es válido', async () => {
      // Arrange
      const dto: LoginDto = {
        email: 'correo-invalido',
      };

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(
        'El correo electrónico no es válido',
      );

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('debería convertir el email a minúsculas', async () => {
      // Arrange
      const dto: LoginDto = {
        email: 'TEST@EXAMPLE.COM',
      };

      const existingUser = new User({
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date(),
      });

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('debería recortar espacios en blanco del email', async () => {
      // Arrange
      const dto: LoginDto = {
        email: '  test@example.com  ',
      };

      const existingUser = new User({
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date(),
      });

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('debería validar correctamente formatos de email válidos', async () => {
      // Arrange
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test123@test-domain.com',
      ];

      const existingUser = new User({
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date(),
      });

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      for (const email of validEmails) {
        await expect(useCase.execute({ email })).resolves.toBeDefined();
      }
    });

    it('debería rechazar formatos de email inválidos', async () => {
      // Arrange
      const invalidEmails = [
        'invalido',
        '@example.com',
        'test@',
        'test @example.com',
        'test@.com',
        'test',
      ];

      // Act & Assert
      for (const email of invalidEmails) {
        await expect(useCase.execute({ email })).rejects.toThrow(
          'El correo electrónico no es válido',
        );
      }
    });
  });
});

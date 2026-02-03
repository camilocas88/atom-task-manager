import { User } from '../../domain/entities/user.entity';
import { FirebaseConfig } from '../config/firebase.config';
import { FirestoreUserRepository } from './firestore-user.repository';

describe('FirestoreUserRepository', () => {
  let repository: FirestoreUserRepository;
  let mockFirebaseConfig: jest.Mocked<FirebaseConfig>;
  let mockFirestore: any;

  beforeEach(() => {
    // Mock de Firestore
    mockFirestore = {
      collection: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
      doc: jest.fn().mockReturnThis(),
      set: jest.fn(),
    };

    // Mock de FirebaseConfig
    mockFirebaseConfig = {
      getFirestore: jest.fn().mockReturnValue(mockFirestore),
    } as any;

    repository = new FirestoreUserRepository(mockFirebaseConfig);
  });

  describe('findByEmail', () => {
    it('debe retornar un usuario cuando existe', async () => {
      const mockEmail = 'test@example.com';
      const mockUserId = 'user123';
      const mockCreatedAt = new Date();

      const mockDoc = {
        id: mockUserId,
        data: () => ({
          email: mockEmail,
          createdAt: { toDate: () => mockCreatedAt },
        }),
      };

      mockFirestore.get.mockResolvedValue({
        empty: false,
        docs: [mockDoc],
      });

      const result = await repository.findByEmail(mockEmail);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockUserId);
      expect(result.email).toBe(mockEmail);
      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      expect(mockFirestore.where).toHaveBeenCalledWith(
        'email',
        '==',
        mockEmail,
      );
    });

    it('debe retornar null cuando el usuario no existe', async () => {
      mockFirestore.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('debe lanzar error cuando falla la operación', async () => {
      mockFirestore.get.mockRejectedValue(new Error('Database error'));

      await expect(repository.findByEmail('test@example.com')).rejects.toThrow(
        'Error finding user by email',
      );
    });
  });

  describe('findById', () => {
    it('debe retornar un usuario cuando existe', async () => {
      const mockUserId = 'user123';
      const mockEmail = 'test@example.com';
      const mockCreatedAt = new Date();

      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: mockUserId,
          data: () => ({
            email: mockEmail,
            createdAt: { toDate: () => mockCreatedAt },
          }),
        }),
      };

      mockFirestore.doc.mockReturnValue(mockDocRef);

      const result = await repository.findById(mockUserId);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockUserId);
      expect(result.email).toBe(mockEmail);
    });

    it('debe retornar null cuando el usuario no existe', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
      };

      mockFirestore.doc.mockReturnValue(mockDocRef);

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('debe crear un usuario exitosamente', async () => {
      const mockEmail = 'newuser@example.com';
      const mockUserId = 'newuser123';

      const mockDocRef = {
        id: mockUserId,
        set: jest.fn().mockResolvedValue(undefined),
      };

      mockFirestore.doc.mockReturnValue(mockDocRef);

      const result = await repository.create(mockEmail);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockUserId);
      expect(result.email).toBe(mockEmail);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockDocRef.set).toHaveBeenCalled();
    });

    it('debe lanzar error cuando falla la creación', async () => {
      const mockDocRef = {
        id: 'user123',
        set: jest.fn().mockRejectedValue(new Error('Create failed')),
      };

      mockFirestore.doc.mockReturnValue(mockDocRef);

      await expect(repository.create('test@example.com')).rejects.toThrow(
        'Error creating user',
      );
    });
  });
});

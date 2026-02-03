import { Task } from '../../domain/entities/task.entity';
import { FirebaseConfig } from '../config/firebase.config';
import { FirestoreTaskRepository } from './firestore-task.repository';

describe('FirestoreTaskRepository', () => {
  let repository: FirestoreTaskRepository;
  let mockFirebaseConfig: jest.Mocked<FirebaseConfig>;
  let mockFirestore: any;

  beforeEach(() => {
    // Mock de Firestore
    mockFirestore = {
      collection: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn(),
      doc: jest.fn().mockReturnThis(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Mock de FirebaseConfig
    mockFirebaseConfig = {
      getFirestore: jest.fn().mockReturnValue(mockFirestore),
    } as any;

    repository = new FirestoreTaskRepository(mockFirebaseConfig);
  });

  describe('findAllByUserId', () => {
    it('debe retornar todas las tareas de un usuario', async () => {
      const mockUserId = 'user123';
      const mockTasks = [
        {
          id: 'task1',
          data: () => ({
            userId: mockUserId,
            title: 'Task 1',
            description: 'Description 1',
            completed: false,
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
        {
          id: 'task2',
          data: () => ({
            userId: mockUserId,
            title: 'Task 2',
            description: 'Description 2',
            completed: true,
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
          }),
        },
      ];

      mockFirestore.get.mockResolvedValue({
        empty: false,
        docs: mockTasks,
      });

      const result = await repository.findAllByUserId(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Task);
      expect(result[0].userId).toBe(mockUserId);
      expect(mockFirestore.where).toHaveBeenCalledWith(
        'userId',
        '==',
        mockUserId,
      );
      expect(mockFirestore.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('debe retornar array vacío cuando no hay tareas', async () => {
      mockFirestore.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await repository.findAllByUserId('user123');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('debe retornar una tarea cuando existe', async () => {
      const mockTaskId = 'task123';
      const mockTask = {
        exists: true,
        id: mockTaskId,
        data: () => ({
          userId: 'user123',
          title: 'Test Task',
          description: 'Test Description',
          completed: false,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      };

      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockTask),
      };

      mockFirestore.doc.mockReturnValue(mockDocRef);

      const result = await repository.findById(mockTaskId);

      expect(result).toBeInstanceOf(Task);
      expect(result.id).toBe(mockTaskId);
      expect(result.title).toBe('Test Task');
    });

    it('debe retornar null cuando la tarea no existe', async () => {
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
    it('debe crear una tarea exitosamente', async () => {
      const mockTaskData = {
        userId: 'user123',
        title: 'New Task',
        description: 'New Description',
        completed: false,
      };
      const mockTaskId = 'newtask123';

      const mockDocRef = {
        id: mockTaskId,
        set: jest.fn().mockResolvedValue(undefined),
      };

      mockFirestore.doc.mockReturnValue(mockDocRef);

      const result = await repository.create(mockTaskData);

      expect(result).toBeInstanceOf(Task);
      expect(result.id).toBe(mockTaskId);
      expect(result.title).toBe(mockTaskData.title);
      expect(result.completed).toBe(false);
      expect(mockDocRef.set).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debe actualizar una tarea exitosamente', async () => {
      const mockTaskId = 'task123';
      const updateData = {
        title: 'Updated Title',
        completed: true,
      };

      const mockDocRef = {
        get: jest
          .fn()
          .mockResolvedValueOnce({
            exists: true,
            data: () => ({
              userId: 'user123',
              title: 'Old Title',
              description: 'Description',
              completed: false,
            }),
          })
          .mockResolvedValueOnce({
            exists: true,
            id: mockTaskId,
            data: () => ({
              userId: 'user123',
              title: 'Updated Title',
              description: 'Description',
              completed: true,
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
            }),
          }),
        update: jest.fn().mockResolvedValue(undefined),
      };

      mockFirestore.doc.mockReturnValue(mockDocRef);

      const result = await repository.update(mockTaskId, updateData);

      expect(result).toBeInstanceOf(Task);
      expect(result.title).toBe('Updated Title');
      expect(result.completed).toBe(true);
      expect(mockDocRef.update).toHaveBeenCalled();
    });

    it('debe lanzar error cuando la tarea no existe', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
      };

      mockFirestore.doc.mockReturnValue(mockDocRef);

      await expect(
        repository.update('nonexistent-id', { title: 'Test' }),
      ).rejects.toThrow('Task with id nonexistent-id not found');
    });
  });

  describe('delete', () => {
    it('debe eliminar una tarea exitosamente', async () => {
      const mockTaskId = 'task123';

      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
        }),
        delete: jest.fn().mockResolvedValue(undefined),
      };

      mockFirestore.doc.mockReturnValue(mockDocRef);

      await repository.delete(mockTaskId);

      expect(mockDocRef.delete).toHaveBeenCalled();
    });

    it('debe lanzar error cuando la tarea no existe', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
      };

      mockFirestore.doc.mockReturnValue(mockDocRef);

      await expect(repository.delete('nonexistent-id')).rejects.toThrow(
        'Task with id nonexistent-id not found',
      );
    });
  });
});

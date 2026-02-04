import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { FirebaseConfig } from '../config/firebase.config';

/**
 * Interface para los datos de Task en Firestore
 */
interface FirestoreTaskData {
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

/**
 * Type para datos de actualización de Task en Firestore
 */
type FirestoreTaskUpdateData = {
  [key: string]: string | boolean | admin.firestore.Timestamp | undefined;
  title?: string;
  description?: string;
  completed?: boolean;
  updatedAt: admin.firestore.Timestamp;
};

@Injectable()
export class FirestoreTaskRepository implements ITaskRepository {
  private readonly collection = 'tasks';

  constructor(private firebaseConfig: FirebaseConfig) {}

  private get firestore(): admin.firestore.Firestore {
    return this.firebaseConfig.getFirestore();
  }

  /**
   * Convierte datos de Firestore a Task entity
   */
  private mapFirestoreDataToTask(
    id: string,
    data: admin.firestore.DocumentData,
  ): Task {
    const taskData = data as Partial<FirestoreTaskData>;

    return new Task({
      id,
      userId: taskData.userId ?? '',
      title: taskData.title ?? '',
      description: taskData.description ?? '',
      completed: taskData.completed ?? false,
      createdAt:
        taskData.createdAt instanceof admin.firestore.Timestamp
          ? taskData.createdAt.toDate()
          : new Date(),
      updatedAt:
        taskData.updatedAt instanceof admin.firestore.Timestamp
          ? taskData.updatedAt.toDate()
          : new Date(),
    });
  }

  async findAllByUserId(userId: string): Promise<Task[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collection)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((doc) =>
        this.mapFirestoreDataToTask(doc.id, doc.data()),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error finding tasks by user id: ${errorMessage}`);
    }
  }

  async findById(id: string): Promise<Task | null> {
    try {
      const doc = await this.firestore
        .collection(this.collection)
        .doc(id)
        .get();

      if (!doc.exists || !doc.data()) {
        return null;
      }

      return this.mapFirestoreDataToTask(doc.id, doc.data()!);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error finding task by id: ${errorMessage}`);
    }
  }

  async create(task: Partial<Task>): Promise<Task> {
    try {
      const taskRef = this.firestore.collection(this.collection).doc();
      const now = new Date();

      const taskData: FirestoreTaskData = {
        userId: task.userId ?? '',
        title: task.title ?? '',
        description: task.description ?? '',
        completed: task.completed ?? false,
        createdAt: admin.firestore.Timestamp.fromDate(now),
        updatedAt: admin.firestore.Timestamp.fromDate(now),
      };

      await taskRef.set(taskData);

      return new Task({
        id: taskRef.id,
        userId: taskData.userId,
        title: taskData.title,
        description: taskData.description,
        completed: taskData.completed,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error creating task: ${errorMessage}`);
    }
  }

  async update(id: string, task: Partial<Task>): Promise<Task> {
    try {
      const taskRef = this.firestore.collection(this.collection).doc(id);
      const doc = await taskRef.get();

      if (!doc.exists) {
        throw new Error(`Task with id ${id} not found`);
      }

      const now = new Date();
      const updateData: FirestoreTaskUpdateData = {
        updatedAt: admin.firestore.Timestamp.fromDate(now),
      };

      // Solo actualizar campos que se proporcionen
      if (task.title !== undefined) updateData.title = task.title;
      if (task.description !== undefined)
        updateData.description = task.description;
      if (task.completed !== undefined) updateData.completed = task.completed;

      await taskRef.update(updateData);

      // Obtener la tarea actualizada
      const updatedDoc = await taskRef.get();
      const data = updatedDoc.data();

      if (!data) {
        throw new Error(`Task data not found after update`);
      }

      return this.mapFirestoreDataToTask(updatedDoc.id, data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error updating task: ${errorMessage}`);
    }
  }

  /**
   * Elimina una tarea del sistema
   * @param id - Identificador de la tarea a eliminar
   * @returns Promise que se resuelve cuando la tarea es eliminada
   */
  async delete(id: string): Promise<void> {
    try {
      const taskRef = this.firestore.collection(this.collection).doc(id);
      const doc = await taskRef.get();

      if (!doc.exists) {
        throw new Error(`Task with id ${id} not found`);
      }

      await taskRef.delete();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error deleting task: ${errorMessage}`);
    }
  }
}

import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { FirebaseConfig } from '../config/firebase.config';

@Injectable()
export class FirestoreTaskRepository implements ITaskRepository {
  private readonly collection = 'tasks';

  constructor(private firebaseConfig: FirebaseConfig) {}

  private get firestore(): admin.firestore.Firestore {
    return this.firebaseConfig.getFirestore();
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

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return new Task({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description || '',
          completed: data.completed || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
    } catch (error) {
      throw new Error(`Error finding tasks by user id: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Task | null> {
    try {
      const doc = await this.firestore
        .collection(this.collection)
        .doc(id)
        .get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();

      if (!data) {
        return null;
      }

      return new Task({
        id: doc.id,
        userId: data.userId,
        title: data.title,
        description: data.description || '',
        completed: data.completed || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    } catch (error) {
      throw new Error(`Error finding task by id: ${error.message}`);
    }
  }

  async create(task: Partial<Task>): Promise<Task> {
    try {
      const taskRef = this.firestore.collection(this.collection).doc();
      const now = new Date();

      const taskData = {
        userId: task.userId,
        title: task.title,
        description: task.description || '',
        completed: task.completed || false,
        createdAt: admin.firestore.Timestamp.fromDate(now),
        updatedAt: admin.firestore.Timestamp.fromDate(now),
      };

      await taskRef.set(taskData);

      return new Task({
        id: taskRef.id,
        userId: task.userId,
        title: task.title,
        description: task.description || '',
        completed: task.completed || false,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      throw new Error(`Error creating task: ${error.message}`);
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
      const updateData: any = {
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

      return new Task({
        id: updatedDoc.id,
        userId: data.userId,
        title: data.title,
        description: data.description || '',
        completed: data.completed || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: now,
      });
    } catch (error) {
      throw new Error(`Error updating task: ${error.message}`);
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
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }
}

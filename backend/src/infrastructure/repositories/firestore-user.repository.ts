import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { FirebaseConfig } from '../config/firebase.config';

/**
 * Interface para los datos de User en Firestore
 */
interface FirestoreUserData {
  email: string;
  createdAt: admin.firestore.Timestamp;
}

@Injectable()
export class FirestoreUserRepository implements IUserRepository {
  private readonly collection = 'users';

  constructor(private firebaseConfig: FirebaseConfig) {}

  private get firestore(): admin.firestore.Firestore {
    return this.firebaseConfig.getFirestore();
  }

  /**
   * Convierte datos de Firestore a User entity
   */
  private mapFirestoreDataToUser(
    id: string,
    data: admin.firestore.DocumentData,
  ): User {
    const userData = data as Partial<FirestoreUserData>;

    return new User({
      id,
      email: userData.email ?? '',
      createdAt:
        userData.createdAt instanceof admin.firestore.Timestamp
          ? userData.createdAt.toDate()
          : new Date(),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const snapshot = await this.firestore
        .collection(this.collection)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return this.mapFirestoreDataToUser(doc.id, doc.data());
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error finding user by email: ${errorMessage}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const doc = await this.firestore
        .collection(this.collection)
        .doc(id)
        .get();

      if (!doc.exists || !doc.data()) {
        return null;
      }

      return this.mapFirestoreDataToUser(doc.id, doc.data()!);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error finding user by id: ${errorMessage}`);
    }
  }

  async create(email: string): Promise<User> {
    try {
      const userRef = this.firestore.collection(this.collection).doc();
      const createdAt = new Date();

      const userData: FirestoreUserData = {
        email,
        createdAt: admin.firestore.Timestamp.fromDate(createdAt),
      };

      await userRef.set(userData);

      return new User({
        id: userRef.id,
        email,
        createdAt,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error creating user: ${errorMessage}`);
    }
  }
}

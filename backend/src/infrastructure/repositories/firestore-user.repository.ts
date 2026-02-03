import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { FirebaseConfig } from '../config/firebase.config';

@Injectable()
export class FirestoreUserRepository implements IUserRepository {
  private readonly collection = 'users';

  constructor(private firebaseConfig: FirebaseConfig) {}

  private get firestore(): admin.firestore.Firestore {
    return this.firebaseConfig.getFirestore();
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
      const data = doc.data();

      return new User({
        id: doc.id,
        email: data.email,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  async findById(id: string): Promise<User | null> {
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

      return new User({
        id: doc.id,
        email: data.email,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    } catch (error) {
      throw new Error(`Error finding user by id: ${error.message}`);
    }
  }

  async create(email: string): Promise<User> {
    try {
      const userRef = this.firestore.collection(this.collection).doc();
      const createdAt = new Date();

      const userData = {
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
      throw new Error(`Error creating user: ${error.message}`);
    }
  }
}

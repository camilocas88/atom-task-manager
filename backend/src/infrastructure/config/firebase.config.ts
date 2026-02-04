import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseConfig implements OnModuleInit {
  private firestore: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    if (!admin.apps.length) {
      const privateKey = this.configService
        .get<string>('PRIVATE_KEY')
        ?.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('PROJECT_ID'),
          clientEmail: this.configService.get<string>('CLIENT_EMAIL'),
          privateKey: privateKey,
        }),
      });
    }

    this.firestore = admin.firestore();

    // Configuración de Firestore
    this.firestore.settings({
      ignoreUndefinedProperties: true,
    });
  }

  /**
   * Obtiene la instancia de Firestore
   * @returns Instancia de Firestore
   */
  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }

  /**
   * Obtiene la instancia de Auth
   * @returns Instancia de Firebase Auth
   */
  getAuth(): admin.auth.Auth {
    return admin.auth();
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseConfig } from './config/firebase.config';
import { repositoryProviders } from './factories/repository.factory';
import { FirestoreTaskRepository } from './repositories/firestore-task.repository';
import { FirestoreUserRepository } from './repositories/firestore-user.repository';

@Module({
  imports: [ConfigModule],
  providers: [
    FirebaseConfig,
    FirestoreUserRepository,
    FirestoreTaskRepository,
    ...repositoryProviders,
  ],
  exports: [
    FirebaseConfig,
    FirestoreUserRepository,
    FirestoreTaskRepository,
    ...repositoryProviders,
  ],
})
export class InfrastructureModule {}

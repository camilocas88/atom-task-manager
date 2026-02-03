import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import * as userRepositoryInterface from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: userRepositoryInterface.IUserRepository,
  ) {}

  async execute(userId: string): Promise<User | null> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('El ID de usuario es requerido');
    }

    return this.userRepository.findById(userId.trim());
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import * as userRepositoryInterface from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: userRepositoryInterface.IUserRepository,
  ) {}
  async execute(email: string): Promise<User | null> {
    if (!email || email.trim().length === 0) {
      throw new Error('El correo electrónico es requerido');
    }
    return this.userRepository.findByEmail(email.toLowerCase().trim());
  }
}

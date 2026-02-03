import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import * as userRepositoryInterface from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: userRepositoryInterface.IUserRepository,
  ) {}

  async execute(email: string): Promise<User> {
    if (!email || email.trim().length === 0) {
      throw new Error('El correo electrónico es requerido');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('El correo electrónico no es válido');
    }

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    return this.userRepository.create(normalizedEmail);
  }
}

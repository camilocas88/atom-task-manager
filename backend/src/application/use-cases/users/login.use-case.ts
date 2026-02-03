import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import * as userRepositoryInterface from '../../../domain/repositories/user.repository.interface';
import { AuthService } from '../../../shared/services/auth.service';
import { LoginDto } from '../../dtos/login.dto';

export interface LoginResult {
  user: User;
  token: string;
  isNew: boolean;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: userRepositoryInterface.IUserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    if (!dto.email || dto.email.trim().length === 0) {
      throw new Error('El correo electrónico es requerido');
    }

    // Normalizar email
    const email = dto.email.toLowerCase().trim();

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('El correo electrónico no es válido');
    }

    let user = await this.userRepository.findByEmail(email);
    let isNew = false;

    if (!user) {
      user = await this.userRepository.create(email);
      isNew = true;
    }

    // Generar token JWT
    const token = this.authService.generateToken(user.id, user.email);

    return {
      user,
      token,
      isNew,
    };
  }
}

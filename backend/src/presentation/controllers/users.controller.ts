import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginDto } from '../../application/dtos/login.dto';
import { LoginResult, LoginUseCase } from '../../application/use-cases/users';
import { Public } from '../../shared/decorators/public.decorator';


@Controller('api/users')
export class UsersController {
  constructor(private readonly loginUseCase: LoginUseCase) {}


  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResult> {
    return this.loginUseCase.execute(loginDto);
  }
}

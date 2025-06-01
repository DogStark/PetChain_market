import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
// import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    if (!user) {
      return { message: 'Registration failed' };
    }

    return {
      message: 'Registration successful',
      user,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const user = await this.authService.validateUser(email, password);

      if (!user) {
        return { message: 'Invalid credentials' };
      }

      const token = await this.authService.login(user);
      return {
        message: 'Login successful',
        token,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Login error:', errorMessage);
      return { message: 'Login failed. Please try again later.' };
    }
  }
}

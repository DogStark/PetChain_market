@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiStandardResponses()
  async login(@Body() loginDto: LoginDto) {
    // ...
  }
}
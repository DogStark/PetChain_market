import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { Patch, Body, Param, Get, Query, Controller } from '@nestjs/common';
import { GetAuditLogsDto } from './dto/get-audit-log.dto';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.adminService.updateUser(id, body);
  }

  @Patch('config')
  updateConfig(@Body() body: UpdateConfigDto) {
    return this.adminService.updateConfig(body);
  }

  @Get('audit-logs')
  getAuditLogs(@Query() query: GetAuditLogsDto) {
    return this.adminService.getAuditLogs(query);
  }
}
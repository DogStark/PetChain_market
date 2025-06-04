import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { StaffRoleService } from '../services/staff-role.service';
import { CreateStaffRoleDto } from '../dto/create-staff-role.dto';

@Controller('staff-roles')
export class StaffRoleController {
  constructor(private readonly roleService: StaffRoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateStaffRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: Partial<CreateStaffRoleDto>) {
    return this.roleService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }
}

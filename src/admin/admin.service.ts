import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '@/user/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { GetAuditLogsDto } from './dto/get-audit-log.dto';
import { AuditLog } from './entities/audit-log.entity';
import { ConfigEntity } from './entities/config.entity'; 

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(ConfigEntity) private configRepo: Repository<ConfigEntity>,
  ) {}

  async findAllUsers() {
    return this.userRepo.find();
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async deleteUser(id: string) {
    return this.userRepo.delete(id);
  }

  async getUsageReport() {
    const totalUsers = await this.userRepo.count();
    const totalAdmins = await this.userRepo.count({ where: { role: Role.ADMIN } });
    return {
      totalUsers,
      totalAdmins,
      systemLoad: Math.random().toFixed(2),
    };
  }

  async getAuditLogs(dto: GetAuditLogsDto) {
    const query = this.auditRepo.createQueryBuilder('log');
    if (dto.user) query.andWhere('log.user = :user', { user: dto.user });
    if (dto.action) query.andWhere('log.action = :action', { action: dto.action });
    if (dto.fromDate) query.andWhere('log.timestamp >= :fromDate', { fromDate: dto.fromDate });
    if (dto.toDate) query.andWhere('log.timestamp <= :toDate', { toDate: dto.toDate });
    return query.getMany();
  }

  async getConfig() {
    return this.configRepo.findOneBy({ key: 'main' });
  }

  async updateConfig(dto: UpdateConfigDto) {
    const config = await this.configRepo.findOneBy({ key: 'main' });
    if (!config) throw new NotFoundException('Config not found');
    Object.assign(config, dto);
    await this.configRepo.save(config);
    await this.auditRepo.save({
      user: 'system',
      action: 'CONFIG_UPDATED',
      timestamp: new Date(),
    });
    return config;
  }

  async exportData(type: string, format: string) {
    const users = await this.userRepo.find();
    if (format === 'csv') {
      const header = 'id,name,email,role';
      const rows = users.map(u => `${u.id},${u.name},${u.email},${u.role}`).join('\n');
      return `${header}\n${rows}`;
    }
    return users;
  }
}

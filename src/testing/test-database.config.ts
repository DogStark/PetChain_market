import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  dropSchema: true,
};

export default testDatabaseConfig;
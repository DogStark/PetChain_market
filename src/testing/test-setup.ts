import { beforeAll, afterAll } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

export default async function setupTestingEnvironment() {
  // Initialize the testing module
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  // Set up the database connection
  const databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  await databaseService.connect();

  // Perform any necessary setup before tests
  beforeAll(async () => {
    // Add any global setup logic here
  });

  // Clean up after tests
  afterAll(async () => {
    await databaseService.disconnect();
  });
}
import { User } from '../entities/user.entity';

export const createUserFactory = (overrides: Partial<User> = {}): User => {
  const defaultUser: User = {
    id: 'default-id',
    username: 'defaultUsername',
    email: 'default@example.com',
    password: 'defaultPassword',
    // Add other default properties as needed
  };

  return { ...defaultUser, ...overrides };
};